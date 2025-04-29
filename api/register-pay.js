const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const getToken = require('../utils/getToken');
const postRegistrant = require('../utils/postRegistrant');
const allowCors = require('../utils/allowCors');

const handler = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    const { token, amount, participants, eventId } = req.body;
    const swoogoToken = await getToken();

    if (!token || !amount || !participants || !eventId || !swoogoToken) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        const paymentData = await stripe.charges.create({
            amount: amount,
            currency: 'cad',
            source: token,
            description: 'Event Registration Payment',
        });

        if (paymentData.status !== 'succeeded') {
            throw new Error('Payment failed.');
        }

        const registrantPromises = participants.map(participant => {
            const registrantPayload = {
                po_number: `PO-${Date.now()}`,
                payment_method: 'Credit Card',
                email: participant.email,
                event_id: eventId,
                first_name: participant.firstName,
                last_name: participant.lastName,
                registration_status: 'confirmed',
                send_email: 'true',
                discount: '',
                reg_type_id: participant.regType,
                company: participant.company,
                job_title: participant.jobTitle,
            };

            return postRegistrant(registrantPayload, swoogoToken);
        });

        const registrantResponses = await Promise.all(registrantPromises);
        const registrantResults = registrantResponses.map(r => r.data);

        res.status(200).json({
            success: true,
            paymentData,
            registrantResults,
            nextStep: 'confirmation',
        });

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.status(500).json({
            success: false,
            message: error.response ? error.response.data : error.message,
        });
    }
};

module.exports = allowCors(handler);
