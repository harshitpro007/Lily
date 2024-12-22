import { DB_MODEL_REF, DATA_TYPES } from '@config/main.constant';
export const collName = DB_MODEL_REF.PROVIDER;

export function providerEncryptedSchema(key: any, dbName: any) {
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
          address: {
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
            bsonType: DATA_TYPES.NUMBER,
          },
          contract: {
            bsonType: DATA_TYPES.STRING,
          },
          organizationalNPI: {
            bsonType: DATA_TYPES.STRING,
          },
          totalPaitents: {
            bsonType: DATA_TYPES.NUMBER,
          },
          totalProviders: {
            bsonType: DATA_TYPES.NUMBER,
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
          refreshToken: {
            bsonType: DATA_TYPES.STRING,
          },
          zipCode: {
            bsonType: DATA_TYPES.STRING,
          },
          isSubscribed: {
            bsonType: DATA_TYPES.BOOLEAN,
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
        },
      },
    };
    return providerEncryptedSchema;
  } catch (error) {
    throw error;
  }
}