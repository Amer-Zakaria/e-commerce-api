import { format, createLogger } from "winston";
const { timestamp, combine, errors, json } = format;
import { Loggly } from "winston-loggly-bulk";
import Config from "config";

const logger = createLogger({
  format: combine(timestamp(), errors({ stack: true }), json()),
  transports: [
    new Loggly(Config.get("loggly")),
    // new transports.File({
    //   filename: "error.log",
    //   level: "error",
    // }),
    // new transports.File({ filename: "combined.log" }),
  ],
  exceptionHandlers: [
    new Loggly(Config.get("loggly")),
    // new transports.File({ filename: "error.log" }),
  ],
});

export default function buildProdLogger() {
  return logger;
}

module.exports = buildProdLogger;
