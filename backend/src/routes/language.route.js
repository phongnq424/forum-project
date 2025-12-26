const { Router } = require('express');
const { LanguageController } = require('../controllers/language.controller');
const { cache } = require("../middlewares/cache.middleware");
const { verifyToken } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");

const router = Router();

router.get('/', cache, LanguageController.list);
router.get('/:id', cache, LanguageController.getById);
router.post('/', verifyToken, requireRole('ADMIN'), LanguageController.createMany);
router.put('/:id', verifyToken, requireRole('ADMIN'), LanguageController.update);
router.delete('/', verifyToken, requireRole('ADMIN'), LanguageController.removeMany);

module.exports = router;
