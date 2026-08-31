const multer = require('multer');
const fs = require('fs');

const uploadDir = './music';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); 
    },
    filename: (req, file, cb) => {
        // 1. Fix the encoding mismatch (Latin1 to UTF8)
        const decodedName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        
        // 2. Remove characters that are illegal on Windows/Mac file systems (like '?')
        const safeName = decodedName.replace(/[<>:"/\\|?*]/g, '');

        // 3. Add the timestamp
        cb(null, Date.now() + '-' + safeName);
    }
});

// Configure Multer and export it directly as middleware
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // Optional: limit to 50MB
});

module.exports = { upload };