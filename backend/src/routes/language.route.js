const { Router } = require('express');
const { LanguageController } = require('../controllers/language.controller');
const { verifyToken } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");

const router = Router();

router.get('/', LanguageController.list);
router.get('/:id', LanguageController.getById);
router.post('/', verifyToken, requireRole('ADMIN'), LanguageController.createMany);
router.put('/:id', verifyToken, requireRole('ADMIN'), LanguageController.update);
router.delete('/', verifyToken, requireRole('ADMIN'), LanguageController.removeMany);

module.exports = router;
