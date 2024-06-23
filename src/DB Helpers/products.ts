import { Error } from "mongoose";
import IProductSchema from "../Interfaces/IProductSchema";
import ICreateProduct from "../Interfaces/ICreateProduct";
import IUpdateProduct from "../Interfaces/IUpdateProduct";
import {
  IProductsFilterRequest,
  IProductsFilterForMongoose,
} from "../Interfaces/IProductsFilter";
import IPagination from "../Interfaces/IPagination";
import { Product, Vendor } from "../models/product";
import ConstructDBHelperExpectedError from "../utils/ConstructDBHelperExpectedError";

//READ
export async function getProducts(
  filter: IProductsFilterRequest,
  pagination: IPagination
): Promise<{
  products: IProductSchema[];
  paginationInfo: IPagination & { totalPages: number; totalItems: number };
}> {
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
        pageSize: pageSize,
        pageNumber: pageNumber,
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

  return product.save().catch((errs: Error.ValidationError) => {
    if (errs.errors) return ConstructDBHelperExpectedError(400, errs);
    throw new Error(errs.message);
  });
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
  return product.save().catch((errs: Error.ValidationError) => {
    if (errs.errors) return ConstructDBHelperExpectedError(400, errs);
    throw new Error(errs.message);
  });
}

//DELETE
export async function deleteProduct(product: IProductSchema) {
  const result = await product.deleteOne();

  return result;
}
