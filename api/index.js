const express = require('express');
const serverless = require('serverless-http');

const app = express();

app.get('/hello', (req, res) => {
    res.json({ message: 'Hello from Vercel serverless!' });
});

module.exports.handler = serverless(app);
