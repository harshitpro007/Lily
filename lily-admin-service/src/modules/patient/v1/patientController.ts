"use strict";

import { SERVER } from "@config/environment";
import { axiosService } from "@lib/axiosService";
import { MESSAGES, USER_TYPE } from "@config/index";
import { decryptData, encryptData } from "@utils/appUtils";
import * as patientConstant from "@modules/patient/v1/patientConstant";
import { patientDetails } from "./routeValidator";


export class PatientController {

  /**
   * @function getAllPatients
   * @description get the listing of all patient 
   * @param params.pageNo page no (required)
   * @param params.limit limit (required)
   * @returns list of all the patient
   */
  async getAllPatients(params: PatientRequest.PatientListing, accessToken: string){
    try{
        let data = await axiosService.getData({"url":SERVER.PATIENT_APP_URL + SERVER.GET_PATIENTS, "payload": params, auth: accessToken });
        return patientConstant.MESSAGES.SUCCESS.LIST(data);
    }
    catch(error){
        throw error
    }
  }

  /**
   * @function getClinicData
   * @description search the clinic by clinic name
   * @param params.clinicName clinic name (required)
   * @returns clinic details object
   */
  async getClinicData(params: PatientRequest.Clinic, accessToken:string){
    try{
      let data = await axiosService.get({"url":SERVER.PROVIDER_APP_URL + SERVER.SEARCH_CLINIC, "payload": params, auth: accessToken });
      return patientConstant.MESSAGES.SUCCESS.DETAILS(data.data);
    }
    catch(error){
      throw error;
    }
  }  

  /**
   * @function getproviderData
   * @description search the provider by provider name
   * @param params.providerName provider name (required)
   * @returns provider details object
   */
  async getproviderData(params: PatientRequest.Provider, accessToken:string){
    try{
      let data = await axiosService.get({"url":SERVER.PROVIDER_APP_URL + SERVER.SEARCH_PROVIDER, "payload": params, auth: accessToken });
      return patientConstant.MESSAGES.SUCCESS.DETAILS(data.data);
    }
    catch(error){
      throw error;
    }
  }
  
  /**
   * @function getPatientsDetails
   * @description get the details of a patient
   * @param params.userId user id (required)
   * @returns patient details object
   */
  async getPatientsDetails(params: UserId, accessToken: string){
    try{
      let data = await axiosService.get({"url":SERVER.PATIENT_APP_URL + SERVER.PATIENT_PROFILE, "payload": params, auth: accessToken });
      return patientConstant.MESSAGES.SUCCESS.DETAILS(data.data);
    }
    catch(error){
      throw error;
    }
  }

  /**
   * @function resetPatientPassword
   * @description reset the password of patient
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.userId user's id (required)
   * @returns 
   */
  async resetPatientPassword(payload: PatientRequest.Payload, accessToken: string){
    try{
      let decryptedData = decryptData(payload.data);
      if(!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR); //NOSONAR
      let params: UserId = JSON.parse(decryptedData);
      const validation = patientDetails.validate(params);
      if(validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message)); //NOSONAR
      }

      await axiosService.patchData({"url":SERVER.PATIENT_APP_URL + SERVER.RESET_PASSWORD, "body": payload, auth: accessToken });
      return patientConstant.MESSAGES.SUCCESS.RESET_PASSWORD;
    }
    catch(error){
      if(error.response.data){
        throw error.response.data;
      }
      throw error;
    }
  }

  /**
   * @function updatePatientStatus
   * @description Block the status of patient
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.userId user's id (required)
   * @returns 
   */
  async updatePatientStatus(payload: PatientRequest.Payload, accessToken: string){
    try{
      let decryptedData = decryptData(payload.data);
      if(!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR); //NOSONAR
      let params: UserId = JSON.parse(decryptedData);
      const validation = patientDetails.validate(params);
      if(validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message)); //NOSONAR
      }

      await axiosService.patchData({"url":SERVER.PATIENT_APP_URL + SERVER.BLOCK_PATIENT, "body": payload, auth: accessToken });
      return patientConstant.MESSAGES.SUCCESS.BLOCK_USER;
    }
    catch(error){
      throw error;
    }
  }

  async getRpmAndGlucoseHistoryData(params: PatientRequest.PatientRpmData, accessToken: string) {
    try {
      const glucosAndRpmHistoryData = await axiosService.get({"url":SERVER.PATIENT_APP_URL + SERVER.PATIENT_GLUCOSE_DATA, "payload": params, auth: accessToken });
      let data = encryptData(JSON.stringify(glucosAndRpmHistoryData.data))
      return MESSAGES.SUCCESS.DETAILS(data);
    }
    catch (error) {
      throw error;
    }
  }
}

export const patientController = new PatientController();
