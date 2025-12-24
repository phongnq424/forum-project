const { UserService } = require('../services/user.service')
const { buildBlockContext } = require('../contexts/block.context')

const UserController = {
    listUsers: async (req, res) => {
        try {
            const viewerId = req.user?.id || null
            const blockContext = await buildBlockContext(viewerId)

            const result = await UserService.list(
                req.query,
                { viewerId, blockContext }
            )

            return res.status(200).json(result)
        } catch (error) {
            return res.status(500).json({ error: error.message })
        }
    },

    getMe: async (req, res) => {
        try {
            if (!req.user?.id)
                return res.status(401).json({ error: 'Unauthorized' })

            const user = await UserService.findById(req.user.id)
            if (!user)
                return res.status(404).json({ error: 'Not found' })

            return res.status(200).json(user)
        } catch (error) {
            return res.status(500).json({ error: error.message })
        }
    },

    getUserById: async (req, res) => {
        try {
            const id = Number(req.params.id)
            if (Number.isNaN(id))
                return res.status(400).json({ error: 'Invalid id' })

            const viewerId = req.user?.id || null
            const blockContext = await buildBlockContext(viewerId)

            const user = await UserService.findById(
                id,
                { viewerId, blockContext }
            )

            if (!user)
                return res.status(404).json({ error: 'Not found' })

            return res.status(200).json(user)
        } catch (error) {
            return res.status(500).json({ error: error.message })
        }
    },

    updateMe: async (req, res) => {
        try {
            if (!req.user?.id)
                return res.status(401).json({ error: 'Unauthorized' })

            const user = await UserService.update(req.user.id, req.body)
            return res.status(200).json(user)
        } catch (error) {
            return res.status(400).json({ error: error.message })
        }
    },

    changePassword: async (req, res) => {
        try {
            if (!req.user?.id)
                return res.status(401).json({ error: 'Unauthorized' })

            const { oldPassword, newPassword } = req.body
            if (!oldPassword || !newPassword)
                return res.status(400).json({ error: 'Missing fields' })

            await UserService.changePassword(
                req.user.id,
                oldPassword,
                newPassword
            )

            return res.status(200).json({ ok: true })
        } catch (error) {
            return res.status(400).json({ error: error.message })
        }
    },

    updateUser: async (req, res) => {
        try {
            const id = Number(req.params.id)
            if (Number.isNaN(id))
                return res.status(400).json({ error: 'Invalid id' })

            const user = await UserService.update(id, req.body)
            return res.status(200).json(user)
        } catch (error) {
            return res.status(400).json({ error: error.message })
        }
    },

    deleteUser: async (req, res) => {
        try {
            const id = Number(req.params.id)
            if (Number.isNaN(id))
                return res.status(400).json({ error: 'Invalid id' })

            await UserService.remove(id)
            return res.status(200).json({ ok: true })
        } catch (error) {
            return res.status(500).json({ error: error.message })
        }
    },
}

module.exports = { UserController }
