const axios = require('axios');
const getToken = require('../utils/getToken');

module.exports = async (req, res) => {
    try {
        const token = await getToken();
        const eventId = req.query.event_id || '219985';
        const response = await axios.get(
            `https://api.swoogo.com/api/v1/discounts?event_id=${eventId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            }
        );
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching discounts:', error);
        res.status(500).json({ error: 'Failed to fetch discounts' });
    }
};
