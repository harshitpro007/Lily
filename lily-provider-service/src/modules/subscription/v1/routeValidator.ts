import Joi = require("joi");

export const addSubscription = Joi.object({
    clinicId: Joi.string().required(),
});

export const subscriptionDetails = Joi.object({
    clinicId: Joi.string().trim().required(),
})

export const getClinicSubscription = Joi.object({
    pageNo: Joi.number().required().description("Page no"),
    limit: Joi.number().required().description("limit"),
    sortBy: Joi.string().trim().valid("created", "clinicName").optional().description("created, clinicName"),
    sortOrder: Joi.number().optional().valid(1, -1).description("1 for asc, -1 for desc"),
    isExport: Joi.boolean(),
})

export const editSubscriptionDetails = Joi.object({
    clinicId: Joi.string().trim().required(),
    subscriptionDetails: Joi.string().trim().required(),
})