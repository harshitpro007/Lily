"use strict";

import HapiSwagger from "hapi-swagger";
import Inert from "@hapi/inert";
import Vision from "@hapi/vision";

import { SERVER } from "@config/environment";

// Register Swagger Plugin
export const plugin = {
	name: "swagger-plugin",
	register: async function (server) {
		const swaggerOptions = {
			info: {
				title: "Lily PI Documentation",
				description: "Lily",
				version: "1.0.0"
			},
			grouping: "tags",
			schemes: [SERVER.PROTOCOL, 'http'],
			basePath: SERVER.API_BASE_URL,
			consumes: [
				"application/json",
				"application/x-www-form-urlencoded",
				"multipart/form-data"
			],
			produces: [
				"application/json"
			],
			securityDefinitions: {
				
				api_key: {
					type: "apiKey",
					name: "api_key",
					in: "header"
				}
			},
			"documentationPath": `/${SERVER.ORDER_MICROSERVICE_URL}/documentation`,
			"swaggerUIPath": `/${SERVER.ORDER_MICROSERVICE_URL}/swaggerui`,
			"jsonPath": `/${SERVER.ORDER_MICROSERVICE_URL}/swagger.json`,
			security: [{
				api_key: []
			}]

		};

		await server.register([
			Inert,
			Vision,
			{
				plugin: HapiSwagger,
				options: swaggerOptions
			}
		]);
	}
};