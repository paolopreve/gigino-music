const youtubedl = require('youtube-dl-exec');
const path = require('path');

async function downloadMp3(url) {
    const targetFolder = './music';
    const outputPath = path.join(targetFolder, '%(title)s.%(ext)s');
    console.log(`Downloading and converting: ${url}`);

    try {
        await youtubedl(url, {
            extractAudio: true,
            audioFormat: 'mp3',
            audioQuality: '192K',
            output: outputPath,
            noWarnings: true
        });
        console.log(`Download complete! Saved to ${targetFolder}`);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

async function downloadSongs(songs) {
    const targetFolder = './music';
    const outputPath = path.join(targetFolder, '%(title)s.%(ext)s');
    // Start background downloads
    for (const searchQuery of songs) {
        console.log(`Downloading: ${searchQuery}`);
        try {
            await youtubedl(`ytsearch1:${searchQuery}`, {
                extractAudio: true,
                audioFormat: 'mp3',
                audioQuality: '192K',
                output: outputPath,
                noWarnings: true
            });
            console.log(`Finished: ${searchQuery}`);
        } catch (error) {
            console.error(`Failed to download ${searchQuery}`);
        }
    }
    console.log('All CSV downloads complete!');
}

module.exports = { downloadMp3 };
module.exports = { downloadSongs };