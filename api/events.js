const getToken = require('../utils/getToken');
const getEvents = require('../utils/getEvents');
const allowCors = require('../utils/allowCors');

const handler = async (req, res) => {
    try {
        const { eventId } = req.query;
        const token = await getToken();
        const events = await getEvents(token, eventId);
        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
};

module.exports = allowCors(handler);
