import Joi = require("joi");
import { MEAL_CATEGORY } from "../../meal/v1/mealConstant";
import { REGEX } from "@config/main.constant";
import { GLUCOSE_PRANDIAL, MEDICATION_TYPE } from "./medicationConstant";

export const addMedication = Joi.object({
    category: Joi.string().trim().required().valid(...Object.values(MEAL_CATEGORY)).description("Fasting, Breakfast, Lunch, Dinner"),
    type: Joi.string().trim().required().valid(...Object.values(MEDICATION_TYPE)).description("Insulin, Oral"),
    date: Joi.string().trim().required(),
    name: Joi.string().trim().optional().allow(''),
    dosage: Joi.alternatives()
        .conditional('type', {
            is: MEDICATION_TYPE.INSULIN,
            then: Joi.number().integer().optional().allow('').description('Dosage should be an integer for Insulin'),
            otherwise: Joi.string().trim().optional().allow('').description('Dosage can be a string for other types')
        }),
})

export const editMedication = Joi.object({
    medicationId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
    name: Joi.string().trim().optional().allow(''),
    category: Joi.string().trim().optional().valid(...Object.values(MEAL_CATEGORY)).description("Fasting, Breakfast, Lunch, Dinner"),
    type: Joi.string().trim().optional().valid(...Object.values(MEDICATION_TYPE)).description("Insulin, Oral"),
    dosage: Joi.alternatives()
        .conditional('type', {
            is: MEDICATION_TYPE.INSULIN,
            then: Joi.number().integer().optional().allow('').description('Dosage should be an integer for Insulin'),
            otherwise: Joi.string().trim().optional().allow('').description('Dosage can be a string for other types')
        }),
})

export const medicationLogs = Joi.object({
    date: Joi.string().required().description("MM/DD/YYYY"),
})

export const quickSummary = Joi.object({
    patientId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
    fromDate: Joi.number().required(),
    toDate: Joi.number().required(),
    isExport: Joi.boolean(),
    cgmActiveTime: Joi.string().optional(),
    gmi: Joi.string().optional(),
    cov: Joi.string().optional(),
    glucoseInterval: Joi.number().valid(...Object.values(GLUCOSE_PRANDIAL)).optional(),
})