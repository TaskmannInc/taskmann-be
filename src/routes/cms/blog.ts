import { Router } from "express";
import auth from "../../middlewares/authStaff";
import MulterUtil from "../../utils/upload";
import blogs from "../../controllers/cms/blog";

const blogRoute = Router();
const mu = new MulterUtil().uploads();


blogRoute.post("/blogs/", mu.single('upload'), blogs.addBlog);
blogRoute.get("/blogs/", blogs.get_blogs);
blogRoute.get("/blogs/:id", blogs.get_blog_by_id);
blogRoute.patch("/blogs/:id", mu.single('upload'), blogs.update_blog);
blogRoute.delete("/blogs/:id", blogs.delete_blog);
// faqRoute.patch("/team/add_profile_image", mu.single('upload'), auth, blogs.add_profile_image);


export default blogRoute