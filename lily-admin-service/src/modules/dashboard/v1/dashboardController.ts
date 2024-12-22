"use strict";

import { MESSAGES } from "@config/index";
import { logger } from "@lib/logger";
import { decryptData, encryptData } from "@utils/appUtils";
import { updateDashboard } from "./routeValidator";
import { dashboardDaoV1 } from "..";


export class DashboardController {

    /**
     * @function updateDashboardData
     * @description update the data of dashboard
     * @payload payload contains encrypted data : decrypted params defined below
     * @param params.type type (required)
     * @returns 
     */
    async updateDashboardData(payload: DashboardRequest.Payload){
        try{
            let decryptedData = decryptData(payload.data);
            if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
            let params: DashboardRequest.updateDashboard = JSON.parse(decryptedData);
            const validation = updateDashboard.validate(params);
            if (validation.error) {
                return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details));
            }

            const dashboard = await dashboardDaoV1.isDashbaordExist();
            await dashboardDaoV1.updateDashboardData(params, dashboard)
            return MESSAGES.SUCCESS.DASHBOARD_UPDATED;
        }
        catch(error){
            logger.error(error);
            throw error;
        }
    }

    /**
     * @function dashboard
     * @description get the data of dashboard
     */
    async dashboard(){
        try{
            let data = await dashboardDaoV1.dashboard();
            data = encryptData(JSON.stringify(data));
            return MESSAGES.SUCCESS.DETAILS(data);
        }
        catch(error){
            logger.error(error);
            throw error;
        }
    }
  
}

export const dashboardController = new DashboardController();
