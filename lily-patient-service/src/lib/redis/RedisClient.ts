import redis from "redis";
import { ENVIRONMENT, JOB_SCHEDULER_TYPE, SERVER, } from "@config/index";
import { logger } from "@lib/logger";
const { ObjectId } = require('mongodb');

let client;
let pub, sub;

export class RedisClient {

	init() {
		const _this = this;
		let CONF: any = {};
		let NODE_ENV = process.env.NODE_ENV.trim();
		if (NODE_ENV != ENVIRONMENT.LOCAL) {
			if (NODE_ENV == ENVIRONMENT.PREPROD || NODE_ENV == ENVIRONMENT.PRODUCTION) {
				CONF = { db: SERVER.REDIS.DB, password: SERVER.REDIS.PASS };
				CONF.tls = {};
			} else {
				CONF = { db: SERVER.REDIS.DB };
			}
		} else {
			CONF = { db: SERVER.REDIS.DB };
		}

		client = redis.createClient(SERVER.REDIS.PORT, SERVER.REDIS.HOST, CONF, { disable_resubscribing: true });
		client.on("ready", () => {
			logger.info(`Redis server listening on ${SERVER.REDIS.HOST}:${SERVER.REDIS.PORT}, in ${SERVER.REDIS.DB} DB`);
		});
		client.on("error", (error) => {
			logger.error("Error in Redis", error);
			console.log("Error in Redis");
		});

		// .: Activate "notify-keyspace-events" for expired type events
		pub = redis.createClient(SERVER.REDIS.PORT, SERVER.REDIS.HOST, CONF);
		sub = redis.createClient(SERVER.REDIS.PORT, SERVER.REDIS.HOST, CONF);
		pub.send_command("config", ["set", "notify-keyspace-events", "Ex"], SubscribeExpired);
		// .: Subscribe to the "notify-keyspace-events" channel used for expired type events
		function SubscribeExpired(e, r) {
			const expired_subKey = "__keyevent@" + CONF.db + "__:expired";
			sub.subscribe(expired_subKey, function () {
				sub.on("message", function (chan, msg) {
					_this.listenJobs(msg);
				});
			});
		}
	}

	// .: For example (create a key & set to expire in 10 seconds)
	createJobs(params) {
		const expTime = Math.trunc((params.time - Date.now()) / 1000); // in secs
		switch (params.jobName) {
			case JOB_SCHEDULER_TYPE.AUTO_SESSION_EXPIRE:
				this.setExp(`${JOB_SCHEDULER_TYPE.AUTO_SESSION_EXPIRE}.${params.params.userId}.${params.params.deviceId}`, expTime, JSON.stringify({ "deviceId": params.params.deviceId, "userId": params.params.userId }));
				break;
			case JOB_SCHEDULER_TYPE.TEMPORARY_ACCOUNT_BLOCKED:
				this.setExp(`${JOB_SCHEDULER_TYPE.TEMPORARY_ACCOUNT_BLOCKED}.${params.data.userId}`, expTime, JSON.stringify({ "userId": params.data.userId }));
				break;
		}
	}

	async listenJobs(key) {
		const jobName = key.split(".")[0];
		switch (jobName) {
			case JOB_SCHEDULER_TYPE.TEMPORARY_ACCOUNT_BLOCKED: {
				const data = key.split(".");
				console.log(data, '');
				break;
			}
			case JOB_SCHEDULER_TYPE.AUTO_SESSION_EXPIRE: {
				break;
			}
		}
	}

	setExp(key, exp, value) {
		try {
			client.setex(key, exp, value);
		} catch (error) {
			logger.error(" RedisClient :: setExp ", error)
			throw error
		}
	}

	storeValue(key, value) {
		return client.set(key, value, function (error, reply) {
			if (error) {
				console.log(error);
			}
			return reply;
		});
	}

	getKeys(key) {
		try {//NOSONAR
			return new Promise((resolve, reject) => {
				client.multi().keys(key).exec(function (error, reply) { if (error) reject(error); else resolve(reply[0]) });
			});
		} catch (error) {
			logger.error(" RedisClient :: getKeys ", error)
			throw error
		}

	}

	mset(values) {
		try {
			client.mset(values, function (error, object) {
				if (error) {
					console.log(error);
				}
				return object;
			});
		} catch (error) {
			logger.error(" RedisClient :: mset ", error)
			throw error
		}
	}

	getValue(key) {
		try {//NOSONAR
			return new Promise(function (resolve, reject) {
				client.get(key, function (error, reply) {
					if (error) {
						console.log(error);
					}
					resolve(reply);
				});
			});
		} catch (error) {
			logger.error(" RedisClient :: getValue ", error)
			throw error
		}
	}

	deleteKey(key) {
		try {
			return client.del(key, function (error, reply) {
				if (error) {
					console.log(error);
				}
				console.log(reply)
				return reply;
			});
		} catch (error) {
			logger.error(" RedisClient :: deleteKey ", error)
			throw error
		}
	}
}

export const redisClient = new RedisClient();