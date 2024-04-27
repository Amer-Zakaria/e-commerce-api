import { logger } from "..";

export default (secs: number, message?: string) => {
  message && logger.info("we start delaying to: ", message);
  return new Promise((resolve) => setTimeout(resolve, secs * 1000));
};
