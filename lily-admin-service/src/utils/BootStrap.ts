import { LANGUAGE, SERVER } from "@config/index";
import { Database } from "@utils/Database";
import { redisClient } from "@lib/redis/RedisClient";
import { adminDaoV1 } from "@modules/admin";
import { encryptedDb } from "./DatabaseClient";
import { baseDao } from "@modules/baseDao";
import { dashboardDaoV1 } from "@modules/dashboard";
import { CmsType } from "@modules/cms/v1/cmsConstant";
export class BootStrap {
  private dataBaseService = new Database();
  // static readonly BootStrap: any;

  async bootStrap(server) {
    await this.dataBaseService.connectToDb();
    await encryptedDb.connectToDb();
    if (SERVER.IS_REDIS_ENABLE) redisClient.init();

    if (SERVER.ENVIRONMENT === "production") {
      console.log = function () {};
    }

    await this.createAdmin();
    await this.createDashboard();
    await this.createTermsandConditions();
    await this.createPolicy();
  }

  /**
	 * @function createAdmin
	 */
	async createAdmin() {
		const adminData = {
			"email": SERVER.ADMIN_CREDENTIALS.EMAIL,
			"password": SERVER.ADMIN_CREDENTIALS.ADMIN_PASSWORD,
      "name": SERVER.ADMIN_CREDENTIALS.NAME
		};
		const step1 = await adminDaoV1.isEmailExists(adminData);
		if (!step1) adminDaoV1.createAdmin(adminData);
	}

  /**@function createDashboard stats */
  async createDashboard() {
    const step1 = await dashboardDaoV1.isDashbaordExist();
    let params = {
      "payments": [{
        year: new Date().getFullYear(),
        amount: 0
      }]
    }
    if (!step1) await dashboardDaoV1.createDashbaord(params);
  }

  async createTermsandConditions() {
    const step1 = await baseDao.findOne("cms",{type:CmsType.TERMSANDCONDITIONS});
    let params = {
      type: CmsType.TERMSANDCONDITIONS,
      body: [{
        language: LANGUAGE.English,
        text: ""
      },{
        language: LANGUAGE.Spanish,
        text: ""
      }]
    };
    if (!step1) await baseDao.save("cms",params);
  }

  async createPolicy() {
    const step1 = await baseDao.findOne("cms",{type:CmsType.PRIVACYPOLICY});
    let params = {
      type: CmsType.PRIVACYPOLICY,
      body: [{
        language: LANGUAGE.English,
        text: ""
      },{
        language: LANGUAGE.Spanish,
        text: ""
      }]
    };
    if (!step1) await baseDao.save("cms",params);
  }
}
export const  bootstrap = new BootStrap();