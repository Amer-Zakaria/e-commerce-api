require("dotenv").config();
import express from "express";
import Config from "config";
import swaggerDocs from "./utils/swagger";
import { RedisClientType } from "redis";

const app = express();

//Startups
export const logger = require("./startup/logger")();
require("./startup/validation")();
require("./startup/middlewares")(app);
export const cacheClient = require("./startup/cache")() as RedisClientType;
require("./startup/db")(cacheClient);
require("./startup/routes")(app);
export const isErrorWithStack: boolean = Config.get("stack");
logger.info(`Environment: ${process.env.NODE_ENV}`);
logger.info(`App Name: ${Config.get("name")}`);

//Publishing
const port = Config.get("port") as number;
app.listen(port, () => {
  logger.info(`\nlistening at port ${port}, any incoming requests?!`);

  swaggerDocs(app, port);
});
