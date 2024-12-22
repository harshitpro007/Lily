import Joi = require("joi");
import { REGEX, STATUS } from "@config/main.constant";
import { PLATFORM_TYPE, USERS } from "./notificationConstant";



export const createNotification = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  platform: Joi.string().required().valid(...Object.values(PLATFORM_TYPE)),
  isAllUser: Joi.boolean().optional().description('If all users then pass it as true otherwise false'),
  users: Joi.array().items(Joi.string().regex(REGEX.MONGO_ID)).optional()
});

export const updateNotification = Joi.object({
  _id: Joi.string().required(),
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  platform: Joi.string().optional().valid(...Object.values(PLATFORM_TYPE)),
  isAllUser: Joi.boolean().optional().description('If all users then pass it as true otherwise false'),
  users: Joi.array().items(Joi.string().regex(REGEX.MONGO_ID)).optional(),
  status: Joi.string().optional().valid(STATUS.DELETED)
});

export const getNotification = Joi.object({
  _id: Joi.string().required()
});

export const notificationListing = Joi.object({
  pageNo: Joi.number().required().description("Page no"),
  limit: Joi.number().required().description("limit"),
  sortBy: Joi.string().trim().valid("created").optional().description("sort notification by added on"),
  sortOrder: Joi.number().optional().valid(1, -1).description("1 for asc, -1 for desc"),
  fromDate: Joi.number().optional().description("in timestamp"),
  toDate: Joi.number().optional().description("in timestamp"),
  platforms: Joi.string().optional().valid(...Object.values(PLATFORM_TYPE)),
  users: Joi.string().optional().valid(...Object.values(USERS))
})

export const sendNotification = Joi.object({
  notificationId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
})