import express from "express";
import User, { userCredentialsValidation } from "./../models/user";
import extractErrorMessagesJOI from "../utils/extractErrorMessagesJOI";
import bcrypt from "bcrypt";
import { stackDecision } from "../utils/catchDBHelperError";
import validateReq from "../middleware/validateReq";

export const router = express.Router();

router.post(
  "/",
  validateReq(userCredentialsValidation, "body"),
  async (req, res) => {
    //-----1 valid data
    const result = userCredentialsValidation(req.body);
    if (result.error) {
      res.status(400).json({
        validation: extractErrorMessagesJOI(result.error),
        ...stackDecision(),
      });
      return;
    }

    const user = await User.findOne({ email: result.value.email }).select(
      "+password"
    );

    //------2 is it the right email
    if (!user) {
      res.status(400).json({
        message: "Incorrect Email or Password",
        ...stackDecision(),
      });
      return;
    }

    //------3 is it the right password
    const isValidePassword = await bcrypt.compare(
      result.value.password,
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
  }
);

export default router;
