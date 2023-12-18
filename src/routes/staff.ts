import { Router } from "express";
import authStaff from "../middlewares/authStaff";
import adminAuth from "../middlewares/authAdmin";
import MulterUtil from "../utils/upload";
import { register_staff, sms_verification_token, staff, login_staff, verify_email, update_staff, get_staffs, update_staff_role } from "../controllers/staff";
import { logout_staff, logout_all_guest_device, add_profile_image, resetpassword, get_staff_by_id, forgotpassword, verify_phone, send_verification_code, changepassword } from "../controllers/staff";


const staffRoute = Router();
const mu = new MulterUtil().uploads();


staffRoute.post("/staff/register", register_staff);
staffRoute.get("/staff/", authStaff, staff);
staffRoute.patch("/staff/resend_verification_code", send_verification_code);
staffRoute.post("/staff/login", login_staff);
staffRoute.patch("/staff/verify_email", verify_email);
staffRoute.patch("/staff/verify_phone", verify_phone);
staffRoute.patch("/staff/update", authStaff, update_staff);
staffRoute.patch("/staff/update_role", adminAuth, update_staff_role);
staffRoute.patch("/staff/change_password", authStaff, changepassword);
staffRoute.patch("/staff/forgot_password", forgotpassword);
staffRoute.patch("/staff/reset_password", resetpassword);
staffRoute.patch("/staff/add_profile_image", mu.single('upload'), authStaff, add_profile_image);
staffRoute.get("/staff/:id", authStaff, get_staff_by_id);
staffRoute.get("/staffs/", adminAuth, get_staffs);
staffRoute.patch("/staff/send_sms_code", sms_verification_token);
staffRoute.delete("/staff/logout", authStaff, logout_staff);
staffRoute.delete("/staff/logout_all", authStaff, logout_all_guest_device);

export default staffRoute
