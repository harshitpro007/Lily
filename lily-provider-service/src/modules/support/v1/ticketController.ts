"use strict";
import {
  decryptData,
  encryptData,
  getRandomOtp,
  toObjectId,
} from "@utils/appUtils";
import {
  STATUS,
  MESSAGES,
} from "@config/index";
import { encryptedDb } from "@utils/DatabaseClient";
import { createTicket, Ticket } from "@modules/support/v1/routeValidator";
import { providerDaoV1 } from "@modules/provider";
import { ticketDao } from "@modules/support/v1/ticketDao";

export class TicketController {    
  /**
   * @function createTicket
   * @description create support ticket with provider portal
   * @params payload contains encrypted data : decrypted params defined below
   * @returns Details of created ticket
   */
  async createTicket(payload: TicketRequest.Payload, tokenData: TokenData) {
    try {
      const userId= tokenData.userId;
      const ticketColl = encryptedDb.getTicketEncryptedClient();
      let decryptedData = decryptData(payload.data);
      if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: TicketRequest.createTicket = JSON.parse(decryptedData);
      const validation = createTicket.validate(params);
      if (validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
      }
      const step1= await providerDaoV1.findUserById(userId);
      params.requestNo= getRandomOtp(5);
      params.userId= step1._id;
      params.created= Date.now();
      params.status= STATUS.ACTIVE;
      params.clinicId= step1.clinicId;
      params.clinicName= step1.clinicName;
      const step2= await ticketColl.insertOne(params);
      const step3 = encryptData(JSON.stringify(step2));
      return MESSAGES.SUCCESS.DETAILS(step3);
    }
    catch (error) {
      throw error;
    }
  }    

  /**
   * @function editTicket
   * @description create support ticket with provider portal
   * @params payload contains encrypted data : decrypted params defined below
   * @returns Object of edited ticket
  */
  async editTicket(payload: TicketRequest.Payload) {
    try {
      const ticketColl = encryptedDb.getTicketEncryptedClient();
      let decryptedData = decryptData(payload.data);
      if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: TicketRequest.Ticket = JSON.parse(decryptedData);
      const validation = Ticket.validate(params);
      if (validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
      }
      let update:any={};
      if(params.status) update.status= params.status;
      if(params.details) update.details= params.details;
      if(params.firstName) update.firstName= params.firstName;
      if(params.lastName) update.lastName= params.lastName;
      if(params.email) update.email= params.email;
      await ticketColl.updateOne({_id:toObjectId(params._id)},{$set:update});
      const step2= await ticketColl.findOne({_id:toObjectId(params._id)});
      const step3 = encryptData(JSON.stringify(step2));
      return MESSAGES.SUCCESS.DETAILS(step3);
    }
    catch (error) {
      throw error;
    }
  }    

  /**
   * @function getTicket
   * @description create support ticket with provider portal
   * @params payload contains encrypted data : decrypted params defined below
   * @returns Object of ticket data
  */
  async getTicket(params: TicketRequest.Ticket) {
    try {
      const ticketColl = encryptedDb.getTicketEncryptedClient();
      const step1= await ticketColl.findOne({_id:toObjectId(params._id)});
      const step2 = encryptData(JSON.stringify(step1));
      return MESSAGES.SUCCESS.DETAILS(step2);
    }
    catch (error) {
      throw error;
    }
  }   

    /**
   * @function getTicket
   * @description create support ticket with provider portal
   * @params payload contains encrypted data : decrypted params defined below
   * @returns list of tickets
  */
    async ticketListingDetails(params: ListingRequest,tokenData:TokenData) {
      try {
        let data = await ticketDao.getTicketListing(params, tokenData);
        data = encryptData(JSON.stringify(data));
        return MESSAGES.SUCCESS.DETAILS(data);
      }
      catch (error) {
        throw error;
      }
    } 


}

export const ticketController = new TicketController();
