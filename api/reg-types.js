const axios = require('axios');
const getToken = require('../utils/getToken');

const getRegtypes = async (token, eventId) => {
    const response = await axios.get(
        `https://api.swoogo.com/api/v1/reg-types?event_id=${eventId}`,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        }
    );
    return response.data;
};

module.exports = async (req, res) => {
    const eventId = req.query.event_id || '219985';
    try {
        const token = await getToken();
        const regtypes = await getRegtypes(token, eventId);
        res.status(200).json(regtypes);
    } catch (error) {
        console.error('Error fetching reg types:', error);
        res.status(500).json({ error: 'Failed to fetch reg types' });
    }
};
