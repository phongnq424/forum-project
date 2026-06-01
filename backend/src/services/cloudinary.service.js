const cloudinary = require("../config/cloudinary");
const fs = require("fs").promises;

function getFolder(type) {
    switch (type) {
        case "avatar":
            return "user-avatars";
        case "cover":
            return "user-covers";
        case "post":
            return "post-images";
        case "chat":
            return "chat-attachments";
        default:
            return "others";
    }
}

async function removeLocalFile(filePath) {
    try {
        if (filePath) {
            await fs.unlink(filePath);
        }
    } catch (e) { }
}

const CloudinaryService = {
    upload: async (filePath, type) => {
        const folder = getFolder(type);

        try {
            const result = await cloudinary.uploader.upload(filePath, {
                folder,
                resource_type: "image"
            });

            return {
                url: result.secure_url,
                public_id: result.public_id,
                resource_type: result.resource_type,
                delivery_type: result.type || "upload"
            };
        } catch (err) {
            console.error("❌ Upload failed:", err);
            throw err;
        } finally {
            await removeLocalFile(filePath);
        }
    },

    uploadAuthenticated: async (filePath, folder = "chat-attachments") => {
        try {
            const result = await cloudinary.uploader.upload(filePath, {
                folder,
                resource_type: "auto",
                type: "authenticated"
            });

            return {
                url: result.secure_url,
                public_id: result.public_id,
                resource_type: result.resource_type,
                delivery_type: "authenticated"
            };
        } catch (err) {
            console.error("❌ Authenticated upload failed:", err);
            throw err;
        } finally {
            await removeLocalFile(filePath);
        }
    },

    signedAuthenticatedUrl: (publicId, resourceType, expiresInSeconds = 600, options = {}) => {
        if (!publicId) {
            throw new Error("publicId is required");
        }

        return cloudinary.url(publicId, {
            resource_type: resourceType || "image",
            type: "authenticated",
            sign_url: true,
            secure: true,
            expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
            ...options
        });
    },

    delete: async (publicId, options = {}) => {
        if (!publicId) return null;

        try {
            const result = await cloudinary.uploader.destroy(publicId, {
                resource_type: options.resource_type || "image",
                type: options.type || "upload"
            });

            console.log("✅ Deleted asset:", publicId);
            return result;
        } catch (err) {
            console.error("❌ Delete failed:", err);
            throw err;
        }
    },

    update: async (filePath, type, oldPublicId) => {
        try {
            const uploaded = await CloudinaryService.upload(filePath, type);

            if (oldPublicId) {
                CloudinaryService.delete(oldPublicId).catch(() => { });
            }

            return uploaded;
        } catch (err) {
            console.error("❌ Update failed:", err);
            throw err;
        }
    }
};

module.exports = { CloudinaryService };