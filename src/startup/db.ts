import { connect } from "mongoose";
import Config from "config";
import { logger } from "..";
import { RedisClientType } from "redis";
import syncCache from "../utils/syncCache";
import { setRedisIsHealthy } from "../utils/trackRedisHealth";

module.exports = function db(cacheClient: RedisClientType) {
  const MONGO_ERROR_LABEL = "MongoDBError";

  const MongoDBPromise = connect(Config.get("db.uri"), {
    family: 4,
    serverSelectionTimeoutMS: 15 * 1000,
  })
    .then(() => logger.info(`\nConected to MongoDB "${Config.get("db.uri")}"`))
    .catch((err) => {
      err.message = MONGO_ERROR_LABEL;
      throw err;
    });

  //connect to MonogDB & enusre the cache is connected to sync data between them
  Promise.all([MongoDBPromise, cacheClient.connect()])
    .then(async () => {
      logger.info("Both MongoDB and Redis are connected! 🎉");

      try {
        await syncCache();
        setRedisIsHealthy(true);
      } catch (err) {
        setRedisIsHealthy(false);
      }
    })
    .catch((err) => {
      logger.info("One of the databases failed to connct");
      if (err.message === MONGO_ERROR_LABEL) throw err;
      else setRedisIsHealthy(false); // Redis error
    });
};
