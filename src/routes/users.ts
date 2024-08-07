import express, { Request, Response } from "express";
import paginationValidation from "../utils/paginationValidation";
import User, { createUserSchema } from "../models/user";
import { createUser, getUsers } from "../DB Helpers/users";
import catchDBHelperError from "../utils/catchDBHelperError";
import validateUniqueness from "../middleware/validateUniqueness";
import validateReq from "../middleware/validateReq";
import { authz } from "../middleware/authz";
import { admin } from "../middleware/admin";
export const router = express.Router();

/**
 * @openapi
 * '/api/users':
 *  get:
 *     tags:
 *     - User
 *     summary: Get the users
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
 *     responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              default: []
 */
router.get(
  "/",
  [authz, admin, validateReq(paginationValidation, "query")],
  async (req: Request, res: Response) => {
    const users = await getUsers(req.query).catch(catchDBHelperError(res));
    if (!users) return;
    res.json(users);
  }
);

/**
 * @openapi
 * '/api/users':
 *  post:
 *     tags:
 *     - User
 *     summary: Register a user
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              $ref: '#/components/schemas/CreateUserInput'
 *     responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreateUserResponse'
 *      400:
 *        description: Bad request
 */
router.post(
  "/",
  [validateReq(createUserSchema, "body"), validateUniqueness("email", User)],
  async (req: Request, res: Response) => {
    const createdUser = await createUser(res.locals.data).catch(
      catchDBHelperError(res)
    );
    if (!createdUser) return;

    const token = createdUser.generateAuthToken();
    res.header("x-auth-token", token).status(201).json(createdUser);
  }
);

export default router;
