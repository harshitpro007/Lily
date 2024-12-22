import Joi = require("joi");
import { CmsType } from "./cmsConstant";
import { STATUS } from "@config/main.constant";

export const cms = Joi.object({
  type: Joi.string()
    .trim()
    .valid(CmsType.TERMSANDCONDITIONS, CmsType.PRIVACYPOLICY)
    .default(CmsType.TERMSANDCONDITIONS)
    .required(),
  body: Joi.array()
    .items({
      language: Joi.string().optional(),
      text: Joi.string().optional().allow("")
    })
    .optional()
});

export const getCms = Joi.object({
  type: Joi.string().optional().valid(CmsType.TERMSANDCONDITIONS,CmsType.PRIVACYPOLICY).default(CmsType.TERMSANDCONDITIONS)
});

export const createFaq = Joi.object({
  body: Joi.array()
    .items({
      language: Joi.string().optional(),
      question: Joi.string().optional().allow(""),
      answer: Joi.string().optional().allow("")
    })
    .optional()
});

export const updateFaq = Joi.object({
  _id: Joi.string().required(),
  status: Joi.string().optional().valid(STATUS.ACTIVE, STATUS.DEACTIVE, STATUS.DELETED),
  body: Joi.array()
    .items({
      language: Joi.string().optional(),
      question: Joi.string().optional().allow(""),
      answer: Joi.string().optional().allow("")
    })
    .optional()
});

export const getFaq = Joi.object({
  _id: Joi.string().required()
});

export const getFaqs = Joi.object({
  status: Joi.array().items(Joi.string().trim().min(1)).single().optional().description('filter by status ACTIVE, DEACTIVE'), 
  pageNo: Joi.number().required().description("Page no"),
  limit: Joi.number().required().description("limit"),
  sortBy: Joi.string().trim().valid("created").optional().description("sort faq by added on"),
  sortOrder: Joi.number().optional().valid(1, -1).description("1 for asc, -1 for desc"),
})