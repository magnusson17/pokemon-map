const express = require('express')
const path = require('path')
const serverless = require('serverless-http')

const app = express()
app.use(express.static(path.join(__dirname, '..', 'public')))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'))
})

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'home.html'))
})

// Export per Vercel
module.exports.handler = serverless(app)

// Run locale solo se lanciato direttamente
if (require.main === module) {
    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`)
    })
}
