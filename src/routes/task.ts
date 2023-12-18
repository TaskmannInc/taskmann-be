import { Router } from "express";
import authStaff from "../middlewares/authStaff";
import adminAuth from "../middlewares/authAdmin";
import task from "../controllers/task";


const taskRoute = Router();

taskRoute.post("/admin/task/:id", adminAuth, task.assignTask);
taskRoute.get("/admin/task/:id", adminAuth, task.getTask);
taskRoute.get("/admin/tasks", adminAuth, task.getTasks);
taskRoute.get("/task/:id", authStaff, task.getTask);
taskRoute.get("/tasks", authStaff, task.getTasks);
taskRoute.patch("/task/accept_reject/:id", authStaff, task.acceptrejectTask);
taskRoute.patch("/task/cancel_inprogress_complete/:id", authStaff, task.cancelinprogresscompletTask);

// orderRoute.get("/order/:id", auth, order.getOrder);
// orderRoute.get("/orders", auth, order.getOrders);
// orderRoute.get("/admin/orders", adminAuth, order.getOrders);
// orderRoute.get("/admin/order/:id", adminAuth, order.getOrder);


// orderRoute.patch("/order/:id", auth, order.cancelOrder);
// cartRoute.patch("/cart", auth, cart.updateCart);
// cartRoute.delete("/cart/:id", auth, cart.deleteCart);
export default taskRoute;