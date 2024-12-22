import { REGEX, VALIDATION_MESSAGE } from "@config/main.constant";
import Joi = require("joi");
import { COMMUNICATION_MODE, DEVICE, GLUCOSE_INTERVAL, GLUCOSE_PRANDIAL, LANGUAGE, LOGS_DAYS, MEAL_CATEGORY, PATIENT_TYPE, RPM_TYPE } from "./patientConstant";
import { MANAGEMENT } from "@modules/provider/v1/providerConstant";

export const editPatient = Joi.object({
    patientId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
    firstName: Joi.string().trim().optional(),
    lastName: Joi.string().trim().optional(),
    countryCode: Joi.string().trim().optional(),
    mobileNo: Joi.string()
        .trim()
        .regex(REGEX.MOBILE_NUMBER)
        .optional()
        .messages({
            "string.pattern.base": VALIDATION_MESSAGE.mobileNo.pattern,
        }),
    email: Joi.string()
        .trim()
        .lowercase()
        .regex(REGEX.EMAIL)
        .optional()
        .messages({
            "string.pattern.base": VALIDATION_MESSAGE.email.pattern,
        }),
    dob: Joi.string().optional().description("MM/DD/YYYY"),
    dueDate: Joi.number().optional(),
    language: Joi.string().trim().optional().valid(LANGUAGE.ENGLISH, LANGUAGE.SPANISH),
    patientType: Joi.string().trim().optional().valid(PATIENT_TYPE.GDM, PATIENT_TYPE.T1, PATIENT_TYPE.T2, PATIENT_TYPE.NA),
    device: Joi.string().trim().optional().valid(DEVICE.LIBRA_3, DEVICE.DEXCOM_G7, DEVICE.NA),
    management: Joi.string().trim().optional().valid(MANAGEMENT.DIET, MANAGEMENT.MED),
    providerId: Joi.string().trim().regex(REGEX.MONGO_ID).optional(),
    medication: Joi.string().trim().optional(),
    street: Joi.string().trim().optional(),
    city: Joi.string().trim().optional(),
    state: Joi.string().trim().optional(),
    zipCode: Joi.string().trim().optional(),
    isDelivered: Joi.boolean().optional(),
    deliveredDate: Joi.number().optional(),
    glucoseInterval: Joi.number().valid(...Object.values(GLUCOSE_INTERVAL)).optional(),
});

export const glucoseLogs = Joi.object({
    patientId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
    fromDate: Joi.number().required(),
    toDate: Joi.number().required(),
    isExport: Joi.boolean(),
    type: Joi.string().trim().required().valid(...Object.values(LOGS_DAYS)).description("ONE_WEEK, TWO_WEEKS, ONE_MONTH, ALL_TIME"),
    glucoseInterval: Joi.number().valid(...Object.values(GLUCOSE_PRANDIAL)).optional(),
})

export const rpmVisit = Joi.object({
    userId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
    providerId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
    date: Joi.number().required(),
    visitTime: Joi.number().required(),
    notes: Joi.string().trim().optional(),
    isInteraction: Joi.boolean(),
    communicationMode: Joi.when("isInteraction", {
        is: true,
        then: Joi.string().trim().required().valid(...Object.values(COMMUNICATION_MODE)).description("Audio, Video"),
        otherwise: Joi.string().trim().optional().valid(...Object.values(COMMUNICATION_MODE)).description("Audio, Video"),
    }),
    time: Joi.string().trim().optional(),
    type: Joi.string().trim().valid(...Object.values(RPM_TYPE)).required(),
})

export const editRpmVisit = Joi.object({
    rpmId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
    providerId: Joi.string().trim().regex(REGEX.MONGO_ID).optional(),
    date: Joi.number().optional(),
    visitTime: Joi.number().optional(),
    notes: Joi.string().trim().optional(),
    isInteraction: Joi.boolean().optional(),
    communicationMode: Joi.string().trim().optional().valid(...Object.values(COMMUNICATION_MODE)).description("Audio, Video"),
    time: Joi.string().trim().optional(),
    type: Joi.string().trim().valid(...Object.values(RPM_TYPE)).optional(),
})

export const getMeal = Joi.object({
    userId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
    category: Joi.string().trim().required().valid(...Object.values(MEAL_CATEGORY)).description("Fasting, Breakfast, Lunch, Dinner"),
    date: Joi.string().required().description("MM/DD/YYYY"),
})

export const rpmVisitListing = Joi.object({
    userId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
    sortBy: Joi.string().trim().valid("date", "visitTime", "providerName", "time", "isInteraction", "communicationMode", "created").optional().description("date, visitTime, providerName, time, isInteraction, communicationMode, created"),
    sortOrder: Joi.number().optional().valid(1, -1).description("1 for asc, -1 for desc"),
    fromDate: Joi.number().optional().description("in timestamp"),
    toDate: Joi.number().optional().description("in timestamp"),
})

export const quickSummary = Joi.object({
    patientId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
    fromDate: Joi.number().required(),
    toDate: Joi.number().required(),
    isExport: Joi.boolean().optional(),
    cgmActiveTime: Joi.string().optional(),
    gmi: Joi.string().optional(),
    cov: Joi.string().optional(),
    glucoseInterval: Joi.number().valid(...Object.values(GLUCOSE_PRANDIAL)).optional(),
})