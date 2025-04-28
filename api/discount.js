const getToken = require('../utils/getToken');
const getDiscount = require('../utils/getDiscount');
const allowCors = require('../utils/allowCors');
const basicAuth = require('../utils/authenticate');

const handler = async (req, res) => {
    const isAuthenticated = basicAuth(req, res);
    if (!isAuthenticated) {
        return;
    }

    const eventId = req.query.event_id || '219985';
    try {
        const token = await getToken();
        const discounts = await getDiscount(token, eventId);
        res.status(200).json(discounts);
    } catch (error) {
        console.error('Error fetching discounts:', error);
        res.status(500).json({ error: 'Failed to fetch discounts' });
    }
};

module.exports = allowCors(handler);
