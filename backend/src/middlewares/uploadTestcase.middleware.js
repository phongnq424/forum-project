// middlewares/uploadTestcase.js
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const baseDir = 'private/testcases';

if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(baseDir, req.params.challenge_id);
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, 'testcases.zip');
    }
});

const uploadZip = multer({
    storage,
    limits: { fileSize: 500 * 1024 * 1024 } // 500MB max
});

module.exports = { uploadZip };
