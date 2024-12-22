import axios from "axios";
import { createEpicToken } from "./tokenManager";
import { SERVER } from "@config/environment";
import { redisClient } from "./redis/RedisClient";
import { EPIC_REDIS_KEY } from "@config/index";
import moment from "moment";
import { formatPhoneNumber } from "@utils/appUtils";

export class Epic{

    async getAccessToken(token) {
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_assertion_type', SERVER.EPIC_URL.CLIENT_ASSERTION_TYPE);
        params.append('client_assertion', token);
        try {
            const response = await axios.post(SERVER.EPIC_URL.OAUTH_URL, params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            redisClient.setExp(
                EPIC_REDIS_KEY,
                SERVER.TOKEN_INFO.EXPIRATION_TIME.EPIC_EXPIRY / 1000,
                JSON.stringify({ accessToken: response.data.access_token })
            );
            return response.data.access_token;
        } catch (error) {
            throw error;
        }
    }
    
    async getPatientData(params: UserRequest.CreatePatient, search: boolean = false){
        try{
            params.dob = moment(params.dob, 'MM/DD/YYYY').format('YYYY-MM-DD');
            params.mobileNo = await formatPhoneNumber( params.mobileNo);
            const accessToken = await this.getToken();
            const url = `${SERVER.EPIC_URL.FHIR_BASE_URL}/Patient/?telecom=${params.mobileNo}&birthdate=${params.dob}&given=${params.firstName}&family=${params.lastName}&gender=Female`
            const result = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
            });
            if(!search){
                let response;
                if(result.data.entry[0].resource.id){
                    const observationData = await this.getPatientObservation(result.data.entry[0].resource.id);
                    if (observationData[0].resource.resourceType !== "OperationOutcome") {
                        response = await this.getLatestWeightAndHeight(observationData);
                        response.patientId = result.data.entry[0].resource.id;
                        return response;
                    }
                }
                else{
                    return {};
                }
            }
            else{
                return result.data;
            }
        }
        catch(error){
            console.log(error);
            throw error;
        }
    }

    async getToken(){
        try{
            let tokenData:any =  await redisClient.getValue(EPIC_REDIS_KEY);
            tokenData = JSON.parse(tokenData);
            let accessToken;
            if(!tokenData?.accessToken){
                const token = await createEpicToken();
                accessToken = await this.getAccessToken(token);
            }
            else{
                accessToken = tokenData?.accessToken;
            }
            return accessToken
        }
        catch(error){
            throw error;
        }
    }

    async getPatientById(patientId: string){
        try{
            const accessToken = await this.getToken();
            const url = `${SERVER.EPIC_URL.FHIR_BASE_URL}/Patient/${patientId}`
            const result = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
            });
            let response;
            const observationData = await this.getPatientObservation(patientId);
            if (observationData[0].resource.resourceType !== "OperationOutcome") {
                response = await this.getLatestWeightAndHeight(observationData);
            }
            
            return {epicData: result.data, response};
        }
        catch(error){
            throw error;
        }
    }

    async getPatientObservation(patientId: string) {
        try {
            const accessToken = await this.getToken();
            const url = `${SERVER.EPIC_URL.FHIR_BASE_URL}/Observation?category=vital-signs&patient=${patientId}`
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/fhir+json'
                },
            });
            return response.data.entry;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getLatestWeightAndHeight(observationData){
        const weightAndHeightObservations = [];
        const data:any = {};
        observationData.forEach((item) => {
            const resource = item.resource;
            if (resource.code && resource.code.text) {
                if (resource.code.text === "Weight" || resource.code.text === "Height") {
                    weightAndHeightObservations.push(resource);
                }
            }
        });

        weightAndHeightObservations.sort((a: any, b: any) => {
            return new Date(b.effectiveDateTime).getTime() - new Date(a.effectiveDateTime).getTime();
        });

        const latestWeight = weightAndHeightObservations.find(obs => obs.code.text === "Weight");
        if (latestWeight) {
            const observationId = latestWeight.id;
            const componentValue = latestWeight.valueQuantity?.value;
            const componentUnit = latestWeight.valueQuantity?.unit;
            const weightValue = `${componentValue} ${componentUnit}`;
            data.weightObservationId = observationId;
            data.weightValue = weightValue;
            
        }

        const latestHeight = weightAndHeightObservations.find(obs => obs.code.text === "Height");
        if (latestHeight) {
            const observationId = latestHeight.id;
            const componentValue = latestHeight.valueQuantity?.value;
            const componentUnit = latestHeight.valueQuantity?.unit;
            const heightValue = `${componentValue} ${componentUnit}`;
            data.heightObservationId = observationId;
            data.heightValue = heightValue;
        }
        return data;
    }
}

export const epic = new Epic();