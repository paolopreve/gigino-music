const express = require('express');
const app = express();
const PORT = 3000;

// Serve static frontend files from the 'public' directory
app.use(express.json());
app.use(express.static('public'));

// Create a backend API route
app.get('/api/message', (req, res) => {
    res.json({ text: "Hello from the Node.js backend!" });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});