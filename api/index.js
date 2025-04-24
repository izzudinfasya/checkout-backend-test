const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello from Express on Vercel!');
});

app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from API!' });
});

module.exports = (req, res) => {
    app(req, res);
};
