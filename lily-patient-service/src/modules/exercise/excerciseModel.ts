import { DB_MODEL_REF, DATA_TYPES } from "@config/main.constant";
export const collName = DB_MODEL_REF.EXERCISE;

export const exerciseEncryptedSchema = (key: any, dbName: any) => {
    try {
      const exerciseEncryptedSchema: any = {
        [`${dbName}.${collName}`]: {
          bsonType: DATA_TYPES.OBJECT, 
          properties: {
            userId: {
                bsonType: DATA_TYPES.OBJECTID,
            },
            type: {
              bsonType: DATA_TYPES.STRING, /** WALKING,CYCLING,YOGA,SWIMMING */
            },     
            category: {
              bsonType: DATA_TYPES.STRING, /** EXERCISE, (GOOGLE-AAPLE)-HEALTH */
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
            duration: {
              bsonType: DATA_TYPES.NUMBER  /**In Minutes Yoga, swimming */
            },
            distance: {
              bsonType: DATA_TYPES.NUMBER  /**In Metre Cycle */
            },
            intensity: {
              bsonType: DATA_TYPES.STRING /** LOW, MEDIUM,HIGH */
            },
            steps: {
              bsonType: DATA_TYPES.NUMBER
            },
            sleep: {
              bsonType: DATA_TYPES.NUMBER /** In Minutes*/
            },
            heartRate: {
              bsonType: DATA_TYPES.NUMBER 
            },
            calories: {
              bsonType: DATA_TYPES.NUMBER 
            },
            lastSync: {
              bsonType: DATA_TYPES.STRING
            },
            created: {
                bsonType: DATA_TYPES.NUMBER,
            },
            walking: {
              bsonType: DATA_TYPES.NUMBER
            },
            cycling: {
              bsonType: DATA_TYPES.NUMBER
            },
            yoga: {
              bsonType: DATA_TYPES.NUMBER
            },
            swimming: {
              bsonType: DATA_TYPES.NUMBER
            },
            updated: {
                bsonType: DATA_TYPES.NUMBER,
            }
          },
        },
      };
      return exerciseEncryptedSchema;
    } catch (error) {
      throw error;
    }
  }