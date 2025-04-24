const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello from Express on Vercel!');
});

module.exports = (req, res) => {
    app(req, res);
};
