import express, { Request, Response } from "express";
import paginationValidation from "../utils/paginationValidation";
import {
  createOrder,
  getOrder,
  getOrders,
  updateStatus,
} from "../DB Helpers/orders";
import Order, { createOrderSchema, orderStatusList } from "../models/order";
import catchDBHelperError from "../utils/catchDBHelperError";
import { authz } from "../middleware/authz";
import validateObjectId from "../middleware/validateObjectId";
import { admin } from "../middleware/admin";
import validateReq from "../middleware/validateReq";
import { z } from "zod";
import extractErrorMessagesZod from "../utils/extractErrorMessagesZod";

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
  [authz, validateReq(createOrderSchema, "body")],
  async (req: Request, res: Response) => {
    const createdOrder = await createOrder(
      res.locals.data,
      res.locals.user._id
    ).catch(catchDBHelperError(res));
    if (!createdOrder) return;
    res.status(201).json(createdOrder);
  }
);

/**
 * @openapi
 * '/api/orders/{status}/{id}':
 *   patch:
 *     tags:
 *     - Order
 *     summary: Change the "status"
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type:
 *           enum: [waitingDelivery, canceled, delivering, delivered]
 *         description: Order status
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The order Id
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Order not found
 */
router.patch(
  "/:status/:id",
  [authz, admin, validateObjectId(Order)],
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const status = req.params.status;
    //Validate
    const statusSchema = z.enum(orderStatusList);
    const result = statusSchema.safeParse(status);
    if (result.error)
      return res.status(400).json({
        validation: extractErrorMessagesZod(result.error),
      });

    //Update
    const updatedOrder = await updateStatus(id, result.data).catch(
      catchDBHelperError(res)
    );

    if (!updatedOrder) return;

    res.json(updatedOrder);
  }
);

export default router;
