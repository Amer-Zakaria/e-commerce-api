import { connect } from "mongoose";
import Config from "config";
import { logger } from "..";
import { RedisClientType } from "redis";
import syncCache from "../utils/syncCache";
import { setRedisIsHealthy } from "../utils/trackRedisHealth";

module.exports = function db(cacheClient: RedisClientType) {
  const MongoDBPromise = new Promise((resolve) => {
    connect(Config.get("db.uri"), {
      family: 4,
      serverSelectionTimeoutMS: 15 * 1000,
    }).then(() => {
      logger.info(`\nConected to MongoDB "${Config.get("db.uri")}"`);
      resolve(true);
    });
  });

  //connect to MonogDB & enusre the cache is connected to sync data between them
  Promise.all([
    MongoDBPromise,
    new Promise((resolve) => cacheClient.once("connect", resolve)),
  ])
    .catch(() => {
      logger.info("One of the databases failed to connct");
    })
    .then(async () => {
      logger.info("Both MongoDB and Redis are connected! 🎉");

      try {
        await syncCache();
        setRedisIsHealthy(true);
      } catch (err) {
        setRedisIsHealthy(false);
      }
    });
};
