const express = require('express');
const { Readable } = require('stream');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { downloadMp3, downloadSongs } = require('./downloader');
const { upload, uploadCsvToMemory } = require('./uploader.js');
const { streamPlaylistZip } = require('./localDownloader');
const { getPlaylistSongs } = require('./spotify.js');

const app = express();
const PORT = 3000;

if (!fs.existsSync('./music')) {
    fs.mkdirSync('./music');
}

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

app.get('/api/playlists', (req, res) => {
    const targetFolder = '/app/music';
    
    try {
        if (!fs.existsSync(targetFolder)) {
            return res.json({ 
                playlists: [], 
                hasSongs: false, 
                message: "No playlists are available." 
            });
        }
        
        const files = fs.readdirSync(targetFolder);
        
        // Extract playlist names
        const playlists = files
            .filter(file => file.endsWith('.m3u'))
            .map(file => path.parse(file).name);
            
        // Check if there are any MP3s to enable the "All Songs" option
        const hasSongs = files.some(file => file.endsWith('.mp3'));
        
        res.json({
            playlists: playlists,
            hasSongs: hasSongs,
            message: playlists.length > 0 ? "Playlists loaded successfully." : "No playlists are available."
        });
    } catch (error) {
        console.error("Failed to read directory:", error);
        res.status(500).json({ error: "Failed to load directory data" });
    }
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
                // Split the CSV artist cell by commas and keep the first one
                const mainArtist = row['Artist Name(s)'].split(/,|&|\bfeat\b/i)[0].trim();

                songs.push(`${mainArtist} - ${row['Track Name']} lyrics`);
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

app.post('/api/downloadSpotify', async (req, res) => {
    const spotifyUrl = req.body.url;
    if (!spotifyUrl) {
        return res.status(400).json({ error: 'Please provide a Spotify playlist link' });
    }
    
    try {
        const { playlistTitle, songs } = await getPlaylistSongs(spotifyUrl);
        if (!songs || songs.length === 0) {
            return res.status(400).json({ error: 'Please provide a public Spotify playlist link' });
        }

        // Send the SINGLE success response instantly so the UI can update
        res.status(200).json({ message: `Started downloading ${songs.length} songs from ${playlistTitle}!` });
        
        // Pass the title to generate the .m3u file in the background
        await downloadSongs(songs, playlistTitle);

        // DO NOT add a second res.status(200) here!

    } catch (error) {
        console.error('Error during download:', error);
        
        // Only send an error if the initial 200 response hasn't been sent yet
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to download the playlist' });
        }
    }
});

app.get('/api/download-existing-playlist', (req, res) => {
    const playlistName = req.query.name;
    if (!playlistName) {
        return res.status(400).send("No playlist name provided.");
    }

    // Pass the request directly to your new module
    streamPlaylistZip(playlistName, '/app/music', res);
});

app.post('/api/upload', upload.single('musicFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file received' });
    }

    res.status(200).json({ message: `Saved as ${req.file.filename}` });
});

// Start the server
// Start the server (Accessible locally and via USB tethering)
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running locally on http://localhost:${PORT}`);
    console.log(`To access from your phone, find your laptop's IPv4 address and add :${PORT}`);
});