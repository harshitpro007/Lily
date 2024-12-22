import { DB_MODEL_REF, DATA_TYPES } from "@config/main.constant";
export const collName = DB_MODEL_REF.USER;

export const userEncryptedSchema = (key: any, dbName: any) => {
  try {
    const userEncryptedSchema: any = {
      [`${dbName}.${collName}`]: {
        bsonType: DATA_TYPES.OBJECT, 
        properties: {
          firstName: {
            bsonType: DATA_TYPES.STRING,
          },
          lastName: {
            bsonType: DATA_TYPES.STRING,
          },
          profilePicture: {
            bsonType: DATA_TYPES.STRING,
          },
          fullName: {
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
          countryCode: {
            bsonType: DATA_TYPES.STRING,
          },
          mobileNo: {
            bsonType: DATA_TYPES.STRING,
          },
          fullMobileNo: {
            bsonType: DATA_TYPES.STRING,
          },
          email: {
            bsonType: DATA_TYPES.STRING,
          },
          dob: {
            bsonType: DATA_TYPES.STRING,
          },
          dueDate: {
            bsonType: DATA_TYPES.NUMBER,
          },
          language: {
            bsonType: DATA_TYPES.STRING,
          },
          hash: {
            bsonType: DATA_TYPES.STRING,
          },
          salt: {
            bsonType: DATA_TYPES.STRING,
          },
          management: {
            bsonType: DATA_TYPES.STRING,
          },
          device: {
            bsonType: DATA_TYPES.STRING,
          },
          isDeviceConnected: {
            bsonType: DATA_TYPES.BOOLEAN,
          },
          medication: {
            bsonType: DATA_TYPES.STRING,
          },
          patientType: {
            bsonType: DATA_TYPES.STRING,
          },
          userType: {
            bsonType: DATA_TYPES.STRING,
          },
          status: {
            bsonType: DATA_TYPES.STRING, // status (ACTIVE, INACTIVE, PENDING)
          },
          created: {
            bsonType: DATA_TYPES.INTEGER,
          },
          updated: {
            bsonType: DATA_TYPES.INTEGER,
          },
          gest: {
            bsonType: DATA_TYPES.INTEGER,
          },
          rpm: {
            bsonType: DATA_TYPES.INTEGER,
          },
          ppg: {
            bsonType: DATA_TYPES.INTEGER,
          },
          fpg: {
            bsonType: DATA_TYPES.INTEGER,
          },
          providerCode: {
            bsonType: DATA_TYPES.STRING,
          },
          providerId: {
            bsonType: DATA_TYPES.OBJECTID,
          },
          clinicId: {
            bsonType: DATA_TYPES.STRING,
          },
          lastLogin: {
            bsonType: DATA_TYPES.INTEGER,
          },
          refereshToken: {
            bsonType: DATA_TYPES.STRING,
          },
          isEmailVerified: {
            bsonType: DATA_TYPES.BOOLEAN,
          },
          isMobileVerified: {
            bsonType: DATA_TYPES.BOOLEAN,
          },
          resendDate: {
            bsonType: DATA_TYPES.NUMBER,
          },
          isGlucoseAdded: {
            bsonType: DATA_TYPES.BOOLEAN,
          },
          addedBy: {
            bsonType: DATA_TYPES.STRING,
          },
          isDelivered: {
            bsonType: DATA_TYPES.BOOLEAN,
          },
          deliveredDate: {
            bsonType: DATA_TYPES.NUMBER,
          }
        },
      },
    };
    return userEncryptedSchema;
  } catch (error) {
    throw error;
  }
}