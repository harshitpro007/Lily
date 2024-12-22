import {  SERVER } from "@config/index";
import { Database } from "@utils/Database";
import { redisClient } from "@lib/redis/RedisClient";
import { encryptedDb } from "./DatabaseClient";
import cron from 'node-cron';
import { userDaoV1 } from "@modules/user";
import { mealDaoV1 } from "@modules/meal";
export class BootStrap {
  private dataBaseService = new Database();

  async bootStrap(server) {
    await this.dataBaseService.connectToDb();
    await encryptedDb.connectToDb();
    // If redis is enabled
    if (SERVER.IS_REDIS_ENABLE) redisClient.init();

    if (SERVER.ENVIRONMENT === "production") {
      console.log = function () {};
    }

    // await this.croneJobs();
  }

  async croneJobs() {
    // Schedule Cron Job to run every day at midnight
    cron.schedule('0 0 * * *', async () => {
      console.log('Running Cron Job - Checking delivered dates');
      await userDaoV1.checkDeliveredDate();
    });

    cron.schedule('15 0 * * *', async () => {
      console.log('Running Cron Job - Checking glucose data and update');
      await mealDaoV1.updateDeviceData();
    });

    cron.schedule('1 0 * * *', async () => {
      console.log('Running Cron Job - Checking glucose data and update');
      await userDaoV1.updateLibreGraphLastTimeInterval();
    });

    cron.schedule('15 12 * * *', async () => {
      console.log('Running Cron Job - Fetching device data of patients at 11:45 PM Alaska Time');
      userDaoV1.getPatientLibreDeviceData();
    }, {
      scheduled: true,
      timezone: "America/Anchorage" // Alaska timezone
    });

    cron.schedule('55 23 * * *', async () => {
      console.log('Running Cron Job - Fetching device data of patients at 11:45 PM Alaska Time');
      userDaoV1.getPatientLibreDeviceData();
    }, {
      scheduled: true,
      timezone: "America/Anchorage" // Alaska timezone
    });

    cron.schedule('45 23 * * *', async () => {
      console.log('Running Cron Job - Fetching device data of patients at 11:45 PM Alaska Time');
      userDaoV1.getPatientDexcomDeviceData();
    }, {
      scheduled: true,
      timezone: "America/Anchorage" // Alaska timezone
    });
  }
}
export const  bootstrap = new BootStrap();