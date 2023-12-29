import { Document, Schema } from "mongoose";
import { orderStatusList } from "./../models/order";

export default interface IOrderSchema extends Document {
  date?: string;
  status: (typeof orderStatusList)[number];
  customer: Schema.Types.ObjectId;
  products: {
    product: Schema.Types.ObjectId;
    capturedName: string;
    capturedPrice: number;
    orderedQuantity: number;
  }[];
}
