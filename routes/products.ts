import express, { Request, Response } from "express";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProductQueryFirstWay,
} from "../DB Helpers/products";
import {
  productsFilterValidation,
  createProductValidation,
  updateProductValidation,
} from "../models/product";
import paginationValidation from "../utils/paginationValidation";
import { authz } from "../middleware/authz";
import { admin } from "../middleware/admin";
import catchDBHelperError from "../utils/catchDBHelperError";
import validateObjectId from "../middleware/validateObjectId";
import { Product } from "../models/product";
import validateReq from "../middleware/validateReq";
import validateUniqueness from "../startup/validateUniqueness";

const router = express.Router();

router.get(
  "/",
  [
    validateReq(productsFilterValidation, "body"),
    validateReq(paginationValidation, "query"),
  ],
  async (req: Request, res: Response) => {
    const products = await getProducts(req.body, req.query).catch(
      catchDBHelperError(res)
    );
    if (!products) return;
    res.json(products);
  }
);

router.post(
  "/",
  [
    authz,
    admin,
    validateReq(createProductValidation, "body"),
    validateUniqueness("name", Product),
  ],
  async (req: Request, res: Response) => {
    const createdProduct = await createProduct(req.body).catch(
      catchDBHelperError(res)
    );
    if (!createdProduct) return;
    res.status(201).json(createdProduct);
  }
);

router.put(
  "/:id",
  [
    authz,
    admin,
    validateObjectId(Product),
    validateReq(updateProductValidation, "body"),
    validateUniqueness("name", Product),
  ],
  async (req: Request, res: Response) => {
    const updatedProduct = await updateProductQueryFirstWay(
      req.params.id,
      req.body
    ).catch(catchDBHelperError(res));
    if (!updatedProduct) return;
    res.json(updatedProduct);
  }
);

router.delete(
  "/:id",
  [authz, admin, validateObjectId(Product)],
  async (req: Request, res: Response) => {
    const deletedProduct = await deleteProduct(res.locals.document).catch(
      catchDBHelperError(res)
    );
    if (!deletedProduct) return;
    res.json(deletedProduct);
  }
);

export default router;
