import express, { Request, Response } from "express";
import paginationValidation from "../utils/paginationValidation";
import { createOrder, getOrder, getOrders } from "../DB Helpers/orders";
import Order, { createOrderValidation } from "../models/order";
import catchDBHelperError from "../utils/catchDBHelperError";
import { authz } from "../middleware/authz";
import validateObjectId from "../middleware/validateObjectId";
import { admin } from "../middleware/admin";
import validateReq from "../middleware/validateReq";

const router = express.Router();

/**
 * @openapi
 * '/api/orders':
 *  get:
 *    tags:
 *    - Order
 *    summary: Get a list of orders with pagination
 *    security:
 *      - bearerAuth: []
 *    parameters:
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
 *    responses:
 *      200:
 *        description: A list of orders
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 */
router.get(
  "/",
  [authz, admin, validateReq(paginationValidation, "query")],
  async (req: Request, res: Response) => {
    const orders = await getOrders(req.query).catch(catchDBHelperError(res));

    if (!orders) return;
    res.json(orders);
  }
);

/**
 * @openapi
 * '/api/orders/{id}':
 *  get:
 *    tags:
 *      - Order
 *    summary: Get a specific order by ID
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: Unique identifier of the order to be retrieved
 *    responses:
 *      200:
 *        description: Details of the order
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *      404:
 *        description: Not Found - The order with the given ID was not found
 */
router.get(
  "/:id",
  [authz, admin, validateObjectId(Order)],
  async (req: Request, res: Response) => {
    const order = await getOrder(res.locals.document).catch(catchDBHelperError);
    if (!order) return;

    res.json(order);
  }
);

/**
 * @openapi
 * '/api/orders':
 *  post:
 *    tags:
 *    - Order
 *    summary: Create a new order
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/CreateOrder'
 *    responses:
 *      201:
 *        description: The order was successfully created
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreateOrder'
 *      400:
 *        description: Bad Request - Validation errors in the request body
 */
router.post(
  "/",
  [authz, validateReq(createOrderValidation, "body")],
  async (req: Request, res: Response) => {
    const createdOrder = await createOrder(req.body, res.locals.user._id).catch(
      catchDBHelperError(res)
    );
    if (!createdOrder) return;
    res.status(201).json(createdOrder);
  }
);

export default router;
