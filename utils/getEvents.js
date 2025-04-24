const axios = require('axios');

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

    return response.data; // Return the event data
};

module.exports = getEvents;
