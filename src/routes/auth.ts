import express from "express";
import User, { IUserCred, userCredSchema } from "../models/user";
import bcrypt from "bcrypt";
import { stackDecision } from "../utils/catchDBHelperError";
import validateReq from "../middleware/validateReq";

export const router = express.Router();

/**
 * @openapi
 * '/api/auth':
 *  post:
 *     tags:
 *     - Auth
 *     summary: User login
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              $ref: '#/components/schemas/UserCredentialsInput'
 *     responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *      400:
 *        description: Incorrect Email or Password
 */
router.post("/", validateReq(userCredSchema, "body"), async (req, res) => {
  const userCred = res.locals.data as Partial<IUserCred>;
  const user = await User.findOne({ email: userCred.email }).select(
    "+password"
  );

  // is it an existing email
  if (!user) {
    res.status(400).json({
      message: "Incorrect Email or Password",
      ...stackDecision(),
    });
    return;
  }

  // is it the right password
  const isValidePassword = await bcrypt.compare(
    userCred.password || "",
    user.password
  );
  if (!isValidePassword) {
    res.status(400).json({
      message: "Incorrect Email or Password",
      ...stackDecision(),
    });
    return;
  }

  const token = user.generateAuthToken();
  res.send(token);
});

export default router;
