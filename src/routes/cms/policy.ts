import { Router } from "express";
import auth from "../../middlewares/authStaff";
import MulterUtil from "../../utils/upload";
import policies from "../../controllers/cms/policy";

const policyRoute = Router();
const mu = new MulterUtil().uploads();


policyRoute.post("/policies/", policies.addPolicy);
policyRoute.get("/policies/", policies.get_policies);
policyRoute.get("/policies/:id", policies.get_policy_by_id);
policyRoute.patch("/policies/:id", policies.update_policy);
policyRoute.delete("/policies/:id", policies.delete_policy);
// policyRoute.patch("/team/add_profile_image", mu.single('upload'), auth, policies.add_profile_image);


export default policyRoute