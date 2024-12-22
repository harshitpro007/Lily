import { MongoClient, ClientEncryption, MongoClientOptions, KMSProviders } from "mongodb";
import { SERVER } from "@config/environment";
import { fetchSecrets } from "./secretManger";
import { userEncryptedSchema } from "@modules/user/userEncryptedModel";
import { providerEncryptedSchema } from "@modules/provider/providerModel";
import { DB_MODEL_REF, ENVIRONMENT } from "@config/main.constant";
import { mealEncryptedSchema } from "@modules/meal/mealModel";
import { medicationEncryptedSchema } from "@modules/medication/medicationModel";
import { exerciseEncryptedSchema } from "@modules/exercise/excerciseModel";
import { supportTicketEncryptedSchema } from "@modules/user/ticketModel";
import { deviceHsitoryEncryptedSchema } from "@modules/meal/deviceHsitoryModel";
import { rpmVisitEncryptedSchema } from "@modules/user/rpmVisitModel";


export class Database {

	private unencryptedClient: MongoClient;
	public userEncryptedClient: MongoClient;
	private providerEncryptedClient: MongoClient;
	private mealEncryptedClinet: MongoClient;
	private medicationEncryptedClient: MongoClient;
	private exerciseEncryptedClient: MongoClient;
	private rpmVisitEncryptedClient: MongoClient;
	private ticketEncryptedClient: MongoClient;
	private deviceHistoryEncryptedClient: MongoClient;
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
				this.dbUrl = SERVER.MONGO.DB_URL//this.configService.get<string>('MONGO.DB_URL');
				this.dbName = SERVER.MONGO.DB_NAME //this.configService.get<string>('MONGO.DB_NAME');
                this.dbUrl = this.dbUrl + this.dbName;
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
			const userOptions: MongoClientOptions = {
				monitorCommands: true,
				autoEncryption: {
					keyVaultNamespace,
					kmsProviders: kmsProviders,
					schemaMap: userEncryptedSchema(key, this.dbName),

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
			const mealOptions: MongoClientOptions = {
				monitorCommands: true,
				autoEncryption: {
					keyVaultNamespace,
					kmsProviders: kmsProviders,
					schemaMap: mealEncryptedSchema(key, this.dbName),

				},
			};
			const medicationOptions: MongoClientOptions = {
				monitorCommands: true,
				autoEncryption: {
					keyVaultNamespace,
					kmsProviders: kmsProviders,
					schemaMap: medicationEncryptedSchema(key, this.dbName),

				},
			};
			const exerciseOptions: MongoClientOptions = {
				monitorCommands: true,
				autoEncryption: {
					keyVaultNamespace,
					kmsProviders: kmsProviders,
					schemaMap: exerciseEncryptedSchema(key, this.dbName),

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
			const deviceHsitoryOptions: MongoClientOptions = {
				monitorCommands: true,
				autoEncryption: {
					keyVaultNamespace,
					kmsProviders: kmsProviders,
					schemaMap: deviceHsitoryEncryptedSchema(key, this.dbName),
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
			this.userEncryptedClient = new MongoClient(this.dbUrl, userOptions);
			this.providerEncryptedClient = new MongoClient(this.dbUrl, providerOptions);
			this.mealEncryptedClinet = new MongoClient(this.dbUrl, mealOptions);
			this.medicationEncryptedClient = new MongoClient(this.dbUrl, medicationOptions);
			this.exerciseEncryptedClient = new MongoClient(this.dbUrl, exerciseOptions);
			this.ticketEncryptedClient = new MongoClient(this.dbUrl, ticketOptions);
			this.deviceHistoryEncryptedClient = new MongoClient(this.dbUrl, deviceHsitoryOptions);
			this.rpmVisitEncryptedClient = new MongoClient(this.dbUrl, rpmVisitOptions);
			await this.userEncryptedClient.connect();
			await this.providerEncryptedClient.connect();
			await this.mealEncryptedClinet.connect();
			await this.medicationEncryptedClient.connect();
			await this.exerciseEncryptedClient.connect();
			await this.ticketEncryptedClient.connect();
			await this.deviceHistoryEncryptedClient.connect();
			await this.rpmVisitEncryptedClient.connect();
			console.log('Connected to MongoDB');
		}
		catch (error) {
			console.error('Error connecting to MongoDB:', error);
			throw error;
		}
	}

	getUnencryptedClient() {
		if (!this.unencryptedClient) {
			throw new Error('MongoDB client not initialized');
		}
		return this.unencryptedClient.db(this.dbName);
	}

	getUserEncryptedClient() {
		if (!this.userEncryptedClient) {
			throw new Error('MongoDB client not initialized');
		}
		return this.userEncryptedClient.db(this.dbName).collection(DB_MODEL_REF.USER);
	}

	getProviderEncryptedClient() {
		if (!this.providerEncryptedClient) {
			throw new Error('MongoDB client not initialized');
		}
		return this.providerEncryptedClient.db(this.dbName).collection(DB_MODEL_REF.PROVIDER);
	}

	getMealEncryptedClient() {
		if (!this.mealEncryptedClinet) {
			throw new Error('MongoDB client not initialized');
		}
		return this.mealEncryptedClinet.db(this.dbName).collection(DB_MODEL_REF.MEAL);
	}

	getMedicationEncryptedClient() {
		if (!this.medicationEncryptedClient) {
			throw new Error('MongoDB client not initialized');
		}
		return this.medicationEncryptedClient.db(this.dbName).collection(DB_MODEL_REF.MEDICATION);
	}

	getExcerciseEncryptedClient() {
		if (!this.exerciseEncryptedClient) {
			throw new Error('MongoDB client not initialized');
		}
		return this.exerciseEncryptedClient.db(this.dbName).collection(DB_MODEL_REF.EXERCISE);
	}

	getTicketEncryptedClient() {
		if (!this.ticketEncryptedClient) {
			throw new Error('MongoDB client not initialized');
		}
		return this.ticketEncryptedClient.db(this.dbName).collection(DB_MODEL_REF.TICKET);
	}

	getDeviceHsitoryEncryptedClient() {
		if (!this.deviceHistoryEncryptedClient) {
			throw new Error('MongoDB client not initialized');
		}
		return this.deviceHistoryEncryptedClient.db(this.dbName).collection(DB_MODEL_REF.DEVICE_HISTORY);
	}
	
	getrpmVisitEncryptedClient() {
		if (!this.rpmVisitEncryptedClient) {
			throw new Error('MongoDB client not initialized');
		}
		return this.rpmVisitEncryptedClient.db(this.dbName).collection(DB_MODEL_REF.RPM_VISIT);
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