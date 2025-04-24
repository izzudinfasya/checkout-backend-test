const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: 'http://checkouttest.financialdigitalmarketingevents.com',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.get('/', (req, res) => {
    res.send('Hello from Express on Vercel!');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
