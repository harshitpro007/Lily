import { DATA_TYPES, DB_MODEL_REF } from "@config/main.constant";

export const collName = DB_MODEL_REF.TRANSACTION_HISTORY;

export function transactionHistoryEncryptedSchema(key:any, dbName:any) {
    try {
        const transactionHistoryEncryptedSchema: any = {
            [`${dbName}.${collName}`]: {
                bsonType: DATA_TYPES.OBJECT,
                properties: {
                    userId: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    originalTransactionId: {
                        bsonType: DATA_TYPES.NUMBER,
                    },
                    transactionId: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    status: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    subscriptionType: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    amount:{
                        bsonType: DATA_TYPES.NUMBER,
                    },
                    clinicId: {
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
        return transactionHistoryEncryptedSchema;
    } catch (error) {
        console.log(error);
        throw error;
    }
}