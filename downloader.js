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

module.exports = { downloadMp3 };