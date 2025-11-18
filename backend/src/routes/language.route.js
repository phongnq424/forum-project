const { Router } = require('express');
const { LanguageController } = require('../controllers/language.controller');

const router = Router();

router.get('/', LanguageController.list);
router.get('/:id', LanguageController.getById);


module.exports = router
