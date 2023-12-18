import { Router } from "express";
import auth from "../../middlewares/authStaff";
import MulterUtil from "../../utils/upload";
import teams from "../../controllers/cms/team";

const teamRoute = Router();
const mu = new MulterUtil().uploads();


teamRoute.post("/team_members/", mu.single('upload'), teams.addTeam);
teamRoute.get("/team_members/", teams.get_teams);
teamRoute.get("/team_members/:id", teams.get_team_by_id);
teamRoute.patch("/team_members/:id", mu.single('upload'), teams.update_team);
teamRoute.delete("/team_members/:id", teams.delete_team);
// teamRoute.patch("/team/add_profile_image", mu.single('upload'), auth, teams.add_profile_image);


export default teamRoute