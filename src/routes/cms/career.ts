import { Router } from "express";
import auth from "../../middlewares/authStaff";
import MulterUtil from "../../utils/upload";
import careers from "../../controllers/cms/career";

const careerRoute = Router();
const mu = new MulterUtil().uploads();


careerRoute.post("/careers/", careers.addCareer);
careerRoute.get("/careers/", careers.get_careers);
careerRoute.get("/careers/:id", careers.get_career_by_id);
careerRoute.patch("/careers/:id", careers.update_career);
careerRoute.delete("/careers/:id", careers.delete_career);
// careerRoute.patch("/team/add_profile_image", mu.single('upload'), auth, careers.add_profile_image);


export default careerRoute