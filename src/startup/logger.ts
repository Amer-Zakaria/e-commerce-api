import "express-async-errors";
import devLogger from "./dev-logger";
import proLogger from "./prod-logger";
import { Logger } from "winston";

module.exports = function buildLogger() {
  let logger: Logger;
  if (process.env.NODE_ENV === "production") {
    logger = proLogger();
  } else {
    logger = devLogger();
  }

  return logger;
};
