const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const getToken = async () => {
    const CLIENT_ID = process.env.CLIENT_ID;
    const CLIENT_SECRET = process.env.CLIENT_SECRET;
    const encodedCredentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const body = new URLSearchParams({ grant_type: 'client_credentials' });

    const response = await axios.post(
        'https://api.swoogo.com/api/v1/oauth2/token',
        body,
        {
            headers: {
                'Authorization': `Basic ${encodedCredentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
            },
        }
    );

    return response.data.access_token;
};

const getEvents = async (token) => {
    const response = await axios.get(
        'https://api.swoogo.com/api/v1/events?fields=id,title,start_date,end_date',
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        }
    );
    return response.data;
};

// Default route
app.get('/', (req, res) => {
    res.send('Hello from Express on Vercel!');
});

// Route to fetch events
app.get('/events', async (req, res) => {
    try {
        const token = await getToken();
        const events = await getEvents(token);
        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching events:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
