import { Request, Response } from 'express';
import Career from '../../entities/cms/career';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import { throwTwilioAndGenericErrorMessage, throwTypeOrmEntityFieldError, throwTypeOrmEntityNotFoundErrorMessage, throwTypeOrmQueryFailedErrorMessage } from '../../utils/error';
import { ValidationError } from 'class-validator';






async function addCareer(req: Request, res: Response): Promise<void> {
    try {
        const career = await Career.createCareer(req.body);
        res.status(201).send({ code: 201, message: 'New Job added succesfully', result: career });
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
async function get_careers(req: any, res: Response): Promise<void> {
    try {
        const jobs = await Career.find();
        res.status(200).send({ code: 200, message: "service retrive successfully", result: jobs });
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
async function get_career_by_id(req: any, res: Response): Promise<void> {
    try {
        const career = await Career.findOneByOrFail({ _id: req.params.id });
        res.status(200).send({ code: 200, message: "career retrive successfully", result: career });
    } catch (err) {
        if (err instanceof EntityNotFoundError) {
            const errMsg = throwTypeOrmEntityNotFoundErrorMessage(err);
            res.status(400).send({ code: 400, error: errMsg });
        }
        else res.status(400).send({ code: 400, error: throwTwilioAndGenericErrorMessage(err) });
    }
}




async function update_career(req: any, res: Response): Promise<void> {
    try {
        const career = await Career.findOneByOrFail({ _id: req.params.id });
        await career.updateCareer(req.body);
        res.status(200).send({ code: 200, message: "resources updated successfully", result: career });
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
async function delete_career(req: any, res: Response): Promise<void> {

    const career = await Career.findOneByOrFail({ _id: req.params.id });
    await career.remove();
    res.status(200).send({ code: 200, message: "job posting removed successfully" }); // INFO does the profile needs to return token
}


export default {
    addCareer,
    get_careers,
    get_career_by_id,
    update_career,
    delete_career
}
