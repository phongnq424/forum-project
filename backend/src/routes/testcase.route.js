const { Router } = require('express');
const { TestcaseController } = require('../controllers/testcase.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = Router();

router.post('/:challenge_id', verifyToken, TestcaseController.createMany);
router.get('/:challenge_id', verifyToken, TestcaseController.listByChallenge);
router.put('/:id', verifyToken, TestcaseController.update);
router.delete('/:id', verifyToken, TestcaseController.delete);

module.exports = router
