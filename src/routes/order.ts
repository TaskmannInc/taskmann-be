import { Router } from "express";
import auth from "../middlewares/authCustomer";
import adminAuth from "../middlewares/authAdmin";
import order from "../controllers/order";


const orderRoute = Router();


orderRoute.post("/order/:id", auth, order.createOrder);
orderRoute.get("/order/:id", auth, order.getOrder);
orderRoute.get("/orders", auth, order.getOrders);
orderRoute.patch("/order/:id", auth, order.cancelOrder);
orderRoute.patch("/order/cancel/:order_id", auth, order.cancelOrderById);
orderRoute.get("/admin/orders", adminAuth, order.getOrders);
orderRoute.get("/admin/order/:id", adminAuth, order.getOrder);



// orderRoute.patch("/order/:id", auth, order.cancelOrder);
// cartRoute.patch("/cart", auth, cart.updateCart);
// cartRoute.delete("/cart/:id", auth, cart.deleteCart);
export default orderRoute;