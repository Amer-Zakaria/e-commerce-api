import express, { Request, Response } from "express";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProductQueryFirstWay,
} from "../DB Helpers/products";
import {
  productFilterSchema,
  createProductSchema,
  updateProductSchema,
} from "../models/product";
import paginationValidation from "../utils/paginationValidation";
import { authz } from "../middleware/authz";
import { admin } from "../middleware/admin";
import catchDBHelperError from "../utils/catchDBHelperError";
import validateObjectId from "../middleware/validateObjectId";
import { Product } from "../models/product";
import validateReq from "../middleware/validateReq";
import validateUniqueness from "../middleware/validateUniqueness";

const router = express.Router();

/**
 * @openapi
 * '/api/products/get-products':
 *   post:
 *     tags:
 *     - Product
 *     summary: Get the products
 *     parameters:
 *       - in: query
 *         name: pageNumber
 *         required: false
 *         schema:
 *           $ref: '#/components/schemas/pageNumber'
 *       - in: query
 *         name: pageSize
 *         required: false
 *         schema:
 *           $ref: '#/components/schemas/pageSize'
 *     requestBody:
 *      required: false
 *      content:
 *        application/json:
 *          schema:
 *             $ref: '#/components/schemas/ProductsFilter'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CreateProductResponse'
 */
router.post(
  "/get-products",
  [
    validateReq(productFilterSchema, "body"),
    validateReq(paginationValidation, "query"),
  ],
  async (req: Request, res: Response) => {
    const products = await getProducts(res.locals.data, req.query).catch(
      catchDBHelperError(res)
    );
    if (!products) return;
    res.json(products);
  }
);

/**
 * @openapi
 * '/api/products':
 *  post:
 *     tags:
 *     - Product
 *     summary: Create a product
 *     security:
 *     - bearerAuth: []
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              $ref: '#/components/schemas/CreateProductInput'
 *     responses:
 *      201:
 *        description: Product created successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreateProductResponse'
 *      400:
 *        description: Bad request
 */
router.post(
  "/",
  [
    authz,
    admin,
    validateReq(createProductSchema, "body"),
    validateUniqueness("name", Product),
  ],
  async (req: Request, res: Response) => {
    const createdProduct = await createProduct(res.locals.data).catch(
      catchDBHelperError(res)
    );
    if (!createdProduct) return;
    res.status(201).json(createdProduct);
  }
);

/**
 * @openapi
 *'/api/products/{id}':
 *  put:
 *    tags:
 *    - Product
 *    summary: Update a product
 *    security:
 *    - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: The product ID
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/UpdateProductInput'
 *    responses:
 *      200:
 *        description: Product updated successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreateProductResponse'
 *      400:
 *        description: Bad request
 *      404:
 *        description: Product not found
 */
router.put(
  "/:id",
  [
    authz,
    admin,
    validateObjectId(Product),
    validateReq(updateProductSchema, "body"),
    validateUniqueness("name", Product),
  ],
  async (req: Request, res: Response) => {
    const updatedProduct = await updateProductQueryFirstWay(
      req.params.id,
      res.locals.data
    ).catch(catchDBHelperError(res));
    if (!updatedProduct) return;
    res.json(updatedProduct);
  }
);

/**
 * @openapi
 * '/api/products/{id}':
 *  delete:
 *    tags:
 *    - Product
 *    summary: Delete a product by ID
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: The product ID to delete
 *    responses:
 *      200:
 *        description: The product was successfully deleted
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Product'
 *      401:
 *        description: Unauthorized - User is not authenticated
 *      403:
 *        description: Forbidden - User is not authorized to delete products
 *      404:
 *        description: Not Found - The product with the given ID was not found
 */
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
