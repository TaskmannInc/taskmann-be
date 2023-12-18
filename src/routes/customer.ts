import { Router } from "express";
import auth from "../middlewares/authCustomer";
import adminAuth from "../middlewares/authAdmin";
import MulterUtil from "../utils/upload";
import { register_customer, sms_verification_token, customer, login_customer, verify_email, update_customer, get_customers } from "../controllers/customer";
import { logout_customer,logout_all_guest_device, add_profile_image, resetpassword, get_customer_by_id, forgotpassword, verify_phone, send_verification_code, changepassword } from "../controllers/customer";


const customerRoute = Router();
const mu = new MulterUtil().uploads();


customerRoute.post("/customer/register", register_customer);
customerRoute.get("/customer", auth, customer);
customerRoute.get("/customers", adminAuth, get_customers);
customerRoute.patch("/customer/resend_verification_code", send_verification_code);
customerRoute.post("/customer/login", login_customer);
customerRoute.patch("/customer/verify_email", verify_email);
customerRoute.patch("/customer/verify_phone", verify_phone);
customerRoute.patch("/customer/update", auth, update_customer);
customerRoute.patch("/customer/change_password", auth, changepassword);
customerRoute.patch("/customer/forgot_password", forgotpassword);
customerRoute.patch("/customer/reset_password", resetpassword);
customerRoute.patch("/customer/add_profile_image", mu.single('upload'), auth, add_profile_image);
customerRoute.get("/customer/:id", auth, get_customer_by_id);
customerRoute.patch("/customer/send_sms_code", sms_verification_token);
customerRoute.delete("/customer/logout", auth, logout_customer);
customerRoute.delete("/customer/logout_all", auth, logout_all_guest_device);
export default customerRoute
