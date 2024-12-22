import Joi = require("joi");
import { EXERCISE_INTENSITY, EXERCISE_TYPE } from "./exerciseConstant";

export const addExercise = Joi.object({
    type: Joi.string().trim().required().valid(...Object.values(EXERCISE_TYPE)).description("WALKING,CYCLING,YOGA,SWIMMING"),
    date: Joi.string().trim().required(),
    intensity:  Joi.string().trim().optional().valid(...Object.values(EXERCISE_INTENSITY)).description("LOW, MEDIUM,HIGH"),
    steps: Joi.number().optional(),
    duration: Joi.number().optional(),
    distance: Joi.number().optional()
})


export const exercise = Joi.object({
    date: Joi.string().trim().required(),
})

export const Health = Joi.object({
    date: Joi.string().trim().required(),
    steps: Joi.number().optional(),
    sleep: Joi.number().optional().description("In minutes"),
    heartRate: Joi.number().optional(),
    calories: Joi.number().optional(),
    lastSync: Joi.string().trim().required(),
    walking: Joi.number().optional(),
    cycling: Joi.number().optional().description("In Meters"),
    yoga: Joi.number().optional().description("In minutes"),
    swimming: Joi.number().optional().description("In minutes"),
})