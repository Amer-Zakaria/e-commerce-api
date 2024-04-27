import { Document } from "mongoose";

import { categories } from "../models/product";

export default interface IProductSchema extends Document {
  vendor: { name: string; bio?: string };
  name: string;
  tags: string[];
  quantity: number;
  category?: (typeof categories)[number];
  price?: number;
  formatedPrice?: string;
  isActive?: Boolean;
  createdAt?: string;
  updatedAt?: string;
}
