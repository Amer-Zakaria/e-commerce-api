import Config from "config";
import { logger } from "..";

module.exports = () => {
  if (!Config.get("jwtPrivateKey")) {
    logger.error("FATAL ERROR: jwtPrivateKey is not defined.");
    process.exit(1);
  }
  if (!Config.get("db.uri")) {
    logger.error("FATAL ERROR: DB URI is not defined.");
    process.exit(1);
  }
  if (process.env.NODE_ENV === "production" && !Config.get("loggly.token")) {
    logger.error("FATAL ERROR: Loggly token is not defined.");
    process.exit(1);
  }
};
