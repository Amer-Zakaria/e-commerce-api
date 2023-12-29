import OriginalJoi from "joi";
import Config from "config";
import { logger } from "..";

module.exports = () => {
  if (!Config.get("jwtPrivateKey")) {
    logger.error("FATAL ERROR: jwtPrivateKey is not defined.");
    process.exit(1);
  }

  //Injecting ObjectId validation to JOI
  return require("joi-oid") as OriginalJoi.Root & {
    objectId: OriginalJoi.RuleMethod;
  };
};
