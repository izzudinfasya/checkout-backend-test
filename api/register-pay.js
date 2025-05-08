const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const getToken = require('../utils/getToken');
const allowCors = require('../utils/allowCors');
const axios = require('axios');
const { URLSearchParams } = require('url');

const handler = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const {
        token,
        amount,
        email,
        nameOnCard,
        billingAddressLine1,
        billingCity,
        billingCountry,
        billingPostalCode,
        participants,
        eventId
    } = req.body;

    if (!token || !amount || !participants || !eventId) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    let paymentData;
    let temporaryPaymentId;
    let swoogoToken;

    try {
        swoogoToken = await getToken();

        if (!swoogoToken) {
            throw new Error('Failed to get swoogo token');
        }

        const customer = await stripe.customers.create({
            email,
            name: nameOnCard,
            address: {
                line1: billingAddressLine1,
                city: billingCity,
                country: billingCountry,
                postal_code: billingPostalCode,
            },
            source: token,
        });

        paymentData = await stripe.charges.create({
            amount: amount,
            currency: 'cad',
            customer: customer.id,
            description: 'Event Registration Big Data Canada',
            receipt_email: email,
        });

        if (paymentData.status !== 'succeeded') {
            throw new Error('Payment failed.');
        }

        temporaryPaymentId = paymentData.id;

        const allParticipants = Object.values(participants).flat();

        const registrantPromises = allParticipants.map(async (participant) => {
            const formData = new URLSearchParams();
            formData.append('po_number', `PO-${Date.now()}`);
            formData.append('email', participant.email);
            formData.append('event_id', eventId);
            formData.append('first_name', participant.firstName);
            formData.append('last_name', participant.lastName);
            formData.append('registration_status', 'confirmed');
            formData.append('send_email', 'true');
            formData.append('discount_code', participant.discount || '');
            formData.append('reg_type_id', participant.regType);
            formData.append('company', participant.company);
            formData.append('job_title', participant.jobTitle);
            formData.append('work_phone', participant.phone);
            formData.append('country', participant.country);
            formData.append('state', participant.state);

            try {
                const response = await axios.post(
                    'https://api.swoogo.com/api/v1/registrants/create',
                    formData,
                    {
                        headers: {
                            'Authorization': `Bearer ${swoogoToken}`,
                            'Accept': 'application/json',
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                    }
                );

                return {
                    success: true,
                    data: response.data
                };
            } catch (error) {
                console.error('Registrant creation failed:', error.response?.data || error.message);
                return {
                    success: false,
                    error: error.response?.data || error.message
                };
            }
        });

        const registrantResponses = await Promise.all(registrantPromises);

        if (registrantResponses.some(result => result.success === false)) {
            await stripe.refunds.create({
                charge: temporaryPaymentId,
            });

            return res.status(400).json({
                success: false,
                message: 'Registration failed for one or more participants, charge refunded.',
                failedParticipants: registrantResponses.filter(r => !r.success),
            });
        }

        return res.status(200).json({
            success: true,
            paymentData,
            registrantResults: registrantResponses.map(r => r.data),
            nextStep: 'confirmation',
        });

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);

        if (temporaryPaymentId) {
            await stripe.refunds.create({
                charge: temporaryPaymentId,
            });
        }

        return res.status(500).json({
            success: false,
            message: error.response ? error.response.data : error.message,
        });
    }
};

module.exports = allowCors(handler);
