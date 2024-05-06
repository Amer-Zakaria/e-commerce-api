import { Express } from "express";
import products from "../routes/products";
import orders from "../routes/orders";
import users from "../routes/users";
import auth from "../routes/auth";
import error from "../middleware/error";

module.exports = function (app: Express) {
  app.get("/", (req, res) => res.json("Hello from the home page!!"));
  app.use("/api/products", products);
  app.use("/api/orders", orders);
  app.use("/api/users", users);
  app.use("/api/auth", auth);

  app.use(error);
};
