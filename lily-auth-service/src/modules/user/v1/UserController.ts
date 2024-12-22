import {
  JOB_SCHEDULER_TYPE,
  SERVER
} from "@config/index";
import { loginHistoryDao } from "@modules/loginHistory/index";
import { redisClient } from "@lib/redis/RedisClient";
import { sendMessageToFlock } from "@utils/FlockUtils";
import { logger } from "@lib/logger";

export class UserController {

    /**
   * @function removeSession
   * @description remove the user session
   * @param params.userId
   * @param params.deviceId
   * @returns
   */
    async removeSession(params, isSingleSession: boolean) {
      try {
        if (isSingleSession)
          await loginHistoryDao.removeDeviceById({ userId: params.userId });
        else
          await loginHistoryDao.removeDeviceById({ userId: params.userId, deviceId: params.deviceId });
  
        if (SERVER.IS_REDIS_ENABLE) {
          if (isSingleSession) {
            let keys: any = await redisClient.getKeys(`*${params.userId}*`);
            keys = keys.filter(
              (v1) =>
                Object.values(JOB_SCHEDULER_TYPE).findIndex(
                  (v2) => v2 === v1.split(".")[0]
                ) === -1
            );
            if (keys.length) await redisClient.deleteKey(keys);
          } else
            await redisClient.deleteKey(`${params.userId}.${params.deviceId}`);
        }
      } catch (error) {
        logger.error(error.stack);
        sendMessageToFlock({ title: "_removeSession", error: error.stack });
      }
    }

}
export const userController = new UserController();
