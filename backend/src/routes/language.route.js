const { Router } = require('express');
const { LanguageController } = require('../controllers/language.controller');

const router = Router();

router.get('/', LanguageController.list);
router.get('/:id', LanguageController.getById);
router.post('/', LanguageController.createMany);
router.put('/:id', LanguageController.update);
router.delete('/', LanguageController.removeMany);

module.exports = router;
