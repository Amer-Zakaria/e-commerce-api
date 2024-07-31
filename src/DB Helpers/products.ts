import { Error, startSession } from "mongoose";
import IProductSchema from "../Interfaces/IProductSchema";
import IProductsFilterForMongoose from "../Interfaces/IProductsFilterForMongoose";
import IPagination from "../Interfaces/IPagination";
import {
  ICreateProduct,
  IUpdateProduct,
  IFilterProduct,
  Product,
  Vendor,
} from "../models/product";
import ConstructDBHelperExpectedError from "../utils/ConstructDBHelperExpectedError";
import IReturnedList from "../Interfaces/IReturnedList";
import { getCachedProducts } from "../redis/products";
import {
  getRedisIsHealthy,
  setRedisIsHealthy,
} from "./../utils/trackRedisHealth";
import { cacheClient } from "..";

//READ
export async function getProducts(
  filter: IFilterProduct,
  pagination: IPagination
): Promise<IReturnedList<IProductSchema>> {
  if (getRedisIsHealthy()) return getCachedProducts(filter, pagination);

  const pageNumber = +(pagination.pageNumber ?? 1);
  const pageSize = +(pagination.pageSize ?? 10);

  //Constructing the filter object
  const filterConstructor: IProductsFilterForMongoose = {};
  if (filter.name)
    filterConstructor.name = new RegExp(`.*${filter.name?.trim()}.*`, "i");
  if (filter.price)
    filterConstructor.price = { $gte: filter.price[0], $lte: filter.price[1] };
  if (filter.tags && filter.tags.length > 0)
    filterConstructor.tags = { $in: filter.tags };
  if (filter.categories) filterConstructor.category = filter.categories;

  const ProductsPromise = Product.find(filterConstructor)
    .sort({
      price: -1,
    })
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize);

  const ProductsCountPromise = Product.find(filterConstructor).count();

  return Promise.all([ProductsPromise, ProductsCountPromise]).then(
    (result) => ({
      products: result[0],
      paginationInfo: {
        totalItems: result[1],
        totalPages: Math.ceil(result[1] / pageSize),
        pageSize,
        pageNumber,
      },
    })
  );
}

//CREATE
export async function createProduct(
  createdProduct: ICreateProduct
): Promise<IProductSchema> {
  const product = new Product({
    ...createdProduct,
    vendor: new Vendor(createdProduct.vendor),
  });

  //---------- Transaction starts
  const session = await startSession();
  session.startTransaction();

  const savedProduct = await product
    .save()
    .catch((errs: Error.ValidationError) => {
      if (errs.errors) return ConstructDBHelperExpectedError(400, errs);
      throw new Error(errs.message);
    });

  if (getRedisIsHealthy()) {
    await cacheClient.json
      .set("product:" + savedProduct._id, "$", savedProduct as any)
      .catch(() => setRedisIsHealthy(false));
  }

  await session.commitTransaction();
  await session.endSession();
  //---------- Transaction ends

  return savedProduct;
}

//UPDATE:
export async function updateProductQueryFirstWay(
  id: string,
  updatedProduct: IUpdateProduct
): Promise<IProductSchema> {
  //GET IT
  const product = await Product.findOne({ _id: id });

  //VALIDATE IT
  if (!product) {
    return ConstructDBHelperExpectedError(404, "Product doesn't exist");
  }
  if (product.isActive) {
    return ConstructDBHelperExpectedError(400, {
      isActive: "Product is active we can't mess with it",
    });
  }

  //CHANGE IT
  product.set({
    ...updatedProduct,
    vendor: new Vendor(updatedProduct.vendor),
  });

  //SAVE IT
  //---------- Transaction starts
  const session = await startSession();
  session.startTransaction();

  const savedProduct = await product
    .save()
    .catch((errs: Error.ValidationError) => {
      if (errs.errors) return ConstructDBHelperExpectedError(400, errs);
      throw new Error(errs.message);
    });

  if (getRedisIsHealthy()) {
    await cacheClient.json
      .set("product:" + savedProduct._id, "$", savedProduct as any)
      .catch(() => setRedisIsHealthy(false));
  }

  await session.commitTransaction();
  await session.endSession();
  //---------- Transaction ends

  return savedProduct;
}

//DELETE
export async function deleteProduct(product: IProductSchema) {
  //---------- Transaction starts
  const session = await startSession();
  session.startTransaction();

  const result = await product.deleteOne({ session });

  if (getRedisIsHealthy()) {
    await cacheClient.json
      .del("product:" + product._id)
      .catch(() => setRedisIsHealthy(false));
  }

  await session.commitTransaction();
  await session.endSession();
  //---------- Transaction ends

  return result;
}
