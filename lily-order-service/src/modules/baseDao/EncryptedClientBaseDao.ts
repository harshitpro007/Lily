import { AggregateOptions, UpdateOptions } from 'mongodb';

interface PaginateOptions {
  pageNo: number;
  limit: number;
}

export class EncryptionBaseDao {
  async insertOne(coll: any, document: any, options?: any) {
    try{
        const data = await coll.insertOne(
          {
            ...document,
            created: Date.now(),
            updated: Date.now(),
          }, options)
        return data;
    }
    catch(error){
        return Promise.reject(error);
    }
  }

  async findOne(coll: any, filter: any, options?: any) {
    try{
      console.log('filter',filter)
        return await coll.findOne(filter, options);
    }
    catch(error){
        return Promise.reject(error);
    }
  }

  async findOneAndUpdate(coll: any, query: any, update: any, options = {}) {
    try {
      update['updated'] = Date.now();
      return await coll.findOneAndUpdate(query, {$set: update}, options);
    } catch (error) {
        return Promise.reject(error);
    }
}

  async updateOne(coll: any, searchObj: any, updateObj?: any, options?: UpdateOptions) {
    try{
        updateObj['updated'] = Date.now();
        await coll.updateOne(searchObj, { $set: updateObj });
        return await coll.findOne(searchObj)
    }
    catch(error){
        return Promise.reject(error);
    }
  }

  async updateMany(coll: any, query: any, update: any, options = {}) {
		try {
      update['updated'] = Date.now();
			return await coll.updateMany(query, { $set: update });
		} catch (error) {
			return Promise.reject(error);
		}
	}

  async updateDocumentPush(coll: any, searchObj: any, updateObj?: any, options?: UpdateOptions) {
    try{
        return await coll.updateOne(
          searchObj,
          { $push: updateObj, $set: { updated: Date.now() } },
          options 
        );
    }
    catch(error){
        return Promise.reject(error);
    }
  }

  async find(coll: any, filter: any, options?: any) {
    try{
        return await coll.find(filter, options).toArray();
    }
    catch(error){
        return Promise.reject(error);
    }
  }

  async aggregate(coll: any, query: any[], options?: AggregateOptions) {
    try{
        return await coll.aggregate(query, options).toArray();
    }
    catch(error){
        return Promise.reject(error);
    }
  }

  async aggregateAndPaginate(
    coll: any,
    pipeline: any[],
    limit: number,
    pageNo: number,
    pageCount = false,
  ) {
    try {
      pipeline = [...pipeline];
      let promiseAll = [];
      promiseAll = [coll.aggregate(pipeline).toArray()];
      if (pageCount) {
        for (let index = 0; index < pipeline.length; index++) {
          if ('$skip' in pipeline[index]) {
            pipeline = pipeline.slice(0, index);
          }
        }
        pipeline.push({ $count: 'total' });
        promiseAll.push(coll.aggregate(pipeline).toArray());
      }

      const result = await Promise.all(promiseAll);
      let nextHit = 0;
      let total = 0;
      let totalPage = 0;

      if (pageCount) {
        total = result[1]?.[0]?.['total'] ?? 0;
        totalPage = Math.ceil(total / limit);
      }

      let data: any[] = result[0];
      if (result[0].length > limit) {
        nextHit = pageNo + 1;
        data = result[0].slice(0, limit);
      }

      return {
        data: data,
        total: total,
        pageNo: pageNo,
        totalPage: totalPage,
        nextHit: nextHit,
        limit: limit,
      };
    } catch (error) {
        return Promise.reject(error);
    }
  }


  async countDocuments(coll: any, filter: any) {
    try{
        return await coll.countDocuments(filter)
    }
    catch(error){
        return Promise.reject(error);
    }
  }

  addSkipLimit = (limit: number | undefined, pageNo: number | undefined) => {
    if (limit) {
      limit = Math.abs(limit);
      if (limit > 100) {
        limit = 100;
      }
    } else {
      limit = 10;
    }
    if (pageNo && pageNo !== 0) {
      pageNo = Math.abs(pageNo);
    } else {
      pageNo = 1;
    }
    const skip = limit * (pageNo - 1);
    return [{ $skip: skip }, { $limit: limit + 1 }] as const;
  };

}

export const encryptionBaseDao = new EncryptionBaseDao();