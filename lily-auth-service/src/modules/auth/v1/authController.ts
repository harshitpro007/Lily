import {
   MESSAGES, USER_TYPE,
} from "@config/index";
import { logger } from "@lib/logger";
import { decode, createToken, createVerificationToken, decodeVerificationToken, createAdminAccessToken, createTokenRefreshToken } from "@lib/tokenManager";
import { BaseDao } from "@modules/baseDao/BaseDao";
import { decryptData } from "@utils/appUtils";
import { createAdminToken, createTokens } from "./routeValidation";



export class AuthController extends BaseDao {

    /**
   * @function verifyToken
   * @description decode auth token and return the data
   * @param params.authorization // Bearer Token
   * @returns data Object
   */
    async verifyToken(params){
        try {
          let tokenData;
          if(params.tokenType == "VERIFICATION_TOKEN"){
            tokenData = await decodeVerificationToken(params.token);
          }else{
            let jwtToken = params.authorization.split(" ")[1];
            tokenData = await decode(jwtToken);
          }
          return MESSAGES.SUCCESS.DETAILS(tokenData);
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }


    /**
   * @function createAuthToken
   * @description create auth token and return
   * @param params.userId // Bearer Token
   * @param params.accessTokenKey 
   * @param params.deviceId 
   * @param params.type 
   * @param params.userType 
   * @returns JWT token
   */
    async createAuthToken(headers, payload){
      try {
        let decryptedData = decryptData(payload.data);
        if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
        let params = JSON.parse(decryptedData);
        const validation = createTokens.validate(params);
        if (validation.error) {
          return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details));
        }
        let jwtToken
        let refreshToken
        if(params.tokenType == "VERIFICATION_TOKEN"){
          jwtToken = await createVerificationToken(params);
          refreshToken = await createTokenRefreshToken(params);
        }else{
          jwtToken = await createToken(params);
          refreshToken = await createTokenRefreshToken(params);
        }
        return MESSAGES.SUCCESS.DETAILS({jwtToken,refreshToken});
      } catch (error) {
          logger.error(error);
          throw error;
      }
    }
  
    /**
     * @function adminTokenVerification
     * @param payload
     * @param headers
     * @description accepts the payload and return the JWT token
     * @returns Admin access token
     */
    async adminTokenVerification(params, headers){
      try {
        let decryptedData = decryptData(params.data);
        if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
        let payload = JSON.parse(decryptedData);
        const validation = createAdminToken.validate(payload);
        if (validation.error) {
          return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details));
        }
        payload.remoteAddress = params.remoteAddress;
        let jwtToken;
        if(payload.userType == USER_TYPE.ADMIN){
          jwtToken = await createAdminAccessToken({...payload, ...headers});
        }
        return MESSAGES.SUCCESS.DETAILS(jwtToken);
      } catch (error) {
        logger.error(error);
        throw error;
      }
    }
  }
export const authController = new AuthController();
