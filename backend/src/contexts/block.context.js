const { BlockService } = require('../services/block.service')

const buildBlockContext = async (userId) => {
    if (!userId) {
        return {
            blockedUserIds: [],
            blockedSet: new Set()
        }
    }

    const blockedUserIds = await BlockService.getBlockedUserIds(userId)

    return {
        blockedUserIds,
        blockedSet: new Set(blockedUserIds)
    }
}

module.exports = { buildBlockContext }
