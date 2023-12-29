import { NextFunction, Request, Response } from "express";

export default function (handler: (req: Request, res: Response) => void) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res);
    } catch (ex) {
      next(ex);
    }
  };
}
