import { Response } from "express";
import { isErrorWithStack } from "..";

interface DBHelperErrorStructure {
  code: number;
  validation?: object;
  message?: string;
  stack: string;
}

//the function that being passed to the catch method in a DB helper function call
export default function catchDBHelperError(res: Response) {
  return (err: DBHelperErrorStructure) => {
    if (err.code) {
      res.status(err.code).json(responseErrorStructure(err));
    } else throw err;
  };
}

function responseErrorStructure(err: DBHelperErrorStructure) {
  return {
    ...(err.validation
      ? { validation: err.validation }
      : { message: err.message }),
    ...stackDecision(err.stack),
  };
}

export function stackDecision(stack?: string) {
  return isErrorWithStack && { stack: stack || new Error().stack };
}
