const { CategoryService } = require('../services/category.service')

const CategoryController = {
    createMany: async (req, res) => {
        try {
            const categories = req.body
            const result = await CategoryService.createMany(categories)
            return res.status(201).json(result)
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
    },

    list: async (req, res) => {
        try {
            const categories = await CategoryService.list()
            return res.status(200).json(categories)
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
    },

    getById: async (req, res) => {
        try {
            const category = await CategoryService.getById(req.params.id)
            if (!category) return res.status(404).json({ message: 'Category not found' })
            return res.status(200).json(category)
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
    },

    update: async (req, res) => {
        try {
            const updated = await CategoryService.update(req.params.id, req.body)
            return res.status(200).json(updated)
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
    },

    deleteMany: async (req, res) => {
        try {
            const { ids } = req.body
            if (!Array.isArray(ids) || ids.length === 0)
                return res.status(400).json({ message: 'ids must be a non-empty array' })
            const result = await CategoryService.deleteMany(ids)
            return res.status(200).json({ deletedCount: result.count })
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
    }
}

module.exports = { CategoryController }