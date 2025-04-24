const getToken = require('../utils/getToken');
const getRegistrant = require('../utils/getRegistrant');

module.exports = async (req, res) => {
    const eventId = req.query.event_id || '219985';
    try {
        const token = await getToken();  // Get the token
        const registrants = await getRegistrant(token, eventId);
        res.status(200).json(registrants);
    } catch (error) {
        console.error('Error fetching registrants:', error);
        res.status(500).json({ error: 'Failed to fetch registrants' });
    }
};
