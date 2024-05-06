import { connect, Error } from "mongoose";
import Config from "config";
import { logger } from "..";

module.exports = function db() {
  connect(Config.get("db.uri"), {
    family: 4,
    serverSelectionTimeoutMS: 15 * 1000,
  }).then(() =>
    logger.info(`\nConected to MongoDB "${Config.get("db.uri")}"...`)
  );
};
