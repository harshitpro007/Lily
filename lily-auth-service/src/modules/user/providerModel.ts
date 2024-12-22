import { DATA_TYPES, DB_MODEL_REF } from "@config/main.constant";

export const collName = DB_MODEL_REF.PROVIDER;

export function providerEncryptedSchema(key:any, dbName:any) {
    try {
        const providerEncryptedSchema: any = {
            [`${dbName}.${collName}`]: {
                bsonType: DATA_TYPES.OBJECT,
                properties: {
                    clinicName: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    clinicId: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    adminName: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    street: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    city: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    state: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    zipCode: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    fistName: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    lastName: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    countryCode: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    mobileNo: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    fullMobileNo: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    profilePicture: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    email: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    hash: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    salt: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    userType: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    status: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    subscriptionType: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    subscriptionDetails: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    subscriptionCharges: {
                        bsonType: DATA_TYPES.INTEGER,
                    },
                    contract: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    organizationalNPI: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    totalPaitents: {
                        bsonType: DATA_TYPES.INTEGER,
                    },
                    totalProviders: {
                        bsonType: DATA_TYPES.INTEGER,
                    },
                    created: {
                        bsonType: DATA_TYPES.NUMBER,
                    },
                    updated: {
                        bsonType: DATA_TYPES.NUMBER,
                    },
                    isPasswordReset: {
                        bsonType: DATA_TYPES.BOOLEAN,
                    },
                    refreshToken:{
                        bsonType: DATA_TYPES.STRING,
                    },
                    isSubscribed: {
                        bsonType: DATA_TYPES.BOOLEAN,
                    },
                    subscriptionStartDate: {
                        bsonType: DATA_TYPES.NUMBER,
                    },
                    subscriptionEndDate: {
                        bsonType: DATA_TYPES.NUMBER,
                    },
                    isMainProvider: {
                        bsonType: DATA_TYPES.BOOLEAN,
                    },
                    lastLogin: {
                        bsonType: DATA_TYPES.NUMBER,
                    },
                    ehrToken: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    createdBy: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    resendDate: {
                        bsonType: DATA_TYPES.NUMBER,
                    },
                    addedBy:{
                        bsonType: DATA_TYPES.OBJECTID,
                    },
                    language: {
                        bsonType: DATA_TYPES.STRING,
                    },
                    stripeCustomerId: {
                        bsonType: DATA_TYPES.STRING,
                    }
                },
            },
        };
        return providerEncryptedSchema;
    } catch (error) {
        console.log(error);
        throw error;
    }
}