const getToken = require('../utils/getToken');
const getEvents = require('../utils/getEvents');
const allowCors = require('../utils/allowCors');

const handler = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { eventId } = req.query;

        const token = await getToken();

        if (eventId) {
            const event = await getEvents(token, eventId);
            return res.status(200).json(event);
        } else {
            const events = await getEvents(token);
            return res.status(200).json(events);
        }
    } catch (error) {
        console.error('Error fetching events:', error);
        return res.status(500).json({ error: 'Failed to fetch events' });
    }
};

module.exports = allowCors(handler);
