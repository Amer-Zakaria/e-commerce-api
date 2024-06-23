import { Schema, model } from "mongoose";
import IProductSchema from "../Interfaces/IProductSchema";
import { IProductsFilterRequest } from "../Interfaces/IProductsFilter";
import ICreateProduct from "../Interfaces/ICreateProduct";
import IUpdateProduct from "../Interfaces/IUpdateProduct";
import Joi from "joi";
import { logger } from "..";

export const categories = [null, "kitchen", "tech", "car"] as const; // to tuple so you can use it as a Typescript type

const vendorSchema = new Schema(
  {
    name: String,
    bio: String,
  },
  { _id: false }
);

const productSchema: Schema = new Schema<IProductSchema>(
  {
    vendor: vendorSchema,
    name: {
      type: String,
      required: true,
      minLength: 5,
      maxLength: 255,
      lowercase: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      enum: {
        values: categories,
        message: "{VALUE} is not supported",
      },
    },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: function (v: string[]) {
          return v.length >= 1;
        },
        message: "at least one tag is required",
      },
    },
    createdAt: {
      type: Date,
      default: () => new Date(),
      immutable: true,
    },
    updatedAt: {
      type: Date,
      default: () => new Date(),
    },
    isActive: { type: Boolean, default: false },
    price: {
      type: Number,
      required: function (this: IProductSchema) {
        return this.isActive ? true : false;
      },
      min: 10,
      get: (v: number) => Math.round(v),
      set: (v: number) => Math.round(v),
    },
  },
  { versionKey: false }
);

productSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

productSchema.post("save", (product, next) => {
  logger.info(`product "${product.name}" has been saved successfully`);
  next();
});

productSchema.virtual("formatedPrice").get(function () {
  return `${this.price.toFixed(2)}$`;
});

export const Product = model<IProductSchema>("Products", productSchema);
export const Vendor = model("Vendor", vendorSchema);

/**
 * @openapi
 * components:
 *  schemas:
 *    CreateProductInput:
 *      type: object
 *      required:
 *        - name
 *        - price
 *        - quantity
 *        - tags
 *        - category
 *      properties:
 *        name:
 *          type: string
 *          minLength: 5
 *          maxLength: 255
 *        price:
 *          type: number
 *          minimum: 10
 *        quantity:
 *          type: number
 *          minimum: 0
 *          default: 100
 *        tags:
 *          type: array
 *          items:
 *            type: string
 *        category:
 *          type: string
 *          default: car
 *        vendor:
 *          type: object
 *          properties:
 *            name:
 *              type: string
 *            bio:
 *              type: string
 *    CreateProductResponse:
 *      type: object
 *      properties:
 *        _id:
 *          type: string
 *        name:
 *          type: string
 *        price:
 *          type: number
 *        quantity:
 *          type: number
 *        tags:
 *          type: array
 *          items:
 *            type: string
 *        category:
 *          type: string
 *        vendor:
 *          type: object
 *          required:
 *            - name
 *          properties:
 *            name:
 *              type: string
 *            bio:
 *              type: string
 */
export function createProductValidation(
  product: ICreateProduct
): Joi.ValidationResult {
  const schema = Joi.object({
    name: Joi.string().min(5).max(255).required(),
    price: Joi.number().min(10).required(),
    quantity: Joi.number().min(0).required(),
    tags: Joi.array().items(Joi.string().required()).required(),
    category: Joi.string().valid(...categories),
    vendor: Joi.object({ name: Joi.string().required(), bio: Joi.string() }),
  });

  return schema.validate(product, { abortEarly: false });
}

/**
 * @openapi
 * components:
 *  schemas:
 *    UpdateProductInput:
 *      type: object
 *      required:
 *        - name
 *        - price
 *        - quantity
 *        - tags
 *        - category
 *        - isActive
 *      properties:
 *        name:
 *          type: string
 *          minLength: 5
 *          maxLength: 255
 *        price:
 *          type: number
 *          minimum: 10
 *        quantity:
 *          type: number
 *          minimum: 0
 *          default: 100
 *        tags:
 *          type: array
 *          items:
 *            type: string
 *        category:
 *          type: string
 *          default: kitchen
 *        isActive:
 *          type: boolean
 *        vendor:
 *          type: object
 *          required:
 *            - name
 *          properties:
 *            name:
 *              type: string
 *            bio:
 *              type: string
 */
export function updateProductValidation(
  product: IUpdateProduct
): Joi.ValidationResult {
  const schema = Joi.object({
    name: Joi.string().min(5).max(255).required(),
    price: Joi.number().min(10).required(),
    tags: Joi.array().items(Joi.string().required()).required(),
    quantity: Joi.number().min(0).required(),
    category: Joi.string().valid(...categories),
    isActive: Joi.boolean().required(),
    vendor: Joi.object({ name: Joi.string().required(), bio: Joi.string() }),
  });

  return schema.validate(product, { abortEarly: false });
}

/**
 * @openapi
 * components:
 *  schemas:
 *   ProductsFilter:
 *     type: object
 *     properties:
 *       name:
 *         type: string
 *       price:
 *         type: array
 *         items:
 *           type: number
 *         minItems: 2
 *         maxItems: 2
 *         default: [0, 100]
 *       tags:
 *         type: array
 *         items:
 *           type: string
 *         default: []
 *       categories:
 *         type: array
 *         items:
 *           type: string
 *         default: ["kitchen", "car"]
 */
export function productsFilterValidation(
  productsFilter: IProductsFilterRequest
): Joi.ValidationResult {
  const schema = Joi.object({
    name: Joi.string(),
    price: Joi.array()
      .items(Joi.number().required(), Joi.number().required())
      .length(2),
    tags: Joi.array().items(Joi.string()),
    categories: Joi.array().items(...categories),
  });

  return schema.validate(productsFilter, { abortEarly: false });
}
