import Joi = require("joi");
import { REGEX } from "@config/main.constant";

export const createNotification = Joi.object({
  notificationId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
});

export const notificationListing = Joi.object({
  pageNo: Joi.number().required().description("Page no"),
  limit: Joi.number().required().description("limit"),
})