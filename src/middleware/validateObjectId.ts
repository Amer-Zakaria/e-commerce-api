import { NextFunction, Request, Response } from "express";
import { isErrorWithStack } from "..";
import { Types } from "mongoose";
import { Model, Document } from "mongoose";
import { Product } from "../models/product";

export interface MyRequest extends Request {
  document: object;
}

export default function validateObjectId<T extends Document>(Model: Model<T>) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    const { id } = req.params;

    // check the id validity
    if (!Types.ObjectId.isValid(id))
      return res.status(400).json({
        validation: { _id: "Invalid Id" },
        ...(isErrorWithStack && { stack: new Error("").stack }),
      });

    //check if the demanded document exists
    const document = await Model.findById(id);
    if (!document)
      return res.status(404).json({
        message: "Not found!",
        ...(isErrorWithStack && { stack: new Error("").stack }),
      });

    //put the document in the req
    res.locals.document = document;
    next();
  };
}

validateObjectId(Product);
