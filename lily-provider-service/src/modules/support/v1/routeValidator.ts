import { REGEX, STATUS, VALIDATION_MESSAGE } from "@config/main.constant";
import Joi = require("joi");

export const createTicket = Joi.object({
  details: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().required().regex(REGEX.EMAIL)
});

export const Ticket = Joi.object({
  _id: Joi.string().regex(REGEX.MONGO_ID).required(),
  details: Joi.string().optional(),
  status: Joi.string().valid(STATUS.ACTIVE,STATUS.DELETED,STATUS.COMPLETED).optional(),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  email: Joi.string().optional().regex(REGEX.EMAIL)
});

export const ticketListing = Joi.object({
  pageNo: Joi.number().required().description("Page no"),
  limit: Joi.number().required().description("limit"),
  searchKey: Joi.string().trim().optional().description("Search by request number or clinic name"),
  sortBy: Joi.string().trim().valid("created","requestNo").optional().description("created"),
  sortOrder: Joi.number().optional().valid(1, -1).description("1 for asc, -1 for desc"),
  status: Joi.string().optional().valid(STATUS.ACTIVE, STATUS.COMPLETED, STATUS.DELETED).description('filter by status'),
  isAdmin: Joi.boolean().optional(),
  fromDate: Joi.number().optional().description("in timestamp"),
  toDate: Joi.number().optional().description("in timestamp"),
})