import _ from "lodash";
import { QueryOptions } from "mongoose";

import * as models from "@modules/models";
import { SERVER } from "@config/environment";
import { stringToBoolean } from "@utils/appUtils";

export class BaseDao {
  async save(model: ModelNames, data: any, options = {}) {
    try {
      options = stringToBoolean(SERVER.MONGO.REPLICA || "false") ? options : {};
      const ModelName: any = models[model];
      return (await new ModelName(data).save(options)).toJSON();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async find(
    model: ModelNames,
    query: any,
    projection: any,
    options = {},
    sort?,
    paginate?,
    populateQuery?: any
  ) {
    try {
      const ModelName: any = models[model];
      options = { ...options, lean: true };
      if (
        !_.isEmpty(sort) &&
        !_.isEmpty(paginate) &&
        _.isEmpty(populateQuery)
      ) {
        // sorting with pagination
        return await ModelName.find(query, projection, options)
          .sort(sort)
          .skip((paginate.pageNo - 1) * paginate.limit)
          .limit(paginate.limit);
      } else if (
        _.isEmpty(sort) &&
        !_.isEmpty(paginate) &&
        _.isEmpty(populateQuery)
      ) {
        // pagination
        return await ModelName.find(query, projection, options)
          .skip((paginate.pageNo - 1) * paginate.limit)
          .limit(paginate.limit);
      } else if (
        _.isEmpty(sort) &&
        _.isEmpty(paginate) &&
        !_.isEmpty(populateQuery)
      ) {
        // populate
        return await ModelName.find(query, projection, options)
          .populate(populateQuery)
          .exec();
      } else if (
        _.isEmpty(sort) &&
        !_.isEmpty(paginate) &&
        !_.isEmpty(populateQuery)
      ) {
        // pagination with populate
        return await ModelName.find(query, projection, options)
          .skip((paginate.pageNo - 1) * paginate.limit)
          .limit(paginate.limit)
          .populate(populateQuery)
          .exec();
      } else if (
        !_.isEmpty(sort) &&
        _.isEmpty(paginate) &&
        _.isEmpty(populateQuery)
      ) {
        // only sorting
        return await ModelName.find(query, projection, options)
          .sort(sort)
          .exec();
      } else {
        return await ModelName.find(query, projection, options);
      }
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async distinct(model: ModelNames, path: string, query: any) {
    try {
      const ModelName: any = models[model];
      return await ModelName.distinct(path, query);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async findOne(
    model: ModelNames,
    query: any,
    projection = {},
    options = {},
    sort?: any,
    populateQuery?: any
  ) {
    try {
      const ModelName: any = models[model];
      options = { ...options, lean: true };
      if (!_.isEmpty(populateQuery) && _.isEmpty(sort)) {
        // populate
        return await ModelName.findOne(query, projection, options)
          .populate(populateQuery)
          .exec();
      } else if (!_.isEmpty(sort) && _.isEmpty(populateQuery)) {
        // populate
        return await ModelName.findOne(query, projection, options)
          .sort(sort)
          .exec();
      } else if (!_.isEmpty(sort) && !_.isEmpty(populateQuery)) {
        // populate
        return await ModelName.findOne(query, projection, options)
          .sort(sort)
          .populate(populateQuery)
          .exec();
      } else {
        return await ModelName.findOne(query, projection, options);
      }
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async findOneAndUpdate(
    model: ModelNames,
    query: any,
    update: any,
    options = {}
  ) {
    try {
      options = { ...options, lean: true };
      const ModelName: any = models[model];
      return await ModelName.findOneAndUpdate(query, update, options);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async findAndRemove(
    model: ModelNames,
    query: any,
    update: any,
    options: QueryOptions
  ) {
    try {
      const ModelName: any = models[model];
      return await ModelName.findOneAndRemove(query, update, options);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async update(
    model: ModelNames,
    query: any,
    update: any,
    options: QueryOptions
  ) {
    try {
      const ModelName: any = models[model];
      return await ModelName.update(query, update, options);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async updateOne(model: ModelNames, query: any, update: any, options: any) {
    try {
      const ModelName: any = models[model];
      return await ModelName.updateOne(query, update, options);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async updateMany(
    model: ModelNames,
    query: any,
    update: any,
    options: QueryOptions
  ) {
    try {
      const ModelName: any = models[model];
      return await ModelName.updateMany(query, update, options);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async remove(model: ModelNames, query: any) {
    try {
      const ModelName: any = models[model];
      return await ModelName.remove(query);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async deleteMany(model: ModelNames, query: any) {
    try {
      const ModelName: any = models[model];
      return await ModelName.deleteMany(query);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async deleteOne(model: ModelNames, query: any) {
    try {
      const ModelName: any = models[model];
      return await ModelName.deleteOne(query);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async count(model: ModelNames, query: any) {
    try {
      const ModelName: any = models[model];
      return await ModelName.count(query);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async countDocuments(model: ModelNames, query: any) {
    try {
      const ModelName: any = models[model];
      return await ModelName.countDocuments(query);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async aggregate(model: ModelNames, aggPipe, options: any = {}) {
    try {
      const ModelName: any = models[model];
      const aggregation: any = ModelName.aggregate(aggPipe);
      if (options) {
        aggregation.options = options;
      }
      return await aggregation.allowDiskUse(true).exec();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async insert(model: ModelNames, data) {
    try {
      const ModelName: any = models[model];
      const obj = new ModelName(data);
      await obj.save();
      return obj;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async insertMany(model: ModelNames, data, options: any) {
    try {
      const ModelName: any = models[model];
      return await ModelName.collection.insertMany(data, options);
    } catch (error) {
      return {};
    }
  }

  async aggregateDataWithPopulate(model: ModelNames, group, populateOptions) {
    try {
      const ModelName: any = models[model];
      const aggregate = await ModelName.aggregate(group);
      const populate = await ModelName.populate(aggregate, populateOptions);
      return populate;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async bulkFindAndUpdate(
    bulk,
    query: any,
    update: any,
    options: QueryOptions
  ) {
    try {
      return await bulk.find(query).upsert().update(update, options);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async bulkFindAndUpdateOne(
    bulk,
    query: any,
    update: any,
    options: QueryOptions
  ) {
    try {
      return await bulk.find(query).upsert().updateOne(update, options);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async findByIdAndUpdate(
    model: ModelNames,
    query: any,
    update: any,
    options: QueryOptions
  ) {
    try {
      const ModelName: any = models[model];
      return await ModelName.findByIdAndUpdate(query, update, options);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async populate(model: ModelNames, data: any, populateQuery: any) {
    try {
      const ModelName: any = models[model];
      return await ModelName.populate(data, populateQuery);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * @description Add skip and limit to pipleine
   */
  addSkipLimit = (limit, pageNo) => {
    if (limit) {
      limit = Math.abs(limit);
      // If limit exceeds max limit
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
    return [{ $skip: skip }, { $limit: limit + 1 }];
  };

  paginate = async (
    model: ModelNames,
    pipeline: Array<Object>,
    limit: number,
    pageNo: number,
    options: any = {},
    pageCount = false
  ) => {
    try {
      pipeline = [...pipeline, ...this.addSkipLimit(limit, pageNo)];
      const ModelName: any = models[model];

      const promiseAll = [
        options.collation
          ? ModelName.aggregate(pipeline)
              .collation({ locale: "en" })
              .allowDiskUse(true)
          : ModelName.aggregate(pipeline).allowDiskUse(true),
      ];

      if (pageCount) {
        const skipIndex = pipeline.findIndex((stage) => "$skip" in stage);
        if (skipIndex !== -1) {
          pipeline = pipeline.slice(0, skipIndex);
        }
        pipeline.push({ $count: "total" });
        promiseAll.push(ModelName.aggregate(pipeline).allowDiskUse(true));
      }

      let [data, totalCount] = await Promise.all(promiseAll);

      let nextHit = 0;
      let total = 0;
      let totalPage = 0;

      if (pageCount) {
        total = totalCount[0] ? totalCount[0]["total"] : 0;
        totalPage = Math.ceil(total / limit);
      }

      if (data.length > limit) {
        nextHit = pageNo + 1;
        data = data.slice(0, limit);
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
      throw new Error(error);
    }
  };
  fastPaginate = async (model: ModelNames, pipeline: Array<Object>, limit: number, pageNo: number, options: any = {}, pageCount = false) => {
    try {
      pipeline = [...pipeline];
      let ModelName: any = models[model];
  
      const promiseAll = [
        options.collation
          ? ModelName.aggregate(pipeline)
              .collation({ locale: "en" })
              .allowDiskUse(true)
          : ModelName.aggregate(pipeline).allowDiskUse(true),
      ];

  
      if (pageCount) {
  
        for (let index = 0; index < pipeline.length; index++) {
          if ("$skip" in pipeline[index]) {
            pipeline = pipeline.slice(0, index);
          } 
        }
        pipeline.push({ "$count": "total" });
        promiseAll.push(ModelName.aggregate(pipeline).allowDiskUse(true));
      }
      let result = await Promise.all(promiseAll);
  
      let nextHit = 0;
      let total = 0;
      let totalPage = 0;
  
      if (pageCount) {
  
        total = result[1] && result[1][0] ? result[1][0]["total"] : 0;//NOSONAR
        totalPage = Math.ceil(total / limit);
      }
  
      let data: any = result[0];
      if (result[0].length > limit) {
        nextHit = pageNo + 1;
        data = result[0].slice(0, limit);
      }
      return {
        "data": data,
        "total": total,
        "pageNo": pageNo,
        "totalPage": totalPage,
        "nextHit": nextHit,
        "limit": limit
      };
    } catch (error) {
      throw new Error(error);
    }
  }
}

export const baseDao = new BaseDao();
