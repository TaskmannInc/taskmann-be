import { Request, Response } from 'express';
import Team from '../../entities/cms/team';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import { throwTwilioAndGenericErrorMessage, throwTypeOrmEntityFieldError, throwTypeOrmEntityNotFoundErrorMessage, throwTypeOrmQueryFailedErrorMessage } from '../../utils/error';
import { ValidationError } from 'class-validator';






async function addTeam(req: Request, res: Response): Promise<void> {
    try {
        const team = await Team.createTeam(req);
        res.status(201).send({ code: 201, message: 'New Team Member add succesfully', result: team });
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
async function get_teams(req: any, res: Response): Promise<void> {
    try {
        const teams = await Team.findBy({ _id: req.params.id });
        res.status(200).send({ code: 200, message: "service retrive successfully", result: teams });
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
async function get_team_by_id(req: any, res: Response): Promise<void> {
    try {
        const team = await Team.findOneBy({ _id: req.params.id });
        if (!team) throw new Error("team not found");
        res.status(200).send({ code: 200, message: "team retrive successfully", result: team });
    } catch (err) {
        if (err instanceof EntityNotFoundError) {
            const errMsg = throwTypeOrmEntityNotFoundErrorMessage(err);
            res.status(400).send({ code: 400, error: errMsg });
        }
        else res.status(400).send({ code: 400, error: throwTwilioAndGenericErrorMessage(err) });
    }
}



async function update_team(req: any, res: Response): Promise<void> {
    try {
        const team = await Team.findOneBy({ _id: req.params.id });
        if (!team) throw new Error("team not found");
        await team.updateTeam(req);
        res.status(200).send({ code: 200, message: "resources updated successfully", result: team });
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
async function delete_team(req: any, res: Response): Promise<void> {

    const team = await Team.findOneBy({ _id: req.params.id });
    if (!team) throw new Error("team not found");
    await team.remove();
    res.status(200).send({ code: 200, message: "team member removed successfully" }); // INFO does the profile needs to return token
}


export default {
    addTeam,
    get_teams,
    get_team_by_id,
    update_team,
    delete_team
}
