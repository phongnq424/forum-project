const { Router } = require('express');
const { ChallengeController } = require('../controllers/challenge.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = Router();

router.post('/', verifyToken, ChallengeController.create);
router.get('/', ChallengeController.list);
router.get('/:id', ChallengeController.getById);
router.put('/:id', verifyToken, ChallengeController.update);
router.delete('/:id', verifyToken, ChallengeController.delete);

module.exports = router
