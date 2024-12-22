import { DATA_TYPES, DB_MODEL_REF } from "@config/main.constant";

export const collName = DB_MODEL_REF.TICKET;

export function supportTicketEncryptedSchema(key:any, dbName:any) {
    try {
        const supportTicketEncryptedSchema: any = {
          [`${dbName}.${collName}`]: {
            bsonType: DATA_TYPES.OBJECT,
            properties: {
              firstName: {
                bsonType: DATA_TYPES.STRING
              },
              lastName: {
                bsonType: DATA_TYPES.STRING
              },
              email: {
                bsonType: DATA_TYPES.STRING
              },
              requestNo: {
                bsonType: DATA_TYPES.STRING
              },
              created: {
                bsonType: DATA_TYPES.NUMBER,
              },
              details: {
                bsonType: DATA_TYPES.STRING
              },
              userId: {
                bsonType: DATA_TYPES.STRING,
              },
              clinicId: {
                bsonType: DATA_TYPES.STRING,
              },
              clinicName: {
                bsonType: DATA_TYPES.STRING,
              },
              status: {
                bsonType: DATA_TYPES.STRING, /** ACTIVE,DELETED,COMPLETED */
              }
            },
          },
        };
      return supportTicketEncryptedSchema;
    } catch (error) {
      console.log(error);
      throw error;
    }
}