import redis from "redis";
import { ENVIRONMENT, SERVER, } from "@config/index";
import { logger } from "@lib/logger";
const {ObjectId} = require('mongodb');  

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
				});
			});
		}
	}

	getKeys(key) {
		try {//NOSONAR
			return new Promise((resolve, reject) => {
				client.multi().keys(key).exec(function (error, reply) { if (error) reject(error); else resolve(reply[0]) });
			});
		} catch (error) {
			logger.error(" RedisClient :: getKeys ",error)
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
			logger.error(" RedisClient :: getValue ",error)
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
			logger.error(" RedisClient :: deleteKey ",error)
			throw error
		}
	}
}

export const redisClient = new RedisClient();