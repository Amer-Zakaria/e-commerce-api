const redisStatus = { isHealthy: false };

export const getRedisIsHealthy: () => boolean = () => redisStatus.isHealthy;
export const setRedisIsHealthy = (isHealthy: boolean) => {
  redisStatus.isHealthy = isHealthy;
};
