const Joi = require("joi");

const scopeValues = [
    "GENERAL",
    "TOPIC_DISCUSSION",
    "CHALLENGE_HELP",
    "STUDY_GROUP",
    "CLASS_GROUP",
    "AI_TUTOR"
];

const nullableId = Joi.string().uuid().empty("").allow(null).default(null);

const scopeContextRules = {
    GENERAL: {
        requireTopic: false,
        requireChallenge: false
    },
    TOPIC_DISCUSSION: {
        requireTopic: true,
        requireChallenge: false
    },
    CHALLENGE_HELP: {
        requireTopic: false,
        requireChallenge: true
    },
    STUDY_GROUP: {
        requireTopic: false,
        requireChallenge: false
    },
    CLASS_GROUP: {
        requireTopic: false,
        requireChallenge: false
    },
    AI_TUTOR: {
        requireTopic: false,
        requireChallenge: false
    }
};

function validateScopeContext(value, helpers) {
    const scope = value.scope || "GENERAL";
    const rule = scopeContextRules[scope];

    if (!rule) {
        return helpers.error("any.invalid");
    }

    if (rule.requireTopic && !value.topic_id) {
        return helpers.message("topic_id is required for this group scope");
    }

    if (rule.requireChallenge && !value.challenge_id) {
        return helpers.message("challenge_id is required for this group scope");
    }

    return value;
}

const baseGroupBody = {
    name: Joi.string().trim().min(1).max(255).required().messages({
        "string.empty": "Group name is required",
        "any.required": "Group name is required"
    }),
    avatar: Joi.string().trim().allow("", null).default(null),
    scope: Joi.string().valid(...scopeValues).default("GENERAL"),
    topic_id: nullableId,
    challenge_id: nullableId
};

const groupValidation = {
    createGroup: {
        body: Joi.object()
            .keys({
                ...baseGroupBody,
                userIds: Joi.array().items(Joi.string().uuid()).default([])
            })
            .custom(validateScopeContext)
    },

    adminCreateGroup: {
        body: Joi.object()
            .keys({
                ...baseGroupBody
            })
            .custom(validateScopeContext)
    },

    listGroups: {
        query: Joi.object().keys({
            q: Joi.string().trim().allow("", null),
            scope: Joi.string().valid(...scopeValues),
            topic_id: nullableId,
            challenge_id: nullableId
        })
    },

    listPublicGroups: {
        query: Joi.object().keys({
            q: Joi.string().trim().allow("", null),
            scope: Joi.string().valid(...scopeValues),
            topic_id: nullableId,
            challenge_id: nullableId
        })
    },

    adminListGroups: {
        query: Joi.object().keys({
            q: Joi.string().trim().allow("", null),
            scope: Joi.string().valid(...scopeValues),
            topic_id: nullableId,
            challenge_id: nullableId
        })
    },
    adminUpdateGroup: {
        params: Joi.object().keys({
            conversationId: Joi.string().uuid().required()
        }),
        body: Joi.object()
            .keys({
                name: Joi.string().trim().min(1).max(255).optional().messages({
                    "string.empty": "Group name cannot be empty",
                    "string.min": "Group name cannot be empty"
                }),
                avatar: Joi.string().trim().allow("", null).optional(),
                scope: Joi.string().valid(...scopeValues).optional(),
                topic_id: Joi.string().uuid().empty("").allow(null).optional(),
                challenge_id: Joi.string().uuid().empty("").allow(null).optional()
            })
            .min(1)
            .custom(validateScopeContext)
    },

    conversationIdParam: {
        params: Joi.object().keys({
            conversationId: Joi.string().uuid().required()
        })
    },

    sendMessage: {
        params: Joi.object().keys({
            conversationId: Joi.string().uuid().required()
        }),
        body: Joi.object().keys({
            content: Joi.string().allow("", null).default("")
        })
    }
};

module.exports = groupValidation;