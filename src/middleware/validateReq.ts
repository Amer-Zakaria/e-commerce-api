import { NextFunction, Request, Response } from "express";
import { isErrorWithStack } from "..";
import extractErrorMessagesZod from "../utils/extractErrorMessagesZod";
import { z } from "zod";

export default function validateReq(
  schema: z.ZodObject<any>,
  part: "body" | "query"
) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    const result = schema.safeParse(req[part]);
    if (result.error) {
      return res.status(400).json({
        validation: extractErrorMessagesZod(result.error),
        ...(isErrorWithStack && { stack: new Error("").stack }),
      });
    }

    if (part === "body") res.locals.data = result.data;

    next();
  };
}
