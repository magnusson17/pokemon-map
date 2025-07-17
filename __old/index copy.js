const express = require('express');
const path = require('path');
const serverless = require('serverless-http');

const app = express();

if (process.env.NODE_ENV !== 'production') {
    app.use(express.static(path.join(__dirname, '..', 'public')));

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
    });

    app.get('/home', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'public', 'home.html'));
    });
} else {
    app.get('/api/hello', (req, res) => {
        res.json({ message: 'Hello from Vercel serverless!' });
    });
}

module.exports.handler = serverless(app);

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Local server at http://localhost:${PORT}`);
    });
}
