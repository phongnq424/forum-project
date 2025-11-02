// validators/file.validator.js
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

function validateFiles(files, fields = []) {
    const result = {}

    for (const field of fields) {
        const file = files[field]?.[0]
        if (!file) continue

        if (!ALLOWED_TYPES.includes(file.mimetype))
            throw new Error(`${field} must be JPEG, PNG, or WEBP`)

        if (file.size > MAX_SIZE)
            throw new Error(`${field} too large, max 5MB`)

        result[field] = file.path
    }

    return result
}

module.exports = { validateFiles }
