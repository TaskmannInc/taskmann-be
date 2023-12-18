import { Router } from "express";
import auth from "../middlewares/authCustomer";
import cart from "../controllers/cart";
     

const cartRoute = Router();


cartRoute.post("/cart", auth, cart.addCart);
cartRoute.get("/cart", auth, cart.getCart);
cartRoute.patch("/cart", auth, cart.updateCart);
cartRoute.delete("/cart/:id", auth, cart.deleteCart);

export default cartRoute;