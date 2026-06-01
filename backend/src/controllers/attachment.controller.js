const { PrismaClient } = require("@prisma/client");
const { CloudinaryService } = require("../services/cloudinary.service");

const prisma = new PrismaClient();

const AttachmentController = {
    getSignedUrl: async (req, res) => {
        try {
            const userId = req.user.id;
            const { attachmentId } = req.params;

            const attachment = await prisma.attachment.findUnique({
                where: { id: attachmentId },
                include: {
                    Message: {
                        include: {
                            Conversation: {
                                include: {
                                    ConversationUser: true
                                }
                            }
                        }
                    }
                }
            });

            if (!attachment) {
                return res.status(404).json({ error: "Attachment not found" });
            }

            const isMember = attachment.Message.Conversation.ConversationUser.some(
                (item) => item.user_id === userId && item.left_at === null
            );

            if (!isMember) {
                return res.status(403).json({ error: "Forbidden" });
            }

            if (!attachment.public_id) {
                return res.status(400).json({ error: "Invalid attachment" });
            }

            const url = CloudinaryService.signedAuthenticatedUrl(
                attachment.public_id,
                attachment.resource_type,
                600
            );

            return res.json({ url });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
};

module.exports = { AttachmentController };