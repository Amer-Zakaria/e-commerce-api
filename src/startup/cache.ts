import { createClient } from "redis";
import Config from "config";
import { logger } from "..";
import { setRedisIsHealthy } from "../utils/trackRedisHealth";

module.exports = function cache() {
  const client = createClient({
    password: Config.get("redis.password"),
    socket: {
      host: Config.get("redis.socket.host"),
      port: +(Config.get("redis.socket.port") as string),
      reconnectStrategy: false, //don't retry
    },
  });

  client.on("error", (err) => {
    logger.error(err);
    setRedisIsHealthy(false);
  });

  client.on("ready", () => {
    logger.info("Connected to Redis");
  });

  return client;
};
