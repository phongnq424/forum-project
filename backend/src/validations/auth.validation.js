const Joi = require('joi');

const authValidation = {
    // Quy tắc cho đăng ký
    register: {
        body: Joi.object().keys({
            email: Joi.string().email().required().messages({
                'string.email': 'Email không đúng định dạng',
                'any.required': 'Email là bắt buộc'
            }),
            password: Joi.string().min(6).required().messages({
                'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
                'any.required': 'Mật khẩu là bắt buộc'
            }),
            username: Joi.string().alphanum().min(3).max(30).required(),
            role: Joi.string().valid('USER', 'ADMIN').default('USER')
        })
    },

    // Quy tắc cho đăng nhập
    login: {
        body: Joi.object().keys({
            username: Joi.string().required(),
            password: Joi.string().required()
        })
    },

    // Quy tắc cho OTP
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
                'any.required': 'Refresh token là bắt buộc',
                'string.empty': 'Refresh token không được để trống'
            })
        })
    },

    logout: {
        body: Joi.object().keys({
            refreshToken: Joi.string().required().messages({
                'any.required': 'Phải cung cấp refresh token để đăng xuất'
            })
        })
    }
};

module.exports = authValidation;