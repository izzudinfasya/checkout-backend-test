const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const getToken = require('../utils/getToken');
const postRegistrant = require('../utils/postRegistrant');
const allowCors = require('../utils/allowCors');
const axios = require('axios');

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

    try {
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
            description: 'Event Registration Payment',
            receipt_email: email,
        });

        if (paymentData.status !== 'succeeded') {
            throw new Error('Payment failed.');
        }

        temporaryPaymentId = paymentData.id;

        const allParticipants = Object.values(participants).flat();

        const registrantPromises = allParticipants.map(participant => {
            const registrantPayload = {
                po_number: `PO-${Date.now()}`,
                email: participant.email,
                event_id: eventId,
                first_name: participant.firstName,
                last_name: participant.lastName,
                registration_status: 'confirmed',
                send_email: 'true',
                discount_code: participant.discount || '',
                reg_type_id: participant.regType,
                company: participant.company,
                job_title: participant.jobTitle,
                work_phone: participant.phone,
                country: participant.country,
                state: participant.state
            };

            return postRegistrant(swoogoToken, registrantPayload);
        });

        const registrantResponses = await Promise.all(registrantPromises);
        const registrantResults = registrantResponses.map(r => r.data);

        if (registrantResults.some(result => result.success === false)) {
            await stripe.refunds.create({
                charge: temporaryPaymentId,
            });

            return res.status(400).json({
                success: false,
                message: 'Registration failed for one or more participants, charge refunded.',
            });
        }

        return res.status(200).json({
            success: true,
            paymentData,
            registrantResults,
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
