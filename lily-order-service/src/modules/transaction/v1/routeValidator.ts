import Joi = require("joi");
import { SUBSCRIPTION_TYPE } from "./transactionConstant";

export const addTransaction = Joi.object({
    subscriptionType: Joi.string().required().valid(...Object.values(SUBSCRIPTION_TYPE)).description("Monthly, Annual"),
    amount: Joi.number().required(),
    clinicId: Joi.string().required(),
    clinicName: Joi.string().optional(),
});

export const transactions = Joi.object({
    clinicId: Joi.string().trim().required(),
    sortBy: Joi.string().trim().valid("created").optional().description("created, clinicName"),
    sortOrder: Joi.number().optional().valid(1, -1).description("1 for asc, -1 for desc"),
})

export const allTransaction = Joi.object({
    pageNo: Joi.number().required().description("Page no"),
    limit: Joi.number().required().description("limit"),
    sortBy: Joi.string().trim().valid("created", "clinicName").optional().description("created, clinicName"),
    sortOrder: Joi.number().optional().valid(1, -1).description("1 for asc, -1 for desc"),
    subscriptionType: Joi.string().trim().optional().valid(...Object.values(SUBSCRIPTION_TYPE)).description("Monthly, Annual"),
    isExport: Joi.boolean(),
})

export const getTotalAmount = Joi.object({
    subscriptionType: Joi.string().trim().required().valid(...Object.values(SUBSCRIPTION_TYPE)).description("Monthly, Annual"),
})