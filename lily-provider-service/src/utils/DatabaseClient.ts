import { MongoClient, ClientEncryption, MongoClientOptions, KMSProviders } from "mongodb";
import { SERVER } from "@config/environment";
import { fetchSecrets } from "./secretManger";
import { providerEncryptedSchema } from "@modules/provider/providerEncryptedModel";
import { DB_MODEL_REF, ENVIRONMENT } from "@config/main.constant";
import { subscriptionEncryptedSchema } from "@modules/subscription/subscriptionModel";
import { rpmVisitEncryptedSchema } from "@modules/patient/rpmVisitModel";
import { userEncryptedSchema } from "@modules/patient/patientModel";
import { transactionHistoryEncryptedSchema } from "@modules/subscription/transactionModel";
import { supportTicketEncryptedSchema } from "@modules/support/ticketModel";

export class Database {

	private unencryptedClient: MongoClient;
	public providerEncryptedClient: MongoClient;
	private subscriptionEncryptedClient: MongoClient;
	private trasactionEncryptedClient: MongoClient;
	private rpmVisitEncryptedClient: MongoClient;
	private patientEncryptedClient: MongoClient;
	private ticketEncryptedClient: MongoClient;
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
					console.log(this.dbUrl);
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

			this.connectionInitiated = true
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
			const ticketOptions: MongoClientOptions = {
				monitorCommands: true,
				autoEncryption: {
					keyVaultNamespace,
					kmsProviders: kmsProviders,
					schemaMap: supportTicketEncryptedSchema(key, this.dbName),
				},
			};
			const transactionOptions: MongoClientOptions = {
				monitorCommands: true,
				autoEncryption: {
					keyVaultNamespace,
					kmsProviders: kmsProviders,
					schemaMap: transactionHistoryEncryptedSchema(key, this.dbName),
				},
			};
			const rpmVisitOptions: MongoClientOptions = {
				monitorCommands: true,
				autoEncryption: {
					keyVaultNamespace,
					kmsProviders: kmsProviders,
					schemaMap: rpmVisitEncryptedSchema(key, this.dbName),
				},
			};
			const patientOptions: MongoClientOptions = {
				monitorCommands: true,
				autoEncryption: {
					keyVaultNamespace,
					kmsProviders: kmsProviders,
					schemaMap: userEncryptedSchema(key, this.dbName),
				},
			};
			this.providerEncryptedClient = new MongoClient(this.dbUrl, providerOptions);
			this.subscriptionEncryptedClient = new MongoClient(this.dbUrl, subscriptionOptions);
			this.rpmVisitEncryptedClient = new MongoClient(this.dbUrl, rpmVisitOptions);
			this.patientEncryptedClient = new MongoClient(this.dbUrl, patientOptions);
			this.trasactionEncryptedClient = new MongoClient(this.dbUrl, transactionOptions)
			this.ticketEncryptedClient = new MongoClient(this.dbUrl, ticketOptions)
			await this.providerEncryptedClient.connect();
			await this.subscriptionEncryptedClient.connect();
			await this.rpmVisitEncryptedClient.connect();
			await this.patientEncryptedClient.connect();
			await this.trasactionEncryptedClient.connect();
			await this.ticketEncryptedClient.connect();
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

	getrpmVisitEncryptedClient() {
		if (!this.rpmVisitEncryptedClient) {
			throw new Error('MongoDB client not initialized');
		}
		return this.rpmVisitEncryptedClient.db(this.dbName).collection(DB_MODEL_REF.RPM_VISIT);
	}

	getTicketEncryptedClient() {
		if (!this.ticketEncryptedClient) {
			throw new Error('MongoDB client not initialized');
		}
		return this.ticketEncryptedClient.db(this.dbName).collection(DB_MODEL_REF.TICKET);
	}

	getPatientEncryptedClient() {
		if (!this.patientEncryptedClient) {
			throw new Error('MongoDB client not initialized');
		}
		return this.patientEncryptedClient.db(this.dbName).collection(DB_MODEL_REF.USER);
	}
	getTransactionEncryptedClient() {
		if (!this.trasactionEncryptedClient) {
			throw new Error('MongoDB client not initialized');
		}
		return this.trasactionEncryptedClient.db(this.dbName).collection(DB_MODEL_REF.TRANSACTION_HISTORY);
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

			const encryption = new ClientEncryption(keyVaultClient, {
				keyVaultNamespace: `${this.dbName}.__keyVault`,
				kmsProviders,
			});

			const masterKey = {
				key: SERVER.AWS_KMS_ARN,
				region: SERVER.AWS.REGION,
			};
			console.log(masterKey);

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
