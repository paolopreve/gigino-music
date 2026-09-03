const express = require('express');
const { Readable } = require('stream');
const { downloadMp3, downloadSongs } = require('./downloader');
const { upload, uploadCsvToMemory } = require('./uploader.js');
const csv = require('csv-parser');
const fs = require('fs');
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

        res.status(200).json({ message: `Started downloading ${songs.length} songs from ${playlistTitle}!` });
        // Pass the title to generate the .m3u file
        await downloadSongs(songs, playlistTitle);

        res.status(200).json({ message: 'Download successful!' });
    } catch (error) {
        console.error('Error during download:', error);
        res.status(500).json({ error: 'Failed to download the playlist' });
    }
});

app.get('/api/download-existing-playlist', (req, res) => {
    const playlistName = req.query.name;
    if (!playlistName) return res.status(400).send("No playlist name provided.");

    // Ensure the filename is safe to look up
    const safeName = playlistName.replace(/[\\/:*?"<>|]/g, '').trim();
    const m3uPath = path.join('/app/music', `${safeName}.m3u`);

    if (!fs.existsSync(m3uPath)) {
        return res.status(404).send("Playlist not found on the server.");
    }

    try {
        // Read the M3U file to find which MP3s belong to this playlist
        const m3uContent = fs.readFileSync(m3uPath, 'utf8');
        const mp3Files = m3uContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        // Tell the browser to expect a ZIP download
        res.attachment(`${safeName}.zip`);
        
        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.on('error', (err) => { throw err; });
        archive.pipe(res);

        // 1. Add the playlist info file itself to the zip
        archive.file(m3uPath, { name: `${safeName}.m3u` });

        // 2. Add every MP3 referenced in the playlist to the zip
        for (const fileName of mp3Files) {
            const filePath = path.join('/app/music', fileName);
            if (fs.existsSync(filePath)) {
                archive.file(filePath, { name: fileName });
            } else {
                console.warn(`File missing from server, skipping in zip: ${fileName}`);
            }
        }

        // Finalize and send the stream
        archive.finalize();
    } catch (error) {
        console.error("Zipping existing playlist failed:", error);
        res.status(500).send("An error occurred while zipping the files.");
    }
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