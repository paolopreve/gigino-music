const youtubedl = require('youtube-dl-exec');
const path = require('path');
const fs = require('fs');
const ffmpegPath = require('ffmpeg-static'); // Imports the portable FFmpeg

// 1. Fix the ENOENT error by ensuring the folder always exists
const targetFolder = './music';
if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, { recursive: true });
}

function isSongAlreadyDownloaded(searchQuery) {
    if (!fs.existsSync(targetFolder)) {
        return false;
    }

    const files = fs.readdirSync(targetFolder);

    // 1. Clean the query and filter out noise words like "lyrics", "official", "video"
    const cleanQuery = searchQuery.toLowerCase()
        .replace(/lyrics|audio|official|video|hd|hq|ft|feat/g, '')
        .replace(/[^a-z0-9]/g, ' ');

    // Turn the remaining words into an array of keywords (ignoring tiny words <= 2 chars)
    const queryKeywords = cleanQuery.split(/\s+/).filter(word => word.length > 2);

    if (queryKeywords.length === 0) return false;

    for (const file of files) {
        const fileNameWithoutExt = path.parse(file).name.toLowerCase();
        const cleanFileName = fileNameWithoutExt.replace(/[^a-z0-9]/g, ' ');

        // 2. Count how many keywords from our search query exist in this file name
        let matchCount = 0;
        for (const keyword of queryKeywords) {
            if (cleanFileName.includes(keyword)) {
                matchCount++;
            }
        }

        // 3. If 70% or more of the keywords match, consider it already downloaded
        const matchRatio = matchCount / queryKeywords.length;
        if (matchRatio >= 0.7) {
            return true;
        }
    }

    return false;
}

async function downloadMp3(url) {
    const outputPath = path.join(targetFolder, '%(title)s.%(ext)s');
    console.log(`Downloading and converting: ${url}`);

    try {
        await youtubedl(url, {
            extractAudio: true,
            audioFormat: 'mp3',
            audioQuality: '192K',
            output: outputPath,
            noWarnings: true,
            ffmpegLocation: ffmpegPath // 2. Tell yt-dlp where to find FFmpeg
        });
        console.log(`Download complete! Saved to ${targetFolder}`);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

async function downloadSongs(songs) {
    const outputPath = path.join(targetFolder, '%(title)s.%(ext)s');

    // Start background downloads
    for (const searchQuery of songs) {
        if (isSongAlreadyDownloaded(searchQuery)) {
            console.log(`Skipped (already exists): ${searchQuery}`);
            continue; // Skip to the next iteration of the loop
        }
        console.log(`Downloading: ${searchQuery}`);
        try {
            await youtubedl(`ytsearch1:${searchQuery}`, {
                extractAudio: true,
                audioFormat: 'mp3',
                audioQuality: '192K',
                output: outputPath,
                noWarnings: true,
                ffmpegLocation: ffmpegPath // 2. Tell yt-dlp where to find FFmpeg
            });
            console.log(`Finished: ${searchQuery}`);
        } catch (error) {
            console.error(`Failed to download ${searchQuery}`);
        }
    }
    console.log('All downloads complete!');
}

module.exports = { downloadMp3, downloadSongs };