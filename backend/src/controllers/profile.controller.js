const { ProfileService } = require('../services/profile.service')
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

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

                const files = {}
                if (req.files.avatar) {
                    const avatarFile = req.files.avatar[0]

                    // kiểm tra định dạng
                    if (!['image/jpeg', 'image/png', 'image/webp'].includes(avatarFile.mimetype)) {
                        return res.status(400).json({ error: 'Avatar must be JPEG, PNG, or WEBP' })
                    }

                    // kiểm tra kích thước ≤ 5MB
                    if (avatarFile.size > 5 * 1024 * 1024) {
                        return res.status(400).json({ error: 'Avatar too large, max 5MB' })
                    }

                    files.avatar = avatarFile.path
                }

                if (req.files.cover) {
                    const coverFile = req.files.cover[0]

                    if (!['image/jpeg', 'image/png', 'image/webp'].includes(coverFile.mimetype)) {
                        return res.status(400).json({ error: 'Cover must be JPEG, PNG, or WEBP' })
                    }

                    if (coverFile.size > 5 * 1024 * 1024) {
                        return res.status(400).json({ error: 'Cover too large, max 5MB' })
                    }

                    files.cover = coverFile.path
                }

                const updated = await ProfileService.updateProfile(req.user.id, req.body, files)
                return res.status(200).json(updated)
            } catch (error) {
                return res.status(400).json({ error: error.message })
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
