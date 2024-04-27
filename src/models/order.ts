import { Schema, model } from "mongoose";
import IOrderSchema from "../Interfaces/IOrderSchema";
import ICreateOrder from "../Interfaces/ICreateOrder";
import { Joi } from "..";

export const orderStatusList = [
  "waitingDelivery",
  "canceled",
  "delivering",
  "delivered",
] as const;
const orderSchema = new Schema<IOrderSchema>(
  {
    date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: { values: orderStatusList, message: "{VALUE} is not supported" },
      default: orderStatusList[0],
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      require: true,
    },
    products: {
      type: [
        new Schema(
          {
            product: {
              type: String,
              rqeuired: true,
              ref: "Products",
            },
            capturedName: { type: String, required: true },
            capturedPrice: { type: Number, required: true },
            orderedQuantity: { type: Number, required: true },
          },
          { _id: false }
        ),
      ],
      validate: {
        validator: function (v: IOrderSchema["products"]) {
          return v.length >= 1;
        },
        message: "At least one product is required",
      },
      required: true,
    },
  },
  { versionKey: false }
);

export function createOrderValidation(createOrder: ICreateOrder) {
  const schema = Joi.object({
    status: Joi.string().valid(...orderStatusList),
    products: Joi.array()
      .items(
        Joi.object({
          id: Joi.objectId().required(),
          orderedQuantity: Joi.number().min(1).required(),
        })
      )
      .required(),
  });
  return schema.validate(createOrder, { abortEarly: false });
}

const Order = model<IOrderSchema>("Orders", orderSchema);

export default Order;
