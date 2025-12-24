const { Router } = require('express');
const { InternalTestcaseController } = require('../controllers/internal.testcase.controller');
const { verifyInternalToken } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/testcases', verifyInternalToken, InternalTestcaseController.getByIds);
router.get('/testcases/by-challenge/:challengeId', verifyInternalToken, InternalTestcaseController.getByChallenge);

module.exports = router;
