import { Router } from "express";
import auth from "../middlewares/authCustomer";
import payment from "../controllers/payment";


const paymentRoute = Router();


paymentRoute.post("/payment_link/:id", auth, payment.createPayment);
paymentRoute.post("/payment_event", payment.paymentEvent);
// orderRoute.get("/orders", auth, order.getOrders);
// orderRoute.patch("/order/:id", auth, order.cancelOrder);
// cartRoute.patch("/cart", auth, cart.updateCart);
// cartRoute.delete("/cart/:id", auth, cart.deleteCart);
export default paymentRoute;