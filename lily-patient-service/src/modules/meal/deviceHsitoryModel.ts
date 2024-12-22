import { DB_MODEL_REF, DATA_TYPES, STATUS } from "@config/main.constant";
export const collName = DB_MODEL_REF.DEVICE_HISTORY;

export const deviceHsitoryEncryptedSchema = (key: any, dbName: any) => {
    try {
      const deviceHsitoryEncryptedSchema: any = {
        [`${dbName}.${collName}`]: {
          bsonType: DATA_TYPES.OBJECT, 
          properties: {
            userId: {
                bsonType: DATA_TYPES.OBJECTID,
            },
            date: {
                bsonType: DATA_TYPES.STRING
            },
            glucose: {
                bsonType: DATA_TYPES.ARRAY,
                items: {
                    bsonType: DATA_TYPES.OBJECT,
                    properties: {
                        time: {
                            bsonType: DATA_TYPES.STRING,
                        },
                        value: {
                            bsonType: DATA_TYPES.STRING,
                        },
                        timeInMsec: {
                            bsonType: DATA_TYPES.NUMBER,
                        }
                    }
                }
            },
            status: {
                bsonType: DATA_TYPES.STRING,
            },
            deviceType: {
                bsonType: DATA_TYPES.STRING,
            },
            created: {
                bsonType: DATA_TYPES.NUMBER,
            },
            updated: {
                bsonType: DATA_TYPES.NUMBER,
            },
          },
        },
      };
      return deviceHsitoryEncryptedSchema;
    } catch (error) {
      throw error;
    }
  }