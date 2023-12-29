import mongoose from "mongoose";

function extractErrorMessagesMongoose(errs: mongoose.Error.ValidationError) {
  return Object.keys(errs.errors).reduce(
    (objectAccumlator, propertyName) => ({
      ...objectAccumlator,
      [propertyName]: errs.errors[propertyName].message,
    }),
    {}
  );
}

export default extractErrorMessagesMongoose;
