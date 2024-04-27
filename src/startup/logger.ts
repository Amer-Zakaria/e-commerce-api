import "express-async-errors";
import devLogger from "./dev-logger";
import proLogger from "./prod-logger";
import { Logger } from "winston";

module.exports = function buildLogger() {
  let logger: Logger;
  if (process.env.NODE_ENV === "development") {
    logger = devLogger();
  } else {
    logger = proLogger();
  }

  return logger;
};
