import { Error, startSession } from "mongoose";
import IOrderSchema from "../Interfaces/IOrderSchema";
import IPagination from "../Interfaces/IPagination";
import Order, { ICreateOrder } from "../models/order";
import { Product } from "../models/product";
import ConstructDBHelperExpectedError from "../utils/ConstructDBHelperExpectedError";

//READ
export async function getOrders(pagination: IPagination): Promise<{
  orders: IOrderSchema[];
  paginationInfo: IPagination & { totalPages: number; totalItems: number };
}> {
  const pageNumber = +(pagination.pageNumber ?? 1);
  const pageSize = +(pagination.pageSize ?? 10);

  const OrdersPromise = Order.find()
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .populate("customer");
  const OrdersCountPromise = Order.find().count();

  return Promise.all([OrdersPromise, OrdersCountPromise]).then((result) => ({
    orders: result[0],
    paginationInfo: {
      totalItems: result[1],
      totalPages: Math.ceil(result[1] / pageSize),
      pageSize: pageSize,
      pageNumber: pageNumber,
    },
  }));
}

export async function getOrder(order: IOrderSchema) {
  const orderWithCustomer = await order.populate("customer");
  return orderWithCustomer.populate("products.product");
}

//CREATE
export async function createOrder(
  createdOrder: ICreateOrder,
  userId: string
): Promise<IOrderSchema> {
  //validating the products
  let productsError = undefined;
  const products = await Promise.all(
    createdOrder.products.map((product) =>
      Product.findById(product.id)
        .select({ name: 1, price: 1, isActive: 1, quantity: 1 })
        .then((p) => {
          let errorMessage: null | string = null;
          if (!p)
            errorMessage = `product with this Id doesn't exist: ${product.id}`;
          else if (!p.isActive)
            errorMessage = `product with this Id is inactive: ${p._id}`;
          else if (p.quantity - product.orderedQuantity < 0)
            errorMessage = `product with this Id doesn't have enough quantity: ${p._id}, current quantity availabe: ${p.quantity}`;

          return !errorMessage
            ? p
            : ConstructDBHelperExpectedError(400, {
                products: errorMessage,
              });
        })
    )
  ).catch((err) => {
    if (err.code === 400) productsError = err;
    throw err;
  });
  if (productsError) return Promise.reject(productsError);

  //creating the order & updateing the products stock as a transaction
  //===Transaction Start
  const session = await startSession();
  session.startTransaction();

  const order = await Order.create(
    [
      //and array so you can add the sessino object
      {
        ...createdOrder,
        customer: userId,
        products: products?.map((product) => ({
          product: product?._id,
          capturedName: product?.name,
          capturedPrice: product?.price,
          orderedQuantity: createdOrder.products.find(
            (p) => p.id === product?._id.toString()
          )?.orderedQuantity,
        })),
      },
    ],
    { session }
  ).catch((errs: Error.ValidationError) => {
    if (errs.errors) return ConstructDBHelperExpectedError(400, errs);
    throw errs;
  });

  //updateing the products stock
  for (const product of createdOrder.products) {
    //
    const p = await Product.findById(product.id).session(session);
    if (p) p.quantity = p.quantity - product.orderedQuantity;
    await p?.save();
  }

  await session.commitTransaction();
  await session.endSession();
  //===Transaction End

  return order[0];
}
