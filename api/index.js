const express = require('express');
const cors = require('cors');
const app = express();

// CORS middleware
app.use(cors());

// Middleware to handle JSON
app.use(express.json());

// Defining routes
app.get('/', (req, res) => {
    res.send('Hello from Express on Vercel!');
});

// Fallback route for API
app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from API!' });
});

// You can add other routes as needed, for example:
// app.get('/api/events', (req, res) => { ... });

module.exports = (req, res) => {
    // Handling the request and response using Express
    app(req, res); // Passing request and response to Express
};
