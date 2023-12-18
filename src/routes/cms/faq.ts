import { Router } from "express";
import auth from "../../middlewares/authStaff";
import MulterUtil from "../../utils/upload";
import faqs from "../../controllers/cms/faq";

const faqRoute = Router();
const mu = new MulterUtil().uploads();


faqRoute.post("/faqs/", faqs.addFaq);
faqRoute.get("/faqs/", faqs.get_faqs);
faqRoute.get("/faqs/:id", faqs.get_faq_by_id);
faqRoute.patch("/faqs/:id", faqs.update_faq);
faqRoute.delete("/faqs/:id", faqs.delete_faq);
// faqRoute.patch("/team/add_profile_image", mu.single('upload'), auth, faqs.add_profile_image);


export default faqRoute