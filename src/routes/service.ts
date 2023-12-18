import { Router } from "express";
import auth from "../middlewares/authAdmin";
import { addService, addPricetier, addSubservice } from "../controllers/service";
import { update_pricetier, update_service, update_subservice } from "../controllers/service";
import { delete_pricetier, delete_service, delete_subservice } from "../controllers/service";
import { get_services, get_pricetiers, get_subservices } from "../controllers/service";
import { get_service_by_id, get_subservice_by_id, get_pricetier_by_id } from "../controllers/service";


import MulterUtil from "../utils/upload";
// const mu = multer({ dest: 'uploads/' });
const mu = new MulterUtil().uploads();


const serviceRoute = Router();


serviceRoute.post("/service", mu.array('upload', 100), auth, addService);
serviceRoute.post("/service/subservice/pricetier", auth, addPricetier);
serviceRoute.post("/service/subservice", mu.array('upload', 100), auth, addSubservice);

serviceRoute.get("/service/subservice/pricetier/", get_pricetiers);
serviceRoute.get("/service/subservice", get_subservices);
serviceRoute.get("/service/", get_services);

serviceRoute.get("/service/subservice/pricetier/:id", get_pricetier_by_id);
serviceRoute.get("/service/subservice/:id", get_subservice_by_id);
serviceRoute.get("/service/:id", get_service_by_id);

serviceRoute.patch("/service/:id", mu.array('upload', 100), auth, update_service);
serviceRoute.patch("/service/subservice/pricetier/:id", update_pricetier);
serviceRoute.patch("/service/subservice/:id", mu.array('upload', 100), auth, update_subservice);

serviceRoute.delete("/service/:id", auth, delete_service);
serviceRoute.delete("/service/subservice/pricetier/:id", auth, delete_pricetier);
serviceRoute.delete("/service/subservice/:id", auth, delete_subservice);

export default serviceRoute;