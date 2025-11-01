const { Router } = require('express')
const { CategoryController } = require('../controllers/category.controller')
const router = Router()

router.post('/', CategoryController.createMany)
router.get('/', CategoryController.list)
router.get('/:id', CategoryController.getById)
router.put('/:id', CategoryController.update)
router.delete('/many', CategoryController.deleteMany)

module.exports = router
