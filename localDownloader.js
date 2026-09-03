const fs = require('fs');
const { ZipArchive } = require('archiver'); // NEW V8 IMPORT
const path = require('path');

function streamPlaylistZip(playlistName, targetFolder, res) {
    try {
        // 1. Intercept the special "All Songs" flag
        if (playlistName === "ALL_SONGS_DOWNLOAD") {
            const folderName = "All_My_Music";
            res.attachment(`${folderName}.zip`);
            
            // NEW V8 INITIALIZATION
            const archive = new ZipArchive({ zlib: { level: 9 } });
            
            archive.on('warning', function (err) {
                if (err.code === 'ENOENT') console.warn("Archiver warning:", err);
                else console.error("Archiver warning:", err);
            });

            archive.on('error', function (err) {
                console.error("Archiver error:", err);
                if (!res.headersSent) res.status(500).send("Error generating zip file.");
            });
            
            archive.pipe(res);
            
            const allFiles = fs.readdirSync(targetFolder);
            const allMp3s = allFiles.filter(f => f.endsWith('.mp3'));
            
            for (const fileName of allMp3s) {
                const filePath = path.join(targetFolder, fileName);
                archive.file(filePath, { name: `${folderName}/${fileName}` });
            }
            
            return archive.finalize();
        }

        // 2. Standard single playlist logic
        const safeName = playlistName.replace(/[\\/:*?"<>|]/g, '').trim();
        const m3uPath = path.join(targetFolder, `${safeName}.m3u`);

        if (!fs.existsSync(m3uPath)) {
            return res.status(404).send("Playlist not found on the server.");
        }

        const m3uContent = fs.readFileSync(m3uPath, 'utf8');
        const mp3Files = m3uContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        res.attachment(`${safeName}.zip`);
        
        // NEW V8 INITIALIZATION
        const archive = new ZipArchive({ zlib: { level: 9 } });
        
        archive.on('warning', function (err) {
            if (err.code === 'ENOENT') console.warn("Archiver warning:", err);
            else console.error("Archiver warning:", err);
        });

        archive.on('error', function (err) {
            console.error("Archiver error:", err);
            if (!res.headersSent) res.status(500).send("Error generating zip file.");
        });

        archive.pipe(res);

        archive.file(m3uPath, { name: `${safeName}/${safeName}.m3u` });

        for (const fileName of mp3Files) {
            const filePath = path.join(targetFolder, fileName);
            if (fs.existsSync(filePath)) {
                archive.file(filePath, { name: `${safeName}/${fileName}` });
            } else {
                console.warn(`File missing, skipping in zip: ${fileName}`);
            }
        }

        archive.finalize();
        
    } catch (error) {
        console.error("Zipping failed:", error);
        if (!res.headersSent) {
            res.status(500).send("An error occurred while setting up the zip.");
        }
    }
}

module.exports = { streamPlaylistZip };