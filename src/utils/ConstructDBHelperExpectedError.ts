import mongoose from "mongoose";
import extractErrorMessagesMongoose from "./extractErrorMessagesMongoose";

interface IErrorStrcture {
  code: number;
  message?: string;
  validation?: object;
  stack: string;
}

export default function ConstructDBHelperExpectedError(
  code: number,
  error: mongoose.Error.ValidationError | object | string
) {
  const errorStrcture: IErrorStrcture = {
    code,
    stack: new Error().stack || "ConstructDBHelperExpectedError",
  };
  if (error instanceof mongoose.Error.ValidationError)
    errorStrcture.validation = extractErrorMessagesMongoose(error);
  else if (typeof error === "object") errorStrcture.validation = error;
  else errorStrcture.message = error;

  return Promise.reject(errorStrcture);
}
