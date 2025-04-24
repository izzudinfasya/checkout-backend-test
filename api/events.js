import axios from 'axios';

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

export default async function handler(req, res) {
    try {
        const token = await getToken();
        const events = await getEvents(token);
        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
}
