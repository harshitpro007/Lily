import {  SERVER } from "@config/index";
import { Database } from "@utils/Database";
import { redisClient } from "@lib/redis/RedisClient";
import { encryptedDb } from "./DatabaseClient";
import { stripe } from "@lib/stripe";
export class BootStrap {
  private dataBaseService = new Database();
  // static readonly BootStrap: any;

  async bootStrap(server) {
    await this.dataBaseService.connectToDb();
    await encryptedDb.connectToDb();
    // If redis is enabled
    if (SERVER.IS_REDIS_ENABLE) redisClient.init();
    if(SERVER.IS_STRIPE_ENABLED) stripe.init();

    if (SERVER.ENVIRONMENT === "production") {
      console.log = function () {};
    }

  }
}
export const  bootstrap = new BootStrap();