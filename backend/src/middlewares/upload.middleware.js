// middlewares/upload.js
const multer = require('multer')

const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 5 * 1024 * 1024 } // giới hạn 5MB
})

module.exports = { upload }
