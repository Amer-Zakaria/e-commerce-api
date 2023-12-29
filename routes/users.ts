import express, { Request, Response } from "express";
import paginationValidation from "../utils/paginationValidation";
import User, { createUserValidation } from "../models/user";
import { createUser, getUsers } from "../DB Helpers/users";
import catchDBHelperError from "../utils/catchDBHelperError";
import validateUniqueness from "../startup/validateUniqueness";
import validateReq from "../middleware/validateReq";
import { authz } from "../middleware/authz";
import { admin } from "../middleware/admin";
export const router = express.Router();

router.get(
  "/",
  [authz, admin, validateReq(paginationValidation, "query")],
  async (req: Request, res: Response) => {
    const users = await getUsers(req.query).catch(catchDBHelperError(res));
    if (!users) return;
    res.json(users);
  }
);

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
