import mongoose, { Schema } from "mongoose";
import ICreateUser from "../Interfaces/ICreateUser";
import IUserSchema from "../Interfaces/IUserSchema";
import { Joi } from "../index";
import jwt from "jsonwebtoken";
import { joiPasswordExtendCore } from "joi-password";
const joiPassword = Joi.extend(joiPasswordExtendCore);
import config from "config";
import IUserCred from "../Interfaces/IUserCred";

const userSchema: Schema = new Schema<IUserSchema>(
  {
    name: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      maxlength: 255,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 1024, //after hashing the pass, it takes up to 1024
      select: false,
    },
    isAdmin: { type: Boolean, default: false },
  },
  { versionKey: false }
);

userSchema.methods.generateAuthToken = function () {
  const { _id, email, isAdmin, name } = this;
  const token = jwt.sign(
    { _id, email, isAdmin, name },
    config.get("jwtPrivateKey")
  );
  return token;
};

const User = mongoose.model<IUserSchema>("Users", userSchema);

const passwordValidation = joiPassword
  .string()
  .minOfSpecialCharacters(1)
  .minOfLowercase(2)
  .minOfUppercase(2)
  .minOfNumeric(2)
  .noWhiteSpaces()
  .required();

export function createUserValidation(user: ICreateUser) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().email().min(5).max(255).required(),
    password: passwordValidation,
  });

  return schema.validate(user, { abortEarly: false });
}

export function userCredentialsValidation(userCred: IUserCred) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email().required(),
    password: passwordValidation,
  });

  return schema.validate(userCred, { abortEarly: false });
}

export default User;
