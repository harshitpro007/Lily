import { DB_MODEL_REF, DATA_TYPES, ENCRYPTION_ALGORITHM } from "@config/main.constant";
export const collName = DB_MODEL_REF.MEAL;

export const mealEncryptedSchema = (key: any, dbName: any) => {
    try {
      const mealEncryptedSchema: any = {
        [`${dbName}.${collName}`]: {
          bsonType: DATA_TYPES.OBJECT, 
          properties: {
            userId: {
                bsonType: DATA_TYPES.OBJECTID,
            },
            category: {
                bsonType: DATA_TYPES.STRING,
            },
            time: {
                bsonType: DATA_TYPES.NUMBER,
            },
            mealTime: {
              bsonType: DATA_TYPES.STRING,
            },
            date: {
              bsonType: DATA_TYPES.STRING,
            },
            dateAsString: {
              bsonType: DATA_TYPES.STRING,
            },
            image: {
              encrypt: {
                keyId: [key],
                bsonType: DATA_TYPES.STRING,
                algorithm: ENCRYPTION_ALGORITHM.DETERMINISTIC
              }
            },
            description: {
              encrypt: {
                keyId: [key],
                bsonType: DATA_TYPES.STRING,
                algorithm: ENCRYPTION_ALGORITHM.DETERMINISTIC
              }
            },
            carbs: {
              encrypt: {
                keyId: [key],
                bsonType: DATA_TYPES.NUMBER,
                algorithm: ENCRYPTION_ALGORITHM.DETERMINISTIC
              }
            },
            notes: {
              encrypt: {
                keyId: [key],
                bsonType: DATA_TYPES.STRING,
                algorithm: ENCRYPTION_ALGORITHM.DETERMINISTIC
              }
            },
            glucose: {
                bsonType: DATA_TYPES.NUMBER,
            },
            glucose_2hr: {
              bsonType: DATA_TYPES.NUMBER,
            },
            unit: {
              encrypt: {
                keyId: [key],
                bsonType: DATA_TYPES.STRING,
                algorithm: ENCRYPTION_ALGORITHM.DETERMINISTIC
              }
            },
            isMealExists: {
              bsonType: DATA_TYPES.BOOLEAN,
            },
            isDescOrImageExists: {
              bsonType: DATA_TYPES.BOOLEAN,
            },
            isGlucoseExists: {
              bsonType: DATA_TYPES.BOOLEAN,
            },
            isGlucoseExist2hr:{
              bsonType: DATA_TYPES.BOOLEAN,
            },
            isMedicationExists: {
              bsonType: DATA_TYPES.BOOLEAN,
            },
            medicationType: {
              bsonType: DATA_TYPES.STRING,
            },
            medicationTime: {
              bsonType: DATA_TYPES.STRING,
            },
            glucoseInRange: {
              bsonType: DATA_TYPES.STRING,
            },
            created: {
                bsonType: DATA_TYPES.NUMBER,
            },
            updated: {
                bsonType: DATA_TYPES.NUMBER,
            },
            isAutomatic: {
              bsonType: DATA_TYPES.BOOLEAN,
            }
          },
        },
      };
      return mealEncryptedSchema;
    } catch (error) {
      throw error;
    }
  }