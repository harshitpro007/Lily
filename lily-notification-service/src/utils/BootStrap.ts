import { SERVER } from "@config/index";
import { Database } from "@utils/Database";
import { redisClient } from "@lib/redis/RedisClient";
import { fireBase } from "@lib/firebase";
import { twilioMsg } from "@lib/twilio";
import { mailManager } from "@lib/MailManager";
export class BootStrap {
  private dataBaseService = new Database();

  async bootStrap(server: any) {
    await this.dataBaseService.connectToDb();

    if (SERVER.IS_REDIS_ENABLE) redisClient.init();
    if (SERVER.IS_FIREBASE_ENABLE) fireBase.init();
    if (SERVER.IS_TWILIO_ENABLE) twilioMsg.init();
    if (SERVER.IS_SENDGRID_ENABLE) mailManager.init();

    if (SERVER.ENVIRONMENT === "production") {
      console.log = function () { };
    }
    /*
    await fireBase.multiCastPayload(["dPOqBSWq5UqLnsGkK6bag6:APA91bHRweg1Q-PPM1uhPrj7lKszFRqsCApRJKQWaCWr5bAzh5d0cdwYiAMl0RloNu7HkKXUD1KGFqROV0tb69N2ArEPBH_tiEfQLYFEioI5xH1G4yjS2NufdIk5sCm6cQyhP3DdYUNw"],{
      title: "Hello",
      body: "World"
    },{
      badge: "1"
    })
    */
  }

}
export const bootstrap = new BootStrap();