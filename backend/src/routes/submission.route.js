const { Router } = require('express');
const { SubmissionController } = require('../controllers/submission.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = Router();

router.post('/', verifyToken, SubmissionController.submit);
router.get('/:id', verifyToken, SubmissionController.getById);
router.get('/challenge/:challenge_id', SubmissionController.listByChallenge);

module.exports = router
