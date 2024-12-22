import { DATA_TYPES, DB_MODEL_REF, ENCRYPTION_ALGORITHM } from "@config/main.constant";

export const collName = DB_MODEL_REF.SUBSCRIPTION;

export function subscriptionEncryptedSchema(key:any, dbName:any) {
    try {
        const subscriptionEncryptedSchema: any = {
            [`${dbName}.${collName}`]: {
                bsonType: DATA_TYPES.OBJECT,
                properties: {
                    userId: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    email:{
                        encrypt: {
                            keyId: [key],
                            bsonType: DATA_TYPES.STRING,
                            algorithm: ENCRYPTION_ALGORITHM.DETERMINISTIC
                        }
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
                    },
                    subscriptionStartDate: {
                        bsonType: DATA_TYPES.NUMBER,
                    },
                    subscriptionEndDate: {
                        bsonType: DATA_TYPES.NUMBER,
                    },
                    stripeCustomerId: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    invoiceId: {
                        bsonType: DATA_TYPES.STRING,
                    }
                },
            },
        };
        return subscriptionEncryptedSchema;
    } catch (error) {
        throw error;
    }
}