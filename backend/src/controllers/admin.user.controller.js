const { AdminUserService } = require('../services/admin-user.service')

const AdminUserController = {
    updateUser: async (req, res) => {
        try {
            const id = req.params.id
            if (!id) return res.status(400).json({ error: 'Invalid id' })

            const user = await AdminUserService.updateAnyUser(id, req.body)
            return res.status(200).json(user)
        } catch (error) {
            return res.status(400).json({ error: error.message })
        }
    },

    deleteUser: async (req, res) => {
        try {
            const id = req.params.id
            if (!id) return res.status(400).json({ error: 'Invalid id' })

            await AdminUserService.softDelete(id)
            return res.status(200).json({ ok: true })
        } catch (error) {
            return res.status(500).json({ error: error.message })
        }
    },

    listUsers: async (req, res) => {
        try {
            const result = await AdminUserService.listAll(req.query)
            return res.status(200).json(result)
        } catch (error) {
            return res.status(500).json({ error: error.message })
        }
    }
}

module.exports = { AdminUserController }