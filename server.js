const express = require('express');
const { Readable } = require('stream');
const { downloadMp3, downloadSongs } = require('./downloader');
const { upload, uploadCsvToMemory } = require('./uploader.js');
const csv = require('csv-parser');
const fs = require('fs');
const app = express();
const PORT = 3000;

// Serve static frontend files from the 'public' directory
app.use(express.json());
app.use(express.static('public'));
app.use('/media', express.static('music'));

app.get('/api/songs', (req, res) => {
    const folderPath = './music'; // Change to './downloads' if that's where your songs are

    // Read the contents of the folder
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error("Error reading directory:", err);
            return res.status(500).json({ error: 'Failed to load songs' });
        }

        // Optional: Filter out hidden files or non-mp3s
        const songs = files.filter(file => file.endsWith('.mp3'));

        // Send the list of filenames to the frontend
        res.status(200).json({ songs: songs });
    });
});

app.post('/api/process-csv', uploadCsvToMemory.single('csvFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No CSV file received. Check your formData key.' });
    }

    const songs = [];

    // Convert the memory buffer into a stream that csv-parser can read
    Readable.from(req.file.buffer)
        .pipe(csv())
        .on('data', (row) => {
            if (row['Track Name'] && row['Artist Name(s)']) {
                songs.push(`${row['Track Name']} ${row['Artist Name(s)']} lyrics`);
            }
        })
        .on('end', async () => {
            // Instantly reply to the frontend
            res.status(200).json({ message: `Started downloading ${songs.length} songs!` });

            await downloadSongs(songs);
        });
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