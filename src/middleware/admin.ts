import { Request, Response, NextFunction } from "express";

export function admin(req: Request, res: Response, next: NextFunction): any {
  if (!res.locals.user.isAdmin) return res.status(403).send("Access denied.");

  next();
}
