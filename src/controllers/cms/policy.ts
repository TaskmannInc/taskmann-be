import { Request, Response } from 'express';
import Policy from '../../entities/cms/policy';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import { throwTwilioAndGenericErrorMessage, throwTypeOrmEntityFieldError, throwTypeOrmEntityNotFoundErrorMessage, throwTypeOrmQueryFailedErrorMessage } from '../../utils/error';
import { ValidationError } from 'class-validator';






async function addPolicy(req: Request, res: Response): Promise<void> {
    try {
        const policy = await Policy.createPolicy(req.body);
        res.status(201).send({ code: 201, message: 'New Policy Member add succesfully', result: policy });
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
async function get_policies(req: any, res: Response): Promise<void> {
    try {
        const policies = await Policy.find({});
        res.status(200).send({ code: 200, message: "policies retrive successfully", result: policies });
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
async function get_policy_by_id(req: any, res: Response): Promise<void> {
    try {
        const policy = await Policy.findOneBy({ _id: req.params.id });
        if (!policy) throw new Error("policy not found");
        res.status(200).send({ code: 200, message: "policies retrive successfully", result: policy });
    } catch (err) {
        if (err instanceof EntityNotFoundError) {
            const errMsg = throwTypeOrmEntityNotFoundErrorMessage(err);
            res.status(400).send({ code: 400, error: errMsg });
        }
        else res.status(400).send({ code: 400, error: throwTwilioAndGenericErrorMessage(err) });
    }
}




async function update_policy(req: any, res: Response): Promise<void> {
    try {
        const policy = await Policy.findOneBy({ _id: req.params.id });
        if (!policy) throw new Error("policy not found");
        await policy.updatePolicy(req.body);
        res.status(200).send({ code: 200, message: "resources updated successfully", result: policy });
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
async function delete_policy(req: any, res: Response): Promise<void> {

    const policy = await Policy.findOneBy({ _id: req.params.id });
    if (!policy) throw new Error("policy not found");
    await policy.remove();
    res.status(200).send({ code: 200, message: "policy removed successfully" }); // INFO does the profile needs to return token
}


export default {
    addPolicy,
    get_policies,
    get_policy_by_id,
    update_policy,
    delete_policy
}
