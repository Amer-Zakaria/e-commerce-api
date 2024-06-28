import { z } from "zod";

function extractErrorMessagesZod(err: z.ZodError) {
  let returningError: {
    path: (string | number)[];
    message: string;
  }[] = [];
  returningError = err.errors.map(({ path, message }) => ({ path, message }));
  return returningError;
}

export default extractErrorMessagesZod;
