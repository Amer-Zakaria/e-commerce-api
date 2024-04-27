import { Document } from "mongoose";

export default interface IUserSchema extends Document {
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  generateAuthToken: () => string;
}
