import { Request, Response } from 'express';
import FAQ from '../../entities/cms/faq';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import { throwTwilioAndGenericErrorMessage, throwTypeOrmEntityFieldError, throwTypeOrmEntityNotFoundErrorMessage, throwTypeOrmQueryFailedErrorMessage } from '../../utils/error';
import { ValidationError } from 'class-validator';






async function addFaq(req: Request, res: Response): Promise<void> {
    try {
        const faq = await FAQ.createFAQ(req.body);
        res.status(201).send({ code: 201, message: 'New FAQ added succesfully', result: faq });
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
async function get_faqs(req: any, res: Response): Promise<void> {
    try {
        const policies = await FAQ.find();
        res.status(200).send({ code: 200, message: "service retrive successfully", result: policies });
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
async function get_faq_by_id(req: any, res: Response): Promise<void> {
    try {
        const faq = await FAQ.findOneByOrFail({ _id: req.params.id });
        res.status(200).send({ code: 200, message: "policy retrive successfully", result: faq });
    } catch (err) {
        if (err instanceof EntityNotFoundError) {
            const errMsg = throwTypeOrmEntityNotFoundErrorMessage(err);
            res.status(400).send({ code: 400, error: errMsg });
        }
        else res.status(400).send({ code: 400, error: throwTwilioAndGenericErrorMessage(err) });
    }
}




async function update_faq(req: any, res: Response): Promise<void> {
    try {
        let faq:any = await FAQ.findOneBy({ _id: req.params.id });
        if (!faq) throw new Error("FAQ not found");
        faq = await faq.updateFAQ(req.body);
        res.status(200).send({ code: 200, message: "resources updated successfully", result: faq });
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
async function delete_faq(req: any, res: Response): Promise<void> {

    const faq = await FAQ.findOneBy({ _id: req.params.id });
    await faq.remove();
    res.status(200).send({ code: 200, message: "policy member removed successfully" }); // INFO does the profile needs to return token
}


export default {
    addFaq,
    get_faqs,
    get_faq_by_id,
    update_faq,
    delete_faq
}
