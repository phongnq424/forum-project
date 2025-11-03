const { ProfileService } = require('../services/profile.service')
const { upload } = require('../middlewares/upload.middleware')
const { validateFiles } = require('../validators/file.validator')

const ProfileController = {
    getMyProfile: async (req, res) => {
        try {
            if (!req.user || !req.user.id)
                return res.status(401).json({ error: 'Unauthorized' })

            const profile = await ProfileService.getProfileByUserId(req.user.id)
            if (!profile) return res.status(404).json({ error: 'Not found' })
            return res.status(200).json(profile)
        } catch (error) {
            return res.status(500).json({ error: error.message })
        }
    },

    getProfileByUserId: async (req, res) => {
        try {
            const { userId } = req.params
            if (!userId) return res.status(400).json({ error: 'Invalid userId' })

            const profile = await ProfileService.getProfileByUserId(userId)
            if (!profile) return res.status(404).json({ error: 'Not found' })
            return res.status(200).json(profile)
        } catch (error) {
            return res.status(500).json({ error: error.message })
        }
    },

    updateMyProfile: [
        upload.fields([
            { name: 'avatar', maxCount: 1 },
            { name: 'cover', maxCount: 1 }
        ]),
        async (req, res) => {
            try {
                if (!req.user?.id)
                    return res.status(401).json({ error: 'Unauthorized' })

                const files = validateFiles(req.files, ['avatar', 'cover'])
                const updated = await ProfileService.updateProfile(req.user.id, req.body, files)
                return res.status(200).json(updated)
            } catch (error) {
                const status = error.message.includes('Invalid file') ? 400 : 500
                return res.status(status).json({ error: error.message })
            }
        }
    ],

    listProfiles: async (req, res) => {
        try {
            const result = await ProfileService.list(req.query)
            return res.status(200).json(result)
        } catch (error) {
            return res.status(500).json({ error: error.message })
        }
    },

    searchUsers: async (req, res) => {
        try {
            const { q } = req.query
            if (!q || q.trim() === '')
                return res.status(400).json({ error: 'Missing search query' })

            const users = await ProfileService.searchUsers(q)
            return res.status(200).json(users)
        } catch (error) {
            return res.status(500).json({ error: error.message })
        }
    },
}

module.exports = { ProfileController }
