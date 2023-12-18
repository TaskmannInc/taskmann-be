import { Router } from "express";
import auth from "../../middlewares/authStaff";
import MulterUtil from "../../utils/upload";
import rt from "../../controllers/cms/review_testimony";

const review_testimonyRoute = Router();
const mu = new MulterUtil().uploads();


review_testimonyRoute.post("/rt/", rt.addReviewTestimony);
review_testimonyRoute.get("/rt/", rt.get_reviews_testimonies);
review_testimonyRoute.get("/rt/:id", rt.get_review_testimony_by_id);
review_testimonyRoute.patch("/rt/:id", rt.update_review_testimony);
review_testimonyRoute.delete("/rt/:id", rt.delete_review_testimony);
// review_testimonyRoute.patch("/team/add_profile_image", mu.single('upload'), auth, rt.add_profile_image);


export default review_testimonyRoute