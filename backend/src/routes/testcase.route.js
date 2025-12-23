// routes/testcase.route.js
const { Router } = require('express');
const { TestcaseController } = require('../controllers/testcase.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { uploadZip } = require('../middlewares/uploadTestcase.middleware');

const router = Router();

// Upload zip testcases
router.post(
    '/:challenge_id/upload-zip',
    uploadZip.single('zipfile'),
    TestcaseController.createFromZip
);

// List / Update / Delete
router.get('/:challenge_id', verifyToken, TestcaseController.listByChallenge);
router.put('/:id', verifyToken, TestcaseController.update);
router.delete('/:id', verifyToken, TestcaseController.delete);

module.exports = router;
