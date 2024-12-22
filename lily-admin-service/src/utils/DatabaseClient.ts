import { MongoClient, ClientEncryption, MongoClientOptions, KMSProviders } from "mongodb";
import { SERVER } from "@config/environment";
import { fetchSecrets } from "./secretManger";
import { DB_MODEL_REF, ENVIRONMENT } from "@config/main.constant";
import { transactionHistoryEncryptedSchema } from "@modules/subscription/transactionModel";
import { subscriptionEncryptedSchema } from "@modules/subscription/subscriptionModel";
import { providerEncryptedSchema } from "@modules/dashboard/providerModel";
import { userEncryptedSchema } from "@modules/patient/patientModel";

export class Database {

	private unencryptedClient: MongoClient;
	private transactionEncryptedClient: MongoClient;
	private providerEncryptedClient: MongoClient;
	private subscriptionEncryptedClient: MongoClient;
	private patientEncryptedClient: MongoClient;
	private dbName: string;
	private dbUrl: string;
	private connectionInitiated: boolean = false;

	async connectToDb() {
		try {
			if (process.env["NODE_ENV"] !== ENVIRONMENT.LOCAL) {
				try {
					const secrets = await fetchSecrets();
					for (const envKey of Object.keys(secrets)) {
						process.env[envKey] = secrets[envKey];
					}
					this.dbUrl = SERVER.MONGO.DB_URL;
					this.dbName = SERVER.MONGO.DB_NAME;
                    this.dbUrl = this.dbUrl + this.dbName;
					this.unencryptedClient = new MongoClient(this.dbUrl);
				} catch (err) {
					throw err;
				}
			} else {
				this.dbUrl = SERVER.MONGO.DB_URL
				this.dbName = SERVER.MONGO.DB_NAME
                this.dbUrl = this.dbUrl + this.dbName;
				console.log(this.dbUrl);
				this.unencryptedClient = new MongoClient(this.dbUrl);
			}

			if (this.connectionInitiated) {
				return
			}

			this.connectionInitiated = true;
			let NODE_ENV = process.env.NODE_ENV.trim();
			let kmsProviders;
			if (NODE_ENV == ENVIRONMENT.DEV || NODE_ENV == ENVIRONMENT.STAGING)  {
				kmsProviders = {
					aws: {
						accessKeyId: SERVER.AWS_KMS_ACCESS_KEY,
						secretAccessKey: SERVER.AWS_KMS_SECRET_KEY,
					},
				};
			}else {
				kmsProviders = {
					aws: {
						
					}
				};
			}
		
			const keyVaultNamespace = `${this.dbName}.__keyVault`;
			const key = await this.getKey()
			const transactionOptions: MongoClientOptions = {
				monitorCommands: true,
				autoEncryption: {
					keyVaultNamespace,
					kmsProviders: kmsProviders,
					schemaMap: transactionHistoryEncryptedSchema(key, this.dbName),
				},
			};
			const providerOptions: MongoClientOptions = {
				monitorCommands: true,
				autoEncryption: {
					keyVaultNamespace,
					kmsProviders: kmsProviders,
					schemaMap: providerEncryptedSchema(key, this.dbName),
				},
			};
			const subscriptionOptions: MongoClientOptions = {
				monitorCommands: true,
				autoEncryption: {
					keyVaultNamespace,
					kmsProviders: kmsProviders,
					schemaMap: subscriptionEncryptedSchema(key, this.dbName),
				},
			};
			const patientOptions: MongoClientOptions = {
				monitorCommands: true,
				autoEncryption: {
					keyVaultNamespace,
					kmsProviders: kmsProviders,
					schemaMap: userEncryptedSchema(key, this.dbName),
				},
			}
			this.providerEncryptedClient = new MongoClient(this.dbUrl, providerOptions);
			this.transactionEncryptedClient = new MongoClient(this.dbUrl, transactionOptions);
			this.subscriptionEncryptedClient = new MongoClient(this.dbUrl, subscriptionOptions);
			this.patientEncryptedClient = new MongoClient(this.dbUrl, patientOptions);
			await this.transactionEncryptedClient.connect();
			await this.providerEncryptedClient.connect();
			await this.subscriptionEncryptedClient.connect();
			await this.patientEncryptedClient.connect();
			console.log('Connected to MongoDB');
		}
		catch (error) {
			console.error('Error connecting to MongoDB:', error);
			throw error;
		}
	}

	async getUnencryptedClient() {
		if (!this.unencryptedClient) {
			throw new Error('MongoDB client not initialized');
		}
		return this.unencryptedClient.db(this.dbName);
	}

	getTransactionHistoryEncryptedClient() {
		if (!this.transactionEncryptedClient) {
			throw new Error('MongoDB client not initialized');
		}
		return this.transactionEncryptedClient.db(this.dbName).collection(DB_MODEL_REF.TRANSACTION_HISTORY);
	}

	getProviderEncryptedClient() {
		if (!this.providerEncryptedClient) {
			throw new Error('MongoDB client not initialized');
		}
		return this.providerEncryptedClient.db(this.dbName).collection(DB_MODEL_REF.PROVIDER);
	}

	getsubscriptionEncryptedClient() {
		if (!this.subscriptionEncryptedClient) {
			throw new Error('MongoDB client not initialized');
		}
		return this.subscriptionEncryptedClient.db(this.dbName).collection(DB_MODEL_REF.SUBSCRIPTION);
	
	}

	getPatientEncryptedClient() {
		if (!this.patientEncryptedClient) {
			throw new Error('MongoDB client not initialized');
		}
		return this.patientEncryptedClient.db(this.dbName).collection(DB_MODEL_REF.USER);
	
	}

	async getKey() {
		await this.unencryptedClient.connect();
		const keyVaultCollection = this.unencryptedClient.db(this.dbName).collection('__keyVault');
		const finalKey = await keyVaultCollection.find().toArray();
		if (finalKey.length) {
			const id = finalKey[0]._id;
			return id;
		}
		else {
			const key = await this.generateKey()
			return key
		}
	}

	async generateKey() {
		const keyVaultClient = new MongoClient(this.dbUrl);
		try {
			await keyVaultClient.connect();
			const keyVaultDB = keyVaultClient.db(this.dbName);
			const keyVaultColl = keyVaultDB.collection("__keyVault");

			await keyVaultColl.createIndex(
				{ keyAltNames: 1 },
				{
					unique: true,
					partialFilterExpression: { keyAltNames: { $exists: true } },
				}
			);
			let NODE_ENV = process.env.NODE_ENV.trim();
			let kmsProviders:KMSProviders;
			if (NODE_ENV == ENVIRONMENT.DEV || NODE_ENV == ENVIRONMENT.STAGING)  {
				kmsProviders = {
					aws: {
						accessKeyId: SERVER.AWS_KMS_ACCESS_KEY,
						secretAccessKey: SERVER.AWS_KMS_SECRET_KEY,
					},
				};
			}else {
				kmsProviders = {
					aws: {
						
					}
				};
			}

			const encryption = new ClientEncryption(keyVaultClient, {
				keyVaultNamespace: `${this.dbName}.__keyVault`,
				kmsProviders,
			});

			const masterKey = {
				key: SERVER.AWS_KMS_ARN,
				region: SERVER.S3.REGION,
			};
			const provider = "aws";
			const keyAltNames = ["demo-data-key"];
			const key = await encryption.createDataKey(provider, {
				masterKey: masterKey,
				keyAltNames,
			});
			return key
		} finally {
			await keyVaultClient.close();
		}
	}
}

export const encryptedDb = new Database();
