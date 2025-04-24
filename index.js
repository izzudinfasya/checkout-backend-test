const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

// Token generator
const getToken = async () => {
    try {
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
    } catch (error) {
        console.error('Token error:', error.response?.data || error.message);
        throw new Error('Failed to get token');
    }
};

// Swoogo API Fetchers
const getEvents = async (token) => {
    const response = await axios.get(
        'https://api.swoogo.com/api/v1/events?fields=capacity,close_date,close_time,created_at,created_by,description,end_date,end_time,folder_id,free_event,hashtag,id,name,organizer_id,start_date,start_time,status,target_attendance,timezone,type_id,updated_at,updated_by,url,webinar_url',
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        }
    );

    return response.data;
};

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

const getRegistrants = async (token, eventId) => {
    const response = await axios.get(
        `https://api.swoogo.com/api/v1/registrants?event_id=${eventId}`,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        }
    );

    return response.data;
};

const getDiscounts = async (token, eventId) => {
    const response = await axios.get(
        `https://api.swoogo.com/api/v1/discounts?event_id=${eventId}&fields=absolute_discount,applicable_line_items,capacity,code,created_at,custom_fees,event_id,id,notes,percentage_discount,sold_out_message,type,updated_at`,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        }
    );

    return response.data;
};

// Routes
// Routes
app.get('/events', async (req, res) => {
    try {
        const token = await getToken();
        const events = await getEvents(token);
        res.json(events);
    } catch (error) {
        console.error('Events error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

app.get('/reg-types', async (req, res) => {
    try {
        const token = await getToken();
        const eventId = req.query.event_id || '219985';
        const regtypes = await getRegtypes(token, eventId);
        res.json(regtypes);
    } catch (error) {
        console.error('RegTypes error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch reg types' });
    }
});

app.get('/registrants', async (req, res) => {
    try {
        const token = await getToken();
        const eventId = req.query.event_id || '219985';
        const registrants = await getRegistrants(token, eventId);
        res.json(registrants);
    } catch (error) {
        console.error('Registrants error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch registrants' });
    }
});

app.get('/discounts', async (req, res) => {
    try {
        const token = await getToken();
        const eventId = req.query.event_id || '219985';
        const discounts = await getDiscounts(token, eventId);
        res.json(discounts);
    } catch (error) {
        console.error('Discounts error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch discounts' });
    }
});


// Stripe payment handler
app.post('/process-payment', async (req, res) => {
    const { token, amount } = req.body;

    try {
        const charge = await stripe.charges.create({
            amount: amount,
            currency: "cad",
            source: token,
            description: "Test charge",
        });

        res.status(200).json({ success: true, nextStep: 'confirmation' });
    } catch (error) {
        console.error("Payment failed:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
