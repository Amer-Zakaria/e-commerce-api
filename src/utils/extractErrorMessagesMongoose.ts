import { Error } from "mongoose";

function extractErrorMessagesMongoose(errs: Error.ValidationError) {
  return Object.keys(errs.errors).reduce(
    (objectAccumlator, propertyName) => ({
      ...objectAccumlator,
      [propertyName]: errs.errors[propertyName].message,
    }),
    {}
  );
}

export default extractErrorMessagesMongoose;
