import express, { Request, Response } from "express";
import paginationValidation from "../utils/paginationValidation";
import User, { createUserValidation } from "../models/user";
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
 *       - name: pageNumber
 *         in: query
 *         description: The page number
 *         required: false
 *         schema:
 *           type: number
 *       - name: pageSize
 *         in: query
 *         description: How many users you want per page
 *         required: false
 *         schema:
 *           type: number
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
  [
    validateReq(createUserValidation, "body"),
    validateUniqueness("email", User),
  ],
  async (req: Request, res: Response) => {
    const createdUser = await createUser(req.body).catch(
      catchDBHelperError(res)
    );
    if (!createdUser) return;

    const token = createdUser.generateAuthToken();
    res.header("x-auth-token", token).status(201).json(createdUser);
  }
);

export default router;
