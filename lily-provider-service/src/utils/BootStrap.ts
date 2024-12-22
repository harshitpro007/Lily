import {  SERVER } from "@config/index";
import { Database } from "@utils/Database";
import { redisClient } from "@lib/redis/RedisClient";
import { encryptedDb } from "./DatabaseClient";
import cron from 'node-cron';
import { subscriptionController } from "@modules/subscription/v1/subscriptionController";
export class BootStrap {
  private dataBaseService = new Database();
  // static readonly BootStrap: any;

  async bootStrap(server) {
    await this.dataBaseService.connectToDb();
    await encryptedDb.connectToDb();
    // If redis is enabled
    if (SERVER.IS_REDIS_ENABLE) redisClient.init();

    if (SERVER.ENVIRONMENT === "production") {
      console.log = function () {};
    }
    await this.croneJobs();
  }

  async croneJobs() {
    // Schedule Cron Job to run every day at midnight
    cron.schedule('30 0 * * *', async () => {
      await subscriptionController.susbcriptionStatus();
    });
  }
}
export const  bootstrap = new BootStrap();