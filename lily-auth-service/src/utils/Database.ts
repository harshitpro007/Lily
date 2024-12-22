import mongoose from "mongoose";
import { SERVER } from "@config/environment";


// Connect to MongoDB
export class Database {
	async connectToDb() {
		return new Promise((resolve, reject) => {
			try {
				const dbName = SERVER.MONGO.DB_NAME;
				let dbUrl = SERVER.MONGO.DB_URL;
				let dbOptions: any = SERVER.MONGO.OPTIONS;
				if (SERVER.ENVIRONMENT === "production") {
					dbUrl = dbUrl + dbName;
				} else {
					dbUrl = dbUrl + dbName;
					mongoose.set("debug", true);
				}
				mongoose.connect(dbUrl, dbOptions);
				mongoose.connection.on("connected", function () {
					console.info(SERVER.DISPLAY_COLORS ? "\x1b[32m%s\x1b[0m" : "%s", `Connected to ${dbUrl}`);
					resolve({});
				});
				// If the connection throws an error
				mongoose.connection.on("error", error => {
					reject(error);
				});

				// When the connection is disconnected
				mongoose.connection.on("disconnected", () => {
					reject("DB connection disconnected.");//NOSONAR
				});
			} catch (error) {
				reject(error);
			}
		});
	}
}