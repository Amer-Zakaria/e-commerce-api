import { Schema, isValidObjectId, model } from "mongoose";
import IOrderSchema from "../Interfaces/IOrderSchema";
import { z } from "zod";

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

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateOrder:
 *       type: object
 *       required:
 *         - status
 *         - products
 *       properties:
 *         status:
 *           type: string
 *           enum: [waitingDelivery, canceled, delivering, delivered] # orderStatusList
 *         products:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductOrder'
 *     ProductOrder:
 *       type: object
 *       required:
 *         - id
 *         - orderedQuantity
 *       properties:
 *         id:
 *           type: string
 *         orderedQuantity:
 *           type: number
 *           minimum: 1
 */
export const createOrderSchema = z
  .object({
    status: z.enum(orderStatusList).optional(),
    products: z
      .array(
        z.object({
          id: z.string().refine((val) => isValidObjectId(val), {
            message: "Invalid MongoDB ObjectId",
          }),
          orderedQuantity: z.number().min(1),
        })
      )
      .min(1),
  })
  .strict();

const Order = model<IOrderSchema>("Orders", orderSchema);

export default Order;

export type ICreateOrder = z.infer<typeof createOrderSchema>;
