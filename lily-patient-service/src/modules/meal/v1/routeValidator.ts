import Joi = require("joi");
import { AVERAGE_TYPE, DAYS, GLUCOSE_PRANDIAL, LOGS_DAYS, MEAL_CATEGORY } from "./mealConstant";
import { REGEX } from "@config/main.constant";
import { GLUCOSE_INTERVAL } from "@modules/user/v1/userConstant";

export const addMeal = Joi.object({
    category: Joi.string().trim().required().valid(...Object.values(MEAL_CATEGORY)).description("Fasting, Breakfast, Lunch, Dinner"),
    date: Joi.string().trim().required(),
    image: Joi.string().trim().allow('').optional(),
    description: Joi.string().trim().allow('').optional(),
    carbs: Joi.number().optional().allow(''),
    notes: Joi.string().trim().optional().allow(''),
    mealTime: Joi.string().trim().required(),
    isAutomatic: Joi.boolean().optional(),
    glucose: Joi.number().optional().description('The glucose value.'),
    glucose_2hr: Joi.number().optional().description('The glucose value.'),
})

export const editMeal = Joi.object({
    mealId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
    image: Joi.string().trim().optional().allow(''),
    description: Joi.string().trim().optional().allow(''),
    carbs: Joi.number().optional().allow(''),
    notes: Joi.string().trim().optional().allow(''),
    mealTime: Joi.string().trim().required(),
    glucose: Joi.number().optional().description('The glucose value.'),
    glucose_2hr: Joi.number().optional().description('The glucose value.'),
})

const glucoseObjectSchema = Joi.object({
    glucose: Joi.number().optional().description('The glucose value.'),
    glucose_2hr: Joi.number().optional().description('The glucose value.'),
    category: Joi.string().trim().optional().valid(...Object.values(MEAL_CATEGORY)).description("Fasting, Breakfast, Lunch, Dinner"),
    date: Joi.string().trim().optional(),
});

export const addGlucose = Joi.object({
    data: Joi.array().items(glucoseObjectSchema).optional().description('Array of glucose measurement objects'),
});

export const getMeal = Joi.object({
    userId: Joi.string().trim().regex(REGEX.MONGO_ID).optional(),
    category: Joi.string().trim().required().valid(...Object.values(MEAL_CATEGORY)).description("Fasting, Breakfast, Lunch, Dinner"),
    date: Joi.string().required().description("MM/DD/YYYY"),
})

export const logs = Joi.object({
    pageNo: Joi.number().required(),
    limit: Joi.number().required(),
})

export const mealLogs = Joi.object({
    date: Joi.string().required().description("MM/DD/YYYY"),
})

export const glucoseLogs = Joi.object({
    patientId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
    fromDate: Joi.number().required(),
    toDate: Joi.number().required(),
    isExport: Joi.boolean(),
    type: Joi.string().trim().required().valid(...Object.values(LOGS_DAYS)).description("ONE_WEEK, TWO_WEEKS, ONE_MONTH, ALL_TIME"),
    glucoseInterval: Joi.number().valid(...Object.values(GLUCOSE_PRANDIAL)).optional(),
})

export const glucoseAverages = Joi.object({
    type: Joi.string().trim().required().valid(...Object.values(AVERAGE_TYPE)).description("Averages, Graph"),
    days: Joi.string().trim().required().valid(...Object.values(DAYS)).description("THREE_DAYS, ONE_WEEKS, TWO_WEEKS, ONE_MONTH, ALL_TIME"),
})

export const addDeviceHistory = Joi.object({
    date: Joi.string().trim().required(),
    glucose: Joi.array().required().items(Joi.object({time: Joi.string().required(),value: Joi.number().required(),timeInMsec: Joi.number().required()})).single(),
})

export const getDeviceHsitory = Joi.object({
    date: Joi.string().trim().required()
})

const editGlucoseObject = Joi.object({
    id: Joi.string().trim().regex(REGEX.MONGO_ID).required().description('The MongoDB ID.'),
    glucose: Joi.number().optional().description('The glucose value.'),
    glucose_2hr: Joi.number().optional().description('The glucose value.'),
})
.or('glucose', 'glucose_2hr')
.description('At least one of glucose or glucose_2hr must be provided if id is present.');

export const editGlucose = Joi.object({
    data: Joi.array().items(editGlucoseObject).optional().description('Array of glucose measurement objects'),
});

export const GlucoseHistory = Joi.object({
    clinicId: Joi.string().trim().required()
})