const getToken = require('../utils/getToken');
const getEvents = require('../utils/getEvents');
const allowCors = require('../utils/allowCors');
const basicAuth = require('./basic-auth');

const handler = async (req, res) => {
    const isAuthenticated = basicAuth(req, res);
    if (!isAuthenticated) {
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { eventId } = req.query;
        const token = await getToken();
        const event = await getEvents(token, eventId);

        return res.status(200).json(event);
    } catch (error) {
        console.error('Error fetching events:', error);
        return res.status(500).json({ error: 'Failed to fetch events' });
    }
};

module.exports = allowCors(handler);
