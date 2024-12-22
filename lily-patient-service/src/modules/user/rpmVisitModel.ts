import { DATA_TYPES, DB_MODEL_REF } from "@config/main.constant";

export const collName = DB_MODEL_REF.RPM_VISIT;

export function rpmVisitEncryptedSchema(key:any, dbName:any) {
    try {
        const rpmVisitEncryptedSchema: any = {
            [`${dbName}.${collName}`]: {
                bsonType: DATA_TYPES.OBJECT,
                properties: {
                    clinicId: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    providerId: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    providerName: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    userId: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    date: {
                        bsonType: DATA_TYPES.NUMBER,
                    },
                    time: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    visitTime: {
                        bsonType: DATA_TYPES.NUMBER,
                    },
                    notes: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    isInteraction: {
                        bsonType: DATA_TYPES.BOOLEAN,
                    },
                    communicationMode: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    created: {
                        bsonType: DATA_TYPES.NUMBER,
                    },
                    updated: {
                        bsonType: DATA_TYPES.NUMBER,
                    },
                    type:{
                        bsonType: DATA_TYPES.STRING,
                    }
                },
            },
        };
        return rpmVisitEncryptedSchema;
    } catch (error) {
        console.log(error);
        throw error;
    }
}