const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const FollowerService = {
  toggleFollow: async (currentUserId, targetUserId) => {
    if (currentUserId === targetUserId)
      throw new Error("Cannot follow yourself");

    const existing = await prisma.follower.findUnique({
      where: {
        follow_id_followed_id: {
          follow_id: currentUserId,
          followed_id: targetUserId,
        },
      },
    });

    if (existing) {
      await prisma.follower.delete({
        where: {
          follow_id_followed_id: {
            follow_id: currentUserId,
            followed_id: targetUserId,
          },
        },
      });
      return { followed: false };
    } else {
      await prisma.follower.create({
        data: {
          follow_id: currentUserId,
          followed_id: targetUserId,
        },
      });
      return { followed: true };
    }
  },

    removeFollower: async (currentUserId, followerId) => {
        const existing = await prisma.follower.findUnique({
            where: {
                follow_id_followed_id: {
                    follow_id: followerId,
                    followed_id: currentUserId
                }
            }
        })

        if (!existing) {
            throw new Error("This user is not following you")
        }

        await prisma.follower.delete({
            where: {
                follow_id_followed_id: {
                    follow_id: followerId,
                    followed_id: currentUserId
                }
            }
        })

        return { removed: true }
    },

    if (!existing) {
      throw new Error("This user is not following you");
    }

    await prisma.follower.delete({
      where: {
        follow_id_followed_id: {
          follow_id: followerId,
          followed_id: currentUserId,
        },
      },
    });

    return { removed: true };
  },

  getFollowers: async (userId, query) => {
    const take = parseInt(query.limit) || 50;
    const skip = parseInt(query.page ? (query.page - 1) * take : 0);
    const where = { followed_id: userId };
    if (query.search)
      where.follower = {
        username: { contains: query.search, mode: "insensitive" },
      };

    const followers = await prisma.follower.findMany({
      where,
      skip,
      take,
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            Profile: { select: { avatar: true } },
          },
        },
      },
    });
    const total = await prisma.follower.count({ where });
    return {
      data: followers,
      pagination: {
        total,
        page: parseInt(query.page) || 1,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  },

  getFollowing: async (userId, query) => {
    const take = parseInt(query.limit) || 50;
    const skip = parseInt(query.page ? (query.page - 1) * take : 0);
    const where = { follow_id: userId };
    if (query.search)
      where.followed = {
        username: { contains: query.search, mode: "insensitive" },
      };

    const following = await prisma.follower.findMany({
      where,
      skip,
      take,
      include: {
        followed: {
          select: {
            id: true,
            username: true,
            Profile: { select: { avatar: true } },
          },
        },
      },
    });
    const total = await prisma.follower.count({ where });
    return {
      data: following,
      pagination: {
        total,
        page: parseInt(query.page) || 1,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  },
};

module.exports = { FollowerService };
