import { Request, Response } from 'express';
import Blog from '../../entities/cms/blog';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import { throwTwilioAndGenericErrorMessage, throwTypeOrmEntityFieldError, throwTypeOrmEntityNotFoundErrorMessage, throwTypeOrmQueryFailedErrorMessage } from '../../utils/error';
import { ValidationError } from 'class-validator';






async function addBlog(req: Request, res: Response): Promise<void> {
    try {
        console.log('body', req);
        const blog = await Blog.createBlog(req);
        res.status(201).send({ code: 201, message: 'New blog added succesfully', result: blog });
    } catch (err) {
        if (err instanceof QueryFailedError) {
            const errMsg = throwTypeOrmQueryFailedErrorMessage(err);
            res.status(400).send({ code: 400, error: errMsg });
        }
        else if (err[0] instanceof ValidationError) {
            const errMsg = throwTypeOrmEntityFieldError(err);
            res.status(400).send({ code: 400, error: errMsg });
        }
        else res.status(400).send({ code: 400, error: throwTwilioAndGenericErrorMessage(err) });
    }
}


/**
 * @description search for a service by id or email
 * @param {object} req - request object sent from the client
 * @param {object} res - response object sent to the client
 */
async function get_blogs(req: any, res: Response): Promise<void> {
    try {
        const blogs = await Blog.find();
        res.status(200).send({ code: 200, message: "blogs retrive successfully", result: blogs });
    } catch (err) {
        if (err instanceof EntityNotFoundError) {
            const errMsg = throwTypeOrmEntityNotFoundErrorMessage(err);
            res.status(400).send({ code: 400, error: errMsg });
        }
        else res.status(400).send({ code: 400, error: throwTwilioAndGenericErrorMessage(err) });
    }
}


/**
 * @description search for a service by id or email
 * @param {object} req - request object sent from the client
 * @param {object} res - response object sent to the client
 */
async function get_blog_by_id(req: any, res: Response): Promise<void> {
    try {
        const blog = await Blog.findOneBy({ _id: req.params.id });
        if (!blog) throw new Error("blog not found");
        res.status(200).send({ code: 200, message: "blog retrive successfully", result: blog });
    } catch (err) {
        if (err instanceof EntityNotFoundError) {
            const errMsg = throwTypeOrmEntityNotFoundErrorMessage(err);
            res.status(400).send({ code: 400, error: errMsg });
        }
        else res.status(400).send({ code: 400, error: throwTwilioAndGenericErrorMessage(err) });
    }
}




async function update_blog(req: any, res: Response): Promise<void> {
    try {
        let blog: any = await Blog.findOneBy({ _id: req.params.id });
        if (!blog) throw new Error("blog not found");
        blog = await blog.updateBlog(req);
        res.status(200).send({ code: 200, message: "resources updated successfully", result: blog });
    } catch (err) {
        res.status(400).send({ code: 400, error: (err as Error).message });
    }
}



/**
 * @description - return the profile of currently logged in user through the request object
 * @param {*} req - request object sent from the client/user
 * @param {*} res - response object sent to the client/user
 * @returns {object} - returns a user object
 */
async function delete_blog(req: any, res: Response): Promise<void> {

    const blog = await Blog.findOneBy({ _id: req.params.id });
    if (!blog) throw new Error("blog not found");
    await blog.remove();
    res.status(200).send({ code: 200, message: "blog posting removed successfully" }); // INFO does the profile needs to return token
}


export default {
    addBlog,
    get_blogs,
    get_blog_by_id,
    update_blog,
    delete_blog
}
