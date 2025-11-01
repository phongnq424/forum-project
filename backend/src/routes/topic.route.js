const { Router } = require('express')
const { TopicController } = require('../controllers/topic.controller')
const router = Router()

router.post('/', TopicController.create)
router.get('/', TopicController.list)
router.get('/:id', TopicController.getById)
router.put('/:id', TopicController.update)
router.delete('/:id', TopicController.delete)

module.exports = router
