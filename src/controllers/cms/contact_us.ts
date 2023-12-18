import { Request, Response } from 'express';
import Contact from '../../entities/cms/contact_us';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import { throwTwilioAndGenericErrorMessage, throwTypeOrmEntityFieldError, throwTypeOrmEntityNotFoundErrorMessage, throwTypeOrmQueryFailedErrorMessage } from '../../utils/error';
import { ValidationError } from 'class-validator';






async function addContact(req: Request, res: Response): Promise<void> {
    try {
        const contact = await Contact.createContact(req.body);
        res.status(201).send({ code: 201, message: 'New Job added succesfully', result: contact });
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
async function get_contacts(req: any, res: Response): Promise<void> {
    try {
        const contacts = await Contact.find();
        res.status(200).send({ code: 200, message: "service retrive successfully", result: contacts });
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
async function get_contact_by_id(req: any, res: Response): Promise<void> {
    try {
        const contact = await Contact.findOneBy({ _id: req.params.id });
        if (!contact) throw new Error("contact not found");
        
        res.status(200).send({ code: 200, message: "contact retrive successfully", result: contact });
    } catch (err) {
        if (err instanceof EntityNotFoundError) {
            const errMsg = throwTypeOrmEntityNotFoundErrorMessage(err);
            res.status(400).send({ code: 400, error: errMsg });
        }
        else res.status(400).send({ code: 400, error: throwTwilioAndGenericErrorMessage(err) });
    }
}




async function update_contact(req: any, res: Response): Promise<void> {
    try {
        const contact = await Contact.findOneBy({ _id: req.params.id });
        if (!contact) throw new Error("contact not found");
        await contact.updateContact(req.body);
        res.status(200).send({ code: 200, message: "resources updated successfully", result: contact });
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
async function delete_contact(req: any, res: Response): Promise<void> {

    const contact = await Contact.findOneBy({ _id: req.params.id });
    if (!contact) throw new Error("contact not found");
    await contact.remove();
    res.status(200).send({ code: 200, message: "removed successfully" }); // INFO does the profile needs to return token
}


export default {
    addContact,
    get_contacts,
    get_contact_by_id,
    update_contact,
    delete_contact
}
