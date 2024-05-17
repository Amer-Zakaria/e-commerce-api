import { NextFunction, Request, Response } from "express";
import { Model, Document } from "mongoose";
import { isErrorWithStack } from "..";

export default function validateUniqueness<T extends Document>(
  propertyName: string,
  Model: Model<T>
) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    const value = req.body[propertyName];

    const document = await Model.findOne({ [propertyName as any]: value });

    if (!document) return next();
    else if (document._id.toString() === req.params.id) return next();

    return res.status(400).json({
      validation: { [propertyName]: `"${value}" already exists` },
      ...(isErrorWithStack && { stack: new Error("").stack }),
    });
  };
}
