import { Router } from "express";
import auth from "../../middlewares/authStaff";
import MulterUtil from "../../utils/upload";
import about_us from "../../controllers/cms/about_us";

const aboutus_Route = Router();
const mu = new MulterUtil().uploads();


aboutus_Route.post("/about_us/", mu.single('upload'), auth, about_us.addAboutUs);
aboutus_Route.get("/about_us/", about_us.get_about_us);
aboutus_Route.get("/about_us/:id", about_us.get_about_us_by_id);
aboutus_Route.patch("/about_us/:id", mu.single('upload'), auth, about_us.update_about_us);
aboutus_Route.delete("/about_us/:id", about_us.delete_about_us);
// faqRoute.patch("/team/add_profile_image", mu.single('upload'), auth, faqs.add_profile_image);


export default aboutus_Route