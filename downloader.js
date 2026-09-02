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

    const files = fs.readdirSync(targetFolder);
    const cleanQuery = searchQuery.toLowerCase()
        .replace(/lyrics|audio|official|video|hd|hq|ft|feat/g, '')
        .replace(/[^a-z0-9]/g, ' ');

    const queryKeywords = cleanQuery.split(/\s+/).filter(word => word.length > 2);
    if (queryKeywords.length === 0) return false;

    for (const file of files) {
        const cleanFileName = path.parse(file).name.toLowerCase().replace(/[^a-z0-9]/g, ' ');
        let matchCount = 0;
        for (const keyword of queryKeywords) {
            if (cleanFileName.includes(keyword)) matchCount++;
        }
        if (matchCount / queryKeywords.length >= 0.7) return true;
    }
    return false;
}

// 2. Helper function to write internal MP3 tags
function injectTags(finalName, outputPath) {
    const parts = finalName.split('-');
    let tags = {};
    
    // If the name has a hyphen (Artist - Song), split it into proper tags
    if (parts.length >= 2) {
        tags.artist = parts[0].trim();
        tags.title = parts.slice(1).join('-').trim();
    } else {
        tags.title = finalName.trim();
    }
    
    // Force the metadata directly into the file
    NodeID3.write(tags, outputPath);
    console.log(`Injected ID3 Tags -> Artist: "${tags.artist || 'Unknown'}", Title: "${tags.title}"`);
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

async function downloadSongs(songs) {
    for (const searchQuery of songs) {
        if (isSongAlreadyDownloaded(searchQuery)) {
            console.log(`Skipped (already exists): ${searchQuery}`);
            continue; 
        }
        
        const finalName = cleanSongTitle(searchQuery);
        const outputPath = path.join(targetFolder, `${finalName}.%(ext)s`);
        const finalFilePath = path.join(targetFolder, `${finalName}.mp3`);

        try {
            await youtubedl(`ytsearch1:${searchQuery}`, {
                extractAudio: true,
                audioFormat: 'mp3',
                audioQuality: '192K',
                output: outputPath, 
                noWarnings: true,
                ffmpegLocation: ffmpegPath 
            });
            
            injectTags(finalName, finalFilePath); // Inject tags here
            console.log(`Finished: ${finalName}`);
        } catch (error) {
            console.error(`Failed to download ${searchQuery}`);
        }
    }
    console.log('All downloads complete!');
}

module.exports = { downloadMp3, downloadSongs };