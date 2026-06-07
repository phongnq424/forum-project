const Joi = require("joi");

const validate = (schema) => (req, res, next) => {
    const validSchema = {};

    if (schema.params) validSchema.params = schema.params;
    if (schema.query) validSchema.query = schema.query;
    if (schema.body) validSchema.body = schema.body;

    const object = {};

    if (schema.params) object.params = req.params;
    if (schema.query) object.query = req.query;
    if (schema.body) object.body = req.body;

    const { value, error } = Joi.compile(validSchema)
        .prefs({
            errors: {
                label: "key"
            },
            abortEarly: false,
            stripUnknown: true
        })
        .validate(object);

    if (error) {
        const errorMessage = error.details
            .map((detail) => detail.message)
            .join(", ");

        return res.status(400).json({
            error: errorMessage
        });
    }

    if (value.params) req.params = value.params;
    if (value.query) req.query = value.query;
    if (value.body) req.body = value.body;

    return next();
};

module.exports = validate;