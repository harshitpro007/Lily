"use strict";

import { EncryptionBaseDao } from "@modules/baseDao/EncryptedClientBaseDao";
import { providerDaoV1 } from "@modules/provider";
import { createDateRanges, toObjectId } from "@utils/appUtils";
import { encryptedDb } from "@utils/DatabaseClient";
import moment from "moment";

export class PatientDao extends EncryptionBaseDao {
	
    /**
     * @function addRpmVisit
     * @description add a rpm visit of an patient
     */
    async addRpmVisit(params: PatientRequest.RpmVisit){
        try{
            const collection = encryptedDb.getrpmVisitEncryptedClient();
            return await this.insertOne(collection,params);
        }
        catch(error){
            throw error;
        }
    }

    /**
     * @function getRpmVisitListing
     * @description get the listing of rpm visit of a patient
     */
    async getRpmVisitListing(params: PatientRequest.GetRpmVisit){
        try{
            const collection = encryptedDb.getrpmVisitEncryptedClient();
            const aggPipe = []; // NOSONAR
            const match: any = {};

            match.userId = toObjectId(params.userId);
            if(params.fromDate && params.toDate){
                match.date = {"$gte": params.fromDate, "$lte": params.toDate};
            }
            aggPipe.push({$match : match});
            
            let sort = {};
			(params.sortBy && params.sortOrder) ? sort = { [params.sortBy]: params.sortOrder } : sort = { created: -1 }; // NOSONAR
			aggPipe.push({ "$sort": sort });

            aggPipe.push({
                $project: {
                    userId:1,
                    date:1,
                    time: 1,
                    visitTime:1,
                    isInteraction: 1,
                    communicationMode:1,
                    providerName:1,
                    notes: 1,
                    providerId: 1,
                    type:1
                }
            })
            let result;
            if(params.fromDate && params.toDate){
                result = await this.aggregate(collection,aggPipe);
            }
            const monthsCards = await this.getRpmTime(params);
            return {result,monthsCards};
        }   
        catch(error){
            throw error;
        }
    }

    /**
     * @function getRpmTime
     * @description this function is used to get the total rpm time of every month till due date
     * @returns array of monthCards with total visit time
     */
    async getRpmTime(params: PatientRequest.GetRpmVisit){
        try{
            const collection = encryptedDb.getrpmVisitEncryptedClient();
            const monthsCards = await createDateRanges(params.dueDate, params.created);
            const monthTimestamps = monthsCards.map(monthCard => {
                const [startStr, endStr] = monthCard.split(' - ');
                const start = moment(startStr, 'MM/DD/YYYY').startOf('day').valueOf();
                const end = moment(endStr, 'MM/DD/YYYY').endOf('day').valueOf();
                return { start, end };
            });
            
            const aggregationPromises = monthTimestamps.map(async time => {
                const aggPipe = [
                    { 
                        $match: { 
                            userId: toObjectId(params.userId), 
                            date: { $gte: time.start, $lte: time.end } 
                        } 
                    },
                    {
                        $group: {
                            _id: null,
                            totalTime: { $sum: "$visitTime" } 
                        }
                    }
                ];
                return await this.aggregate(collection,aggPipe);
            });
            const results = await Promise.all(aggregationPromises);
            const monthlyTimeSum = results.map((result, index) => {
                const totalTime = result[0]?.totalTime || 0;
                return {
                    monthRange: monthsCards[index],
                    totalTime
                };
            });
            return monthlyTimeSum;
        }
        catch(error){
            throw error;
        }
    }

    /**    
	* @function editPatientStatus
	* @description update the user status
	*/
	async editPatientStatus(params: ProviderRequest.updateStatus) {
		try {
			const query: any = {};
			const dataToUpdate: any = {}
			query['_id'] = toObjectId(params.userId);
			dataToUpdate['status'] = params.status;

			const collection = encryptedDb.getPatientEncryptedClient();
			return await this.findOneAndUpdate(collection, query, dataToUpdate);
		} catch (error) {
			throw error;
		}
	}

    /**
     * @function editRpmVisit
     * @description edit the rpm visit of an patient
     */
    async editRpmVisit(params: PatientRequest.editRpm){
        try{
            const collection = encryptedDb.getrpmVisitEncryptedClient();
            const query = {
				_id: toObjectId(params.rpmId)
			};
			let dataToSave: any = {};
			if(params.providerId){
                const provider = await providerDaoV1.findUserById(params.providerId);
                dataToSave["providerId"] = toObjectId(params.providerId);
                dataToSave["providerName"] = provider.adminName;
            }

            if(params.date){
                dataToSave["date"] = params.date;
            }

            if(params.visitTime){
                dataToSave["visitTime"] = params.visitTime;
            }

            if(params.notes){
                dataToSave["notes"] = params.notes;
            }

            if(params?.isInteraction === false){
                await this.update(collection,query, {
                    $unset: { communicationMode: 1 } 
                });
                dataToSave["isInteraction"] = params.isInteraction;
            }

            if(params.isInteraction && params.communicationMode){
                dataToSave["isInteraction"] = params.isInteraction;
                dataToSave["communicationMode"] = params.communicationMode;
            }

            if(params.time){
                dataToSave["time"] = params.time;
            }

            if(params.type){
                dataToSave["type"] = params.type;
            }
			return await this.findOneAndUpdate(collection, query, dataToSave, {});
        }
        catch(error){
            throw error;
        }
    }
}

export const patientDao = new PatientDao();