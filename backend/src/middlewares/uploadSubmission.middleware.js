const multer = require('multer');
const fs = require('fs');
const path = require('path');

const baseDir = 'private/submissions';

if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userId = req.user?.id || 'anonymous';
        const dir = path.join(baseDir, userId);
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const safeName = `${Date.now()}-${Math.random().toString(16).slice(2)}.zip`;
        cb(null, safeName);
    }
});

const uploadSubmissionZip = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype !== 'application/zip' &&
            file.mimetype !== 'application/x-zip-compressed' &&
            !file.originalname.toLowerCase().endsWith('.zip')
        ) {
            return cb(new Error('Only ZIP files are allowed'));
        }

        cb(null, true);
    }
});

module.exports = { uploadSubmissionZip };