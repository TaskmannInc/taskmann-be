import { Router } from "express";
import auth from "../../middlewares/authStaff";
import MulterUtil from "../../utils/upload";
import contacts from "../../controllers/cms/contact_us";

const contactus_Route = Router();
const mu = new MulterUtil().uploads();


contactus_Route.post("/contacts/", contacts.addContact);
contactus_Route.get("/contacts/", contacts.get_contacts);
contactus_Route.get("/contacts/:id", contacts.get_contact_by_id);
contactus_Route.patch("/contacts/:id", contacts.update_contact);
contactus_Route.delete("/contacts/:id", contacts.delete_contact);
// contactus_Route.patch("/team/add_profile_image", mu.single('upload'), auth, faqs.add_profile_image);


export default contactus_Route