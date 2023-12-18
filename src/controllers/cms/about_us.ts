import { Request, Response } from 'express';
import AboutUs from '../../entities/cms/about_us';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import { throwTwilioAndGenericErrorMessage, throwTypeOrmEntityFieldError, throwTypeOrmEntityNotFoundErrorMessage, throwTypeOrmQueryFailedErrorMessage } from '../../utils/error';
import { ValidationError } from 'class-validator';






async function addAboutUs(req: Request, res: Response): Promise<void> {
    try {
        const about_us = await AboutUs.createAboutUs(req);
        res.status(201).send({ code: 201, message: 'content dded succesfully', result: about_us });
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
async function get_about_us(req: any, res: Response): Promise<void> {
    try {
        const about_us = await AboutUs.find();
        res.status(200).send({ code: 200, message: "service retrive successfully", result: about_us });
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
async function get_about_us_by_id(req: any, res: Response): Promise<void> {
    try {
        const about_us = await AboutUs.findOneBy({ _id: req.params.id });
        if (!about_us) throw new Error("about_us not found");
        res.status(200).send({ code: 200, message: "about_us retrive successfully", result: about_us });
    } catch (err) {
        if (err instanceof EntityNotFoundError) {
            const errMsg = throwTypeOrmEntityNotFoundErrorMessage(err);
            res.status(400).send({ code: 400, error: errMsg });
        }
        else res.status(400).send({ code: 400, error: throwTwilioAndGenericErrorMessage(err) });
    }
}




async function update_about_us(req: any, res: Response): Promise<void> {
    try {
        let about_us: any = await AboutUs.findOneBy({ _id: req.params.id });
        if (!about_us) throw new Error("about_us not found");
        about_us = await about_us.updateAboutUs(req);
        res.status(200).send({ code: 200, message: "resources updated successfully", result: about_us });
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
async function delete_about_us(req: any, res: Response): Promise<void> {
    try{
        const about_us = await AboutUs.findOneBy({ _id: req.params.id });
        if (!about_us) throw new Error("about_us not found");
        await about_us.remove();
        res.status(200).send({ code: 200, message: "removed successfully" }); // INFO does the profile needs to return token
    }
    catch(err){
        res.status(400).send({ code: 400, error: (err as Error).message });
    }
}


export default {
    addAboutUs,
    get_about_us,
    get_about_us_by_id,
    update_about_us,
    delete_about_us
}
