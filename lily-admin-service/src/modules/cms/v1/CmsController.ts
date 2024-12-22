"use strict";
import * as _ from "lodash";
import {
  encryptData,
  decryptData,
} from "@utils/appUtils";
import {
  MESSAGES,
} from "@config/index";
import { logger } from "@lib/logger";
import { cms, createFaq, getFaq, updateFaq } from "./routeValidator";
import { cmsDaoV1 } from "..";
import * as cmsConstant from "@modules/cms/v1/cmsConstant";

export class CMSController {
 
  /**
   * @function termsAndCondistion
   * @description create or update terms and conditions 
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.type: cms type either T&C/Policy (required)
   * @param params.body: body contains language and text (optional)
   * @retuns data obj with token
   */
  async cmsManagement(payload: CmsRequest.Payload) {
    try {
      let decryptedData = decryptData(payload.data);
      if(!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: CmsRequest.Cms = JSON.parse(decryptedData);
      const validation = cms.validate(params);
      if(validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details));
      }
      const step1 = await cmsDaoV1.findOne("cms",{
        type: params.type
      },{});
      let step2:any,step3:any;
      if(step1) {
        step2= await cmsDaoV1.findOneAndUpdate("cms",{type: params.type},params,{new:true});     
      } else {
        step2= await cmsDaoV1.save("cms",params); 
      }
      delete step2.createdAt;
      delete step2.updatedAt;
      step3 = encryptData(JSON.stringify(step2));
      return cmsConstant.MESSAGES.SUCCESS.DETAILS(step3);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

    /** 
   * @function getCms
   * @description get cms details
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.type: get cms details with type
   * @retuns data obj with token
   */
    async getCms(params: CmsRequest.cmsType) {
      try {
        const step1= await cmsDaoV1.findOne("cms",{type: params.type});
        let step2 = encryptData(JSON.stringify(step1));
        return cmsConstant.MESSAGES.SUCCESS.DETAILS(step2);
      } catch (error) {
        logger.error(error);
        throw error;
      }
    }

  /**
   * @function createFaq
   * @description create faq 
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.type: cms type either T&C/Policy (required)
   * @param params.body: body contains language and text (optional)
   * @retuns data obj with token
   */
  async createFaq(payload: CmsRequest.Payload) {
    try {
      let decryptedData = decryptData(payload.data);
      if(!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: CmsRequest.Faq = JSON.parse(decryptedData);
      const validation = createFaq.validate(params);
      if(validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details));
      }
      const step1= await cmsDaoV1.save("faq",params);
      let step2 = encryptData(JSON.stringify(step1));
      return cmsConstant.MESSAGES.SUCCESS.DETAILS(step2);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function updateFaq
   * @description update faq and status
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params._id: faq id (required)
   * @param params.status: faq status (optional)
   * @param params.body: faq body contains language and text (optional)
   * @retuns data obj with token
   */
  async updateFaq(payload: CmsRequest.Payload) {
    try {
      let decryptedData = decryptData(payload.data);
      if(!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: CmsRequest.updateFaq = JSON.parse(decryptedData);
      const validation = updateFaq.validate(params);
      if(validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details));
      }
      let update:any={}
      if(params.status) {
        update.status= params.status;
      }
      if(params.body) {
        update.body= params.body
      }
      const step1= await cmsDaoV1.findOneAndUpdate("faq",{_id: params._id},update,{new:true});
      let step2 = encryptData(JSON.stringify(step1));
      return cmsConstant.MESSAGES.SUCCESS.DETAILS(step2);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

   
  /** 
   * @function getFaq
   * @description get faq details
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params._id: get faq details with id
   * @retuns data obj with token
   */
  async getFaq(params: CmsRequest.GetFaq) {
    try {
      const step1= await cmsDaoV1.findOne("faq",{_id: params._id});
      if(!step1) return Promise.reject(cmsConstant.MESSAGES.ERROR.INVALID_FAQ);
      let step2 = encryptData(JSON.stringify(step1));
      return cmsConstant.MESSAGES.SUCCESS.DETAILS(step2);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

    /** 
   * @function getFaqs
   * @description get faq details
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.pageNo: page number listing request for getting faqs
   * @param params.limit: limit faqs for listing
   * @retuns data obj with token
   */
    async getFaqs(params: ListingRequest) {
      try {
        let step1= await cmsDaoV1.getFaqs(params);
        let step2 = encryptData(JSON.stringify(step1));
        return cmsConstant.MESSAGES.SUCCESS.DETAILS(step2);
      } catch (error) {
        logger.error(error);
        throw error;
      }
    }
}

export const cmsController = new CMSController();
