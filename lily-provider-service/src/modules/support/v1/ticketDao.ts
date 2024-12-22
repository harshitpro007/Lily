import { STATUS } from "@config/main.constant";
import { encryptedDb } from "@utils/DatabaseClient";
import { EncryptionBaseDao } from "@modules/baseDao/EncryptedClientBaseDao";
import { escapeSpecialCharacter, toObjectId } from "@utils/appUtils";
export class TicketDao extends EncryptionBaseDao {

  /**
   * @function getTicketListing
   * @description get the listing of tickets 
   */
  async getTicketListing(params: ListingRequest, tokenData: TokenData){
    try{
      const aggPipe = [];
      const collection = encryptedDb.getTicketEncryptedClient();
      const match: any = {};
      if(!params.isAdmin) match.userId= toObjectId(tokenData.userId);
      if(!params.isAdmin) match.status = {"$in": [STATUS.ACTIVE,STATUS.COMPLETED]};
      if (params.fromDate && !params.toDate) match.created = { "$gte": params.fromDate };
			if (params.toDate && !params.fromDate) match.created = { "$lte": params.toDate };
			if (params.fromDate && params.toDate) match.created = { "$gte": params.fromDate, "$lte": params.toDate };
      if(params.status) match.status= params.status;//NOSONAR
      if (params.searchKey) {
        params.searchKey = escapeSpecialCharacter(params.searchKey);
        match["$or"] = [
          { clinicName: { "$regex": params.searchKey, "$options": "i" } },
          { requestNo: { "$regex": params.searchKey, "$options": "i" } },
        ];
      }      
      aggPipe.push({ "$match": match });  
      let sort = {};
      (params.sortBy && params.sortOrder) ? sort = { [params.sortBy]: params.sortOrder } : sort = { created: -1 }; // NOSONAR
      aggPipe.push({ "$sort": sort });
      if (params.limit && params.pageNo) {
        const [skipStage, limitStage] = this.addSkipLimit(
          params.limit,
          params.pageNo,
        );
        aggPipe.push(skipStage, limitStage);
      }
  
      return await this.aggregateAndPaginate(collection, aggPipe, params.limit, params.pageNo,true);
    }catch(error) {
      throw error;
    }
  }
}

export const ticketDao = new TicketDao();
