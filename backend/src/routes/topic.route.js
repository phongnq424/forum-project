const { Router } = require('express')
const { TopicController } = require('../controllers/topic.controller')
const { rateLimitMiddleware } = require('../middlewares/rateLimit.middleware')
const router = Router()

router.post('/', rateLimitMiddleware, TopicController.createMany)
router.get('/', TopicController.list)
router.get('/:id', TopicController.getById)
router.put('/:id', rateLimitMiddleware, TopicController.update)
router.delete('/:id', TopicController.delete)

module.exports = router
