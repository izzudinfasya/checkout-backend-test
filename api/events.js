const getToken = require('../../utils/getToken');
const getEvents = require('../../utils/getEvents');
const allowCors = require('../../utils/allowCors');

const isValidEventId = (id) => {
    return id && typeof id === 'string' && id.trim().length > 0;
};


const handler = async (req, res) => {

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed. Use GET.' });
    }

    try {
        let eventId = null;
        if (req.url) {
            const match = req.url.match(/^\/api\/events\/([^\/\?]+)/);
            if (match) {
                eventId = match[1];
            }
        }

        if (eventId && !isValidEventId(eventId)) {
            return res.status(400).json({ error: 'Invalid event ID' });
        }

        const token = await getToken();
        if (!token) {
            console.error('Failed to retrieve token');
            return res.status(500).json({ error: 'Authentication failed' });
        }

        if (eventId) {
            const event = await getEvents(token, eventId);
            if (!event) {
                return res.status(404).json({ error: `Event with ID ${eventId} not found` });
            }
            return res.status(200).json(event);
        } else {
            const events = await getEvents(token);
            if (!events) {
                return res.status(404).json({ error: 'No events found' });
            }
            return res.status(200).json(events);
        }
    } catch (error) {
        console.error('Error in events handler:', {
            message: error.message,
            stack: error.stack,
            url: req.url,
            eventId,
        });
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = allowCors(handler);