const { Router } = require('express')
const { CategoryController } = require('../controllers/category.controller')
const { rateLimitMiddleware } = require('../middlewares/rateLimit.middleware')
const router = Router()

router.post('/', rateLimitMiddleware, CategoryController.createMany)
router.get('/', CategoryController.list)
router.get('/:id', CategoryController.getById)
router.put('/:id', rateLimitMiddleware, CategoryController.update)
router.delete('/', CategoryController.deleteMany)

module.exports = router
