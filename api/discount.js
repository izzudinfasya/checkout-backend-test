const getToken = require('../utils/getToken');
const getDiscount = require('../utils/getDiscount');

module.exports = async (req, res) => {
    const eventId = req.query.event_id || '219985';
    try {
        const token = await getToken();  // Get the token
        const discounts = await getDiscount(token, eventId);
        res.status(200).json(discounts);
    } catch (error) {
        console.error('Error fetching discounts:', error);
        res.status(500).json({ error: 'Failed to fetch discounts' });
    }
};
