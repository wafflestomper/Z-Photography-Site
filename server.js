require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static('.'));

// Instagram token endpoint
app.get('/api/instagram-token', (req, res) => {
    const token = process.env.IG_ACCESS_TOKEN;
    console.log('Token available:', !!token); // Will log true if token exists
    res.json({ token: token });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('Environment variables loaded:', !!process.env.IG_ACCESS_TOKEN);
}); 