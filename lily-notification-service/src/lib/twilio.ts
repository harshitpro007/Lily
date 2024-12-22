import { SERVER } from "@config/environment";
import twilio from "twilio";
let client: any;
export class Twilio {
  init() {
    const accountSid = SERVER.TWILIO_ACC_SID;
    const authToken = SERVER.TWILIO_AUTH_TOKEN;
    client = twilio(accountSid, authToken);
  }
  async sendMessage(params: { body: string, to: string }) {
    return new Promise((resolve, reject) => {
      client.messages.create({
        body: params.body,
        to: params.to,
        from: SERVER.TWILIO_NUMBER
      }).then((message) => {
        resolve({ success: true, data: message })
      }).catch((error) => {
        console.log(`[sendMessage] catch block`, error)
        reject({ success: false, error: error })
      })
    })
  }
}

export const twilioMsg = new Twilio();