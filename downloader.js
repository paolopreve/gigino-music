const youtubedl = require('youtube-dl-exec');
const path = require('path');
const fs = require('fs');
const ffmpegPath = require('ffmpeg-static');
const NodeID3 = require('node-id3'); // 1. Import the tagger

const targetFolder = '/app/music';
if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, { recursive: true });
}

function cleanSongTitle(rawTitle) {
    let title = rawTitle
        .replace(/\s*[\[\(\{].*?(lyrics?|official|video|audio|remaster(ed)?|hd|hq|4k|visualizer).*?[\]\)\}]/gi, '')
        .replace(/\s*[-|/]\s*(official|video|audio|lyrics?|music video)\b.*/gi, '')
        .replace(/\b(lyrics?|official|audio|video)\b/gi, '')
        .replace(/[\\:*?"<>|]/g, '') // Keep hyphens for the tagger to read!
        .replace(/\s+/g, ' ')
        .trim();
        
    return title || 'Unknown_Song';
}

function isSongAlreadyDownloaded(searchQuery) {
    if (!fs.existsSync(targetFolder)) return false;

    // Predict the exact file name your app will generate
    const expectedName = cleanSongTitle(searchQuery).toLowerCase();
    
    // Read the folder contents
    const files = fs.readdirSync(targetFolder);
    
    // Check if the exact filename exists (case-insensitive)
    for (const file of files) {
        if (file.toLowerCase() === `${expectedName}.mp3`) {
            return true; 
        }
    }
    
    return false;
}
// Add playlistName as the third parameter
// Add an optional 'playlistCreator' parameter (defaults to "Gigino")
function injectTags(finalName, outputPath, playlistName, playlistCreator = "gigino-music") {
    let tags = {};
    const splitIndex = finalName.indexOf(' - ');
    
    if (splitIndex !== -1) {
        tags.artist = finalName.substring(0, splitIndex).trim();
        tags.title = finalName.substring(splitIndex + 3).trim();
    } else {
        tags.title = finalName.trim();
        tags.artist = "Unknown Artist"; 
    }
    
    // Set the Album name (Playlist name)
    tags.album = playlistName ? playlistName : "Gigino Downloads";
    
    // TRICK PLAYERS WITH WHO MADE IT: 
    // 'performerInfo' writes to the Album Artist (TPE2) tag field
    tags.performerInfo = playlistCreator; 
    
    NodeID3.write(tags, outputPath);
    console.log(`Injected Tags -> Artist: "${tags.artist}", Album: "${tags.album}", Album Artist: "${tags.performerInfo}", Title: "${tags.title}"`);
}

async function downloadMp3(url) {
    try {
        const info = await youtubedl(url, { dumpSingleJson: true, noWarnings: true });
        const finalName = cleanSongTitle(info.title);

        if (isSongAlreadyDownloaded(finalName)) {
            console.log(`Skipped (already exists): ${finalName}`);
            return;
        }

        const outputPath = path.join(targetFolder, `${finalName}.%(ext)s`);
        const finalFilePath = path.join(targetFolder, `${finalName}.mp3`); // Exact path for ID3

        await youtubedl(url, {
            extractAudio: true,
            audioFormat: 'mp3',
            audioQuality: '192K',
            output: outputPath,
            noWarnings: true,
            ffmpegLocation: ffmpegPath
        });
        
        injectTags(finalName, finalFilePath); // Inject tags here
        console.log(`Download complete! Saved as ${finalName}.mp3`);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

async function downloadSongs(songs, playlistName = null) {
    const playlistFiles = []; // Track files for the M3U

    for (const searchQuery of songs) {
        const finalName = cleanSongTitle(searchQuery);
        const fileName = `${finalName}.mp3`;
        
        if (isSongAlreadyDownloaded(searchQuery)) {
            console.log(`Skipped (already exists): ${searchQuery}`);
            playlistFiles.push(fileName); // Add to playlist even if skipped
            continue; 
        }
        
        const outputPath = path.join(targetFolder, `${finalName}.%(ext)s`);
        const finalFilePath = path.join(targetFolder, fileName);

        console.log(`Downloading: ${finalName}`);
        try {
            await youtubedl(`ytsearch1:${searchQuery}`, {
                extractAudio: true,
                audioFormat: 'mp3',
                audioQuality: '192K',
                output: outputPath,
                noWarnings: true,
                ffmpegLocation: ffmpegPath 
            });
            
            injectTags(finalName, finalFilePath, playlistName);
            playlistFiles.push(fileName); // Add to playlist after successful download
            console.log(`Finished: ${finalName}`);
        } catch (error) {
            console.error(`Failed to download ${searchQuery}`);
        }
    }
    
    // Create the M3U file if a playlist name was provided
    if (playlistName && playlistFiles.length > 0) {
        // Sanitize the playlist name to prevent file system errors
        const safePlaylistName = playlistName.replace(/[\\/:*?"<>|]/g, '').trim();
        const m3uPath = path.join(targetFolder, `${safePlaylistName}.m3u`);
        
        // Write the filenames separated by newlines
        fs.writeFileSync(m3uPath, playlistFiles.join('\n'), 'utf8');
        console.log(`Playlist file created: ${safePlaylistName}.m3u`);
    }

    console.log('All downloads complete!');
}

module.exports = { downloadMp3, downloadSongs };