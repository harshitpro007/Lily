import { DEVICE_TYPE, REGEX } from "@config/index";
import Joi = require("joi");

export const getAllPatients = Joi.object({
    pageNo: Joi.number().required().description("Page no"),
    limit: Joi.number().required().description("limit"),
    searchKey: Joi.string().trim().optional().description("Search by clinic name"),
    sortBy: Joi.string().trim().valid("created", "fullName").optional().description("created, clinicName"),
    sortOrder: Joi.number().optional().valid(1, -1).description("1 for asc, -1 for desc"),
    fromDate: Joi.number().optional().description("in timestamp"),
    toDate: Joi.number().optional().description("in timestamp"),
    clinicId: Joi.array().items(Joi.string().trim().min(1)).single().optional().description('filter by clinic name'),
    status: Joi.array().items(Joi.string().trim().min(1)).single().optional().description('filter by status ACTIVE, INACTIVE, PENDING'),
    providerId: Joi.array().items(Joi.string().trim().min(1)).single().optional().description('filter by provider name'),
    isExport: Joi.boolean(),
    platforms : Joi.string().trim().valid(DEVICE_TYPE.ANDROID, DEVICE_TYPE.IOS).optional(),
})

export const clinicDetail = Joi.object({
    clinicName: Joi.string().trim().required(),
})

export const providerDetail = Joi.object({
    providerName: Joi.string().trim().required(),
});

export const patientDetails = Joi.object({
    userId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
});

export const PatientGlucoseAndRpmData = Joi.object({
    clinicId: Joi.string().trim().required(),
});