const express = require('express');
const { downloadMp3 } = require('./downloader');
const { upload } = require('./uploader.js');
const app = express();
const PORT = 3000;

// Serve static frontend files from the 'public' directory
app.use(express.json());
app.use(express.static('public'));

// Create a backend API route
app.get('/api/message', (req, res) => {
    res.json({ text: "Hello from the Node.js backend!" });
});

app.post('/api/download', async (req, res) => {
    const videoUrl = req.body.url;
    if (!videoUrl) {
        return res.status(400).json({ error: 'Please provide a YouTube URL' });
    }
    try {
        await downloadMp3(videoUrl);
        
        res.status(200).json({ message: 'Download successful!' });
    } catch (error) {
        console.error('Error during download:', error);
        res.status(500).json({ error: 'Failed to download the video' });
    }
});

app.post('/api/upload', upload.single('musicFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file received' });
    }
    
    res.status(200).json({ message: `Saved as ${req.file.filename}` });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});