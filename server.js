require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static('.'));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 