"use strict";

import { STATUS } from "@config/main.constant";
import { BaseDao } from "@modules/baseDao/BaseDao";
export class CmsDao extends BaseDao {

	/**
	 * @function getFaqs
	 * @description get the faqs listing
	 */
	async getFaqs(params: ListingRequest) {
		try {
			const aggPipe = [];
			const match: any = {};
			if(params.status){
				match.status = { "$in": params.status}
			}
			else{
				match.status = {"$ne": STATUS.DELETED}
			}
			if (Object.keys(match).length) aggPipe.push({ "$match": match });
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
			const options = { collation: true };
			return await this.paginate("faq", aggPipe, params.limit, params.pageNo, options, true);
		} catch (error) {
			throw error;
		}
	}
}

export const cmsDao = new CmsDao();