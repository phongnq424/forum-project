const cloudinary = require('../config/cloudinary');
const fs = require('fs').promises;

const CloudinaryService = {
    upload: async (filePath, type) => {
        let folder = '';
        switch (type) {
            case 'avatar': folder = 'user-avatars'; break;
            case 'cover': folder = 'user-covers'; break;
            case 'post': folder = 'post-images'; break;
            default: folder = 'others';
        }

        try {
            const result = await cloudinary.uploader.upload(filePath, { folder });
            return {
                url: result.secure_url,
                public_id: result.public_id
            };
        } catch (err) {
            console.error('❌ Upload failed:', err);
            throw err;
        } finally {
            try {
                await fs.unlink(filePath)
            } catch (e) {
                // ignore
            }
        }
    },

    delete: async (publicId) => {
        if (!publicId) return null;
        try {
            const result = await cloudinary.uploader.destroy(publicId);
            console.log('✅ Deleted image:', publicId);
            return result;
        } catch (err) {
            console.error('❌ Delete failed:', err);
            throw err;
        }
    },

    update: async (filePath, type, oldPublicId) => {
        try {
            // upload mới trước
            const uploaded = await CloudinaryService.upload(filePath, type);

            // nếu upload thành công thì xóa ảnh cũ (không block nếu xóa fail)
            if (oldPublicId) {
                await CloudinaryService.delete(oldPublicId).catch(() => { });
            }

            return uploaded;
        } catch (err) {
            console.error('❌ Update failed:', err);
            throw err;
        }
    }
};

module.exports = { CloudinaryService };
