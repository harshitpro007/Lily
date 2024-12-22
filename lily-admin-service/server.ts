import "module-alias/register";
import fs from "fs";
import Hapi from "@hapi/hapi";
import Vision from "@hapi/vision";
import { SERVER } from "@config/index";
import { fetchSecrets } from "@utils/secretManger";
if (!fs.existsSync(SERVER.UPLOAD_DIR)) fs.mkdirSync(SERVER.UPLOAD_DIR);
if (!fs.existsSync(SERVER.LOG_DIR)) fs.mkdirSync(SERVER.LOG_DIR);

import { logger } from "@lib/logger";
import { plugins } from "@plugins/index";
import { routes } from "@routes/index";
import { bootstrap } from "@utils/BootStrap";

  class App {
    private server!: any;
    private Port!: string | number | undefined;
  
    constructor() {
      this.startapp();
    }

    private async startapp() {
      fetchSecrets().then(async () => {
      this.template();
      this.Port = SERVER.ADMIN_PORT;
      await this.startserver();
      await bootstrap.bootStrap(this.server);
      })
    }
    public template () {
      console.log(`**************************** ${SERVER.APP_NAME} ********************************`);
      console.log("**** env : ", process.env.NODE_ENV.trim());
    }
    private async startserver() {
      this.server = Hapi.server({
        port: SERVER.ADMIN_PORT,
        routes: {
          cors: {
            origin: ["*"],
            headers: [
              "Accept",
              "api_key",
              "authorization",
              "Content-Type",
              "If-None-Match",
              "platform",
              "timezone",
              "offset",
              "accept-language",
              "access-control-allow-origin",
            ],
            additionalHeaders: [
              "Accept",
              "api_key",
              "authorization",
              "Content-Type",
              "If-None-Match",
              "platform",
              "timezone",
              "offset",
              "accept-language",
              "access-control-allow-origin",
            ], 
          },
          state: {
            parse: true,
            failAction: "error",
          },
        },
      });
      await this.server.register(plugins);
      await this.server.start();
      this.callback();
      await this.start();
      this.localRoutes();
      
    }
    private start = async () => {    
      await this.server.register(Vision);
      this.server.state("data", {
        ttl: null,
        isSecure: true,
        isHttpOnly: true,
        encoding: "base64json",
        clearInvalid: true,
        strictHeader: true,
      });
    
      this.server.views({
        engines: {
          html: require("handlebars"),
        },
        path: "src/views",
      });
    
      routes.push({
        method: "GET",
        path: "/src/uploads/".toString() + `{path*}`, 
        options: {
          handler: {
            directory: {
              path: process.cwd() + "/src/uploads/".toString(),
              listing: false,
            },
          },
        },
      });
      
      await this.server.register({
        plugin: require("hapi-i18n"),
        options: {
          locales: ["en", "ar"],
          directory: process.cwd() + "/locales",
          languageHeaderField: "accept-language",
          defaultLocale: "en",
        },
      });
    };
    private async localRoutes() {
      await this.server.route(routes)
    }
    private callback = () => {
      logger.info(` Hapi server swagger is running this URL :- ${SERVER.APP_URL}/${SERVER.ADMIN_MICROSERVICE_URL}/documentation`);
      console.log(`Server is started on this port ${this.Port}`);
    };
  }
  
  new App(); // NOSONAR