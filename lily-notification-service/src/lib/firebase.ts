const admin = require("firebase-admin");
import { FIREBASE, HTTP_STATUS_CODE, SERVER, TIMERS } from "@config/index";
import { getMessaging } from "firebase-admin/messaging";
export class FireBase {
  init() {
    const firebaseJson: any = {
      "type": SERVER.FIREBASE_TYPE,
      "project_id": SERVER.FIREBASE_PROJECT_ID,
      "private_key_id": SERVER.FIREBASE_PRIVATE_KEY_ID,
      "private_key": SERVER.FIREBASE_PRIVATE_KEY,
      "client_email": SERVER.FIREBASE_CLIENT_EMAIL,
      "client_id": SERVER.FIREBASE_CLIENT_ID,
      "auth_uri": SERVER.FIREBASE_AUTH_URI,
      "token_uri": SERVER.FIREBASE_TOKEN_URI,
      "auth_provider_x509_cert_url": SERVER.FIREBASE_AUTH_CERT_URL,
      "client_x509_cert_url": SERVER.FIREBASE_CLINET_CERT_URL,
      "universe_domain": SERVER.FIREBASE_UNIVERSE_DOMAIN
    }
    admin.initializeApp({
      credential: admin.credential.cert(firebaseJson)
    });
  }
  async sendPushNotification(deviceId: string, notification: any, data: any) {
    console.log("******sendPushNotification payload details", "\ndeviceId", deviceId, "\nnotification", notification, "\ndata", data, "\n******");
    let message: any = {
      token: deviceId,
      notification: notification,
      data: data,
      apns: {
        payload: {
          aps: {
            alert: {
              title: notification.title,
              body: notification.body,
            },
            sound: FIREBASE.SOUND,
            badge: Number(data.badge)
          },
        },
        headers: {
          'apns-priority': FIREBASE.APNS_PRIORITY,
          'apns-expiration': FIREBASE.APNS_EXPIRATION,
        },
      },
      android: {
        priority: FIREBASE.HIGH_PRIORITY,
        notification: {
          title: notification.title,
          body: notification.body,
          sound: FIREBASE.SOUND
        },
      }
    };
    try {
      getMessaging().send(message)
        .then((res) => {
          console.log("******getMessaging success details", res, "\n******");
        })
        .catch((error) => {
          console.error("******getMessaging catch block details", error, "\n******");
        })
    }
    catch (error) {
      console.error("******sendPushNotification catch block details", error, "\n******");
      throw error;
    }
  };


  async sendEachForMulticast(tokens: string[], message: { notification: notification, data: any }) {
    const BATCH_SIZE = SERVER.CHUNK_SIZE; // max tokens per request
    const results = [];
    for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
      const batchTokens = tokens.slice(i, i + BATCH_SIZE);
      const batchMessage = { ...message, tokens: batchTokens };
      console.log('batchMessage', batchMessage)
      try {
        const response = await getMessaging().sendEachForMulticast(batchMessage);
        // console.log('responseresponse', response.responses[0].error)
        results.push(response);
        console.log(`******Successfully sent message to batch ${i / BATCH_SIZE + 1}`, `\n******`);
      } catch (error) {
        console.error(`******Error sending message to batch ${i / BATCH_SIZE + 1}:`, error, `\n******`);
      }
    }
    return results;
  };

  async multiCastPayload(tokens: string[], notification: notification, data: any) {
    try {
      let message = {
        notification: notification,
        data: data,
        apns: {
          payload: {
            aps: {
              alert: {
                title: notification.title,
                body: notification.body,
              },
              sound: FIREBASE.SOUND,
              badge: Number(data.badge)
            },
          },
          headers: {
            'apns-priority': FIREBASE.APNS_PRIORITY,
            'apns-expiration': FIREBASE.APNS_EXPIRATION,
          },
        },
        android: {
          priority: FIREBASE.HIGH_PRIORITY,
          notification: {
            title: notification.title,
            body: notification.body,
            sound: FIREBASE.SOUND
          },
        }
      };
      this.sendEachForMulticast(tokens, message)
        .then((results) => {
          console.log('******batches processed response:', results);
        })
        .catch((error) => {
          console.error('******error processing batches:', error);
        });
    } catch (error) {
      console.log('error multiCastPayloadmultiCastPayload', error)
    }

  }
}

export const fireBase = new FireBase();