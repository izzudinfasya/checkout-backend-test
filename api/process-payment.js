const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    const { token, amount } = req.body;

    try {
        const charge = await stripe.charges.create({
            amount: amount,
            currency: "cad",
            source: token,
            description: "Test charge",
        });

        res.status(200).json({ success: true, nextStep: 'confirmation' });
    } catch (error) {
        console.error("Payment failed:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}
