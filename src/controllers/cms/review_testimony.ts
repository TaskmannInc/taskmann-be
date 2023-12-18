import { Request, Response } from 'express';
import ReviewTestimony from '../../entities/cms/review_testimony';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import { throwTwilioAndGenericErrorMessage, throwTypeOrmEntityFieldError, throwTypeOrmEntityNotFoundErrorMessage, throwTypeOrmQueryFailedErrorMessage } from '../../utils/error';
import { ValidationError } from 'class-validator';






async function addReviewTestimony(req: Request, res: Response): Promise<void> {
    try {
        const reviewtestimony = await ReviewTestimony.createTestimonyReview(req.body);
        res.status(201).send({ code: 201, message: 'New Review/Testimony add succesfully', result: reviewtestimony });
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
async function get_reviews_testimonies(req: any, res: Response): Promise<void> {
    try {
        const review_testimony = await ReviewTestimony.find();
        res.status(200).send({ code: 200, message: "reviews/testimonies retrive successfully", result: review_testimony });
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
async function get_review_testimony_by_id(req: any, res: Response): Promise<void> {
    try {
        const review_testimony = await ReviewTestimony.findOneByOrFail({ _id: req.params.id });
        res.status(200).send({ code: 200, message: "policy retrive successfully", result: review_testimony });
    } catch (err) {
        if (err instanceof EntityNotFoundError) {
            const errMsg = throwTypeOrmEntityNotFoundErrorMessage(err);
            res.status(400).send({ code: 400, error: errMsg });
        }
        else res.status(400).send({ code: 400, error: throwTwilioAndGenericErrorMessage(err) });
    }
}




async function update_review_testimony(req: any, res: Response): Promise<void> {
    try {
        const review_testimony = await ReviewTestimony.findOneByOrFail({ _id: req.params.id });
        await review_testimony.updateReviewTestimony(req.body);
        res.status(200).send({ code: 200, message: "resources updated successfully", result: review_testimony });
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
async function delete_review_testimony(req: any, res: Response): Promise<void> {

    const review_testimony = await ReviewTestimony.findOneByOrFail({ _id: req.params.id });
    await review_testimony.remove();
    res.status(200).send({ code: 200, message: "review or testimoney removed successfully" }); // INFO does the profile needs to return token
}


export default {
    addReviewTestimony,
    get_reviews_testimonies,
    get_review_testimony_by_id,
    update_review_testimony,
    delete_review_testimony
}
