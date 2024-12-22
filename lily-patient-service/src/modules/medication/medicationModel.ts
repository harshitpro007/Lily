import { DB_MODEL_REF, DATA_TYPES, ENCRYPTION_ALGORITHM } from "@config/main.constant";
export const collName = DB_MODEL_REF.MEDICATION;

export const medicationEncryptedSchema = (key: any, dbName: any) => {
    try {
      const medicationEncryptedSchema: any = {
        [`${dbName}.${collName}`]: {
          bsonType: DATA_TYPES.OBJECT, 
          properties: {
            userId: {
                bsonType: DATA_TYPES.OBJECTID,
            },
            type: {
                bsonType: DATA_TYPES.STRING,
            },
            category: {
                bsonType: DATA_TYPES.STRING,
            },
            time: {
              bsonType: DATA_TYPES.NUMBER,
            },
            date: {
                bsonType: DATA_TYPES.STRING,
            },
            dateAsString: {
              bsonType: DATA_TYPES.STRING,
            },
            name: {
                encrypt: {
                    keyId: [key],
                    bsonType: DATA_TYPES.STRING,
                    algorithm: ENCRYPTION_ALGORITHM.DETERMINISTIC
                }
            },
            dosage: {
                bsonType: DATA_TYPES.NUMBER,
            },
            medicationTime: {
              bsonType: DATA_TYPES.STRING,
            },
            created: {
                bsonType: DATA_TYPES.NUMBER,
            },
            updated: {
                bsonType: DATA_TYPES.NUMBER,
            }
          },
        },
      };
      return medicationEncryptedSchema;
    } catch (error) {
      throw error;
    }
  }