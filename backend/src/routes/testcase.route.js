// routes/testcase.route.js
const { Router } = require('express');
const { TestcaseController } = require('../controllers/testcase.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { uploadZip } = require('../middlewares/uploadTestcase.middleware');
const { cache } = require('../middlewares/cache.middleware');
const { requireRole } = require("../middlewares/role.middleware");

const router = Router();

// Upload zip testcases
router.post('/:challenge_id/upload-zip', verifyToken, requireRole('ADMIN'), uploadZip.single('zipfile'), TestcaseController.createFromZip);

// List / Update / Delete
router.get('/:challenge_id', verifyToken, requireRole('ADMIN'), cache, TestcaseController.listByChallenge);
router.put('/:id', verifyToken, requireRole('ADMIN'), TestcaseController.update);
router.delete('/:id', verifyToken, requireRole('ADMIN'), TestcaseController.delete);

module.exports = router;
