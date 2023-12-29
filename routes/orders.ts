import express, { Request, Response } from "express";
import paginationValidation from "../utils/paginationValidation";
import { createOrder, getOrder, getOrders } from "../DB Helpers/orders";
import Order, { createOrderValidation } from "../models/order";
import catchDBHelperError from "../utils/catchDBHelperError";
import { authz } from "./../middleware/authz";
import validateObjectId from "../middleware/validateObjectId";
import { admin } from "../middleware/admin";
import validateReq from "../middleware/validateReq";

const router = express.Router();

router.get(
  "/",
  [authz, admin, validateReq(paginationValidation, "query")],
  async (req: Request, res: Response) => {
    const orders = await getOrders(req.query).catch(catchDBHelperError(res));

    if (!orders) return;
    res.json(orders);
  }
);

router.get(
  "/:id",
  [authz, admin, validateObjectId(Order)],
  async (req: Request, res: Response) => {
    const order = await getOrder(res.locals.document).catch(catchDBHelperError);
    if (!order) return;

    res.json(order);
  }
);

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
