const Joi = require('joi');

const authValidation = {
    // Validation rules for register
    register: {
        body: Joi.object().keys({
            email: Joi.string().email().required().messages({
                'string.email': 'Invalid email format',
                'any.required': 'Email is required'
            }),
            password: Joi.string().min(6).required().messages({
                'string.min': 'Password must be at least 6 characters',
                'any.required': 'Password is required'
            }),
            username: Joi.string().alphanum().min(3).max(30).required(),
            role: Joi.string().valid('USER', 'ADMIN').default('USER')
        })
    },

    // Validation rules for login
    login: {
        body: Joi.object().keys({
            username: Joi.string().required(),
            password: Joi.string().required()
        })
    },

    // Validation rule for email only (OTP request)
    emailOnly: {
        body: Joi.object().keys({
            email: Joi.string().email().required()
        })
    },

    verifyOtp: {
        body: Joi.object().keys({
            email: Joi.string().email().required(),
            otp: Joi.string().length(6).required()
        })
    },

    refreshToken: {
        body: Joi.object().keys({
            refreshToken: Joi.string().required().messages({
                'any.required': 'Refresh token is required',
                'string.empty': 'Refresh token cannot be empty'
            })
        })
    },

    logout: {
        body: Joi.object().keys({
            refreshToken: Joi.string().required().messages({
                'any.required': 'Refresh token must be provided to logout'
            })
        })
    },

    checkExist: {
        body: Joi.object().keys({
            email: Joi.string().email().optional(),
            username: Joi.string().min(3).max(30).optional()
        }).or('email', 'username')
    },
};

module.exports = authValidation;