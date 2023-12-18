import { Request, Response } from 'express';
import Service from '../entities/service';
import Subservice from '../entities/subservice';
import Pricetier from '../entities/pricetier';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import { throwTwilioAndGenericErrorMessage, throwTypeOrmEntityFieldError, throwTypeOrmEntityNotFoundErrorMessage, throwTypeOrmQueryFailedErrorMessage } from '../utils/error';
import { ValidationError } from 'class-validator';






/**
 * @description - Add a new service
 * @param {Request} req - request object from the request body
 * @param {Response} res - response object to send a response back to the client
 * @example - localhost:3000/api/v1/addservice
 * @example - request body - {}
 * }
 * @returns {object} - returns an object with customer verification details
 */
async function addService(req: Request, res: Response): Promise<void> {
    try {
        //console.log('service', req.file.path);
        console.log('file', req.file);
        console.log('files', req.files);

        const service = await Service.createService(req);
        res.status(201).send({ code: 201, message: 'New Service created succesfully', data: service});
    } catch (err) {
        res.status(400).send({ code: 400, error: err.message }); 
        // if (err instanceof QueryFailedError) {
        //     const errMsg = throwTypeOrmQueryFailedErrorMessage(err);
        //     res.status(400).send({ code: 400, error: errMsg });
        // }
        // else if (err[0] instanceof ValidationError) {
        //     const errMsg = throwTypeOrmEntityFieldError(err);
        //     res.status(400).send({ code: 400, error: errMsg });
        // }
        // else res.status(400).send({ code: 400, error: throwTwilioAndGenericErrorMessage(err) });
    }
}



async function addSubservice(req: Request, res: Response): Promise<void> {
    try {
        console.log('service', req.body);
        const service = await Subservice.createSubservice(req);
        res.status(201).send({ code: 201, message: 'New SubService created succesfully', data: service });
    } catch (err) {
        res.status(400).send({ code: 400, error: err.message }); 

        // if (err instanceof QueryFailedError) {
        //     const errMsg = throwTypeOrmQueryFailedErrorMessage(err);
        //     res.status(400).send({ code: 400, error: errMsg });
        // }
        // else if (err[0] instanceof ValidationError) {
        //     const errMsg = throwTypeOrmEntityFieldError(err);
        //     res.status(400).send({ code: 400, error: errMsg });
        // }
        // else res.status(400).send({ code: 400, error: throwTwilioAndGenericErrorMessage(err) });
    }
}





async function addPricetier(req: Request, res: Response): Promise<void> {
    try {
        const pricetier = await Pricetier.createPricetier(req.body);
        res.status(201).send({ code: 201, message: 'New Pricetier created succesfully', data: pricetier });
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
async function get_service_by_id(req: any, res: Response): Promise<void> {
    try {
        const service = await Service.findOneBy({ _id: req.params.id });
        if (!service) throw new Error('Service not found');
        res.status(200).send({ code: 200, message: "service retrive successfully", result: service });
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
async function get_subservice_by_id(req: any, res: Response): Promise<void> {
    try {
        const service = await Subservice.findOneBy({ _id: req.params.id as string });
        if (!service) throw new Error('Subservice not found');
        res.status(200).send({ code: 200, message: "sub service retrive successfully", result: service });
    } catch (err) {
        res.status(400).send({ code: 400, error: err.message });
    }
}


async function get_pricetier_by_id(req: any, res: Response): Promise<void> {
    try {
        const pricetier = await Pricetier.findOneBy({ _id: req.params.id });
        if (!pricetier) throw new Error('Pricetier not found');
        res.status(200).send({ code: 200, message: "pricetier retrive successfully", result: pricetier });
    } catch (err) {
        res.status(400).send({ code: 400, error: err.message });
        // if (err instanceof EntityNotFoundError) {
        //     const errMsg = throwTypeOrmEntityNotFoundErrorMessage(err);
        //     res.status(400).send({ code: 400, error: errMsg });
        // }
        // else res.status(400).send({ code: 400, error: throwTwilioAndGenericErrorMessage(err) });
    }
}

/**
 * @description search for a service by id or email
 * @param {object} req - request object sent from the client
 * @param {object} res - response object sent to the client
 */
async function get_services(req: any, res: Response): Promise<void> {
    try {
        const service = await Service.find({});
        res.status(200).send({ code: 200, message: "service retrive successfully", result: service });
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
async function get_subservices(req: any, res: Response): Promise<void> {
    try {
        const service = await Subservice.find({});
        res.status(200).send({ code: 200, message: "service retrive successfully", result: service });
    } catch (err) {
        res.status(400).send({ code: 400, error: err.message });
    }
}



async function get_pricetiers(req: any, res: Response): Promise<void> {
    try {
        const pricetier = await Pricetier.find({});
        res.status(200).send({ code: 200, message: "pricetier retrive successfully", result: pricetier });
    } catch (err) {
        res.status(400).send({ code: 400, error: err.message });
        // if (err instanceof EntityNotFoundError) {
        //     const errMsg = throwTypeOrmEntityNotFoundErrorMessage(err);
        //     res.status(400).send({ code: 400, error: errMsg });
        // }
        // else res.status(400).send({ code: 400, error: throwTwilioAndGenericErrorMessage(err) });
    }
}

/**
 * @description - update customer data
 * @param {object} req - request object sent from the client
 * @param {object} res - response object sent to the client
 */
async function update_service(req: any, res: Response): Promise<void> {
    try {
        let service: any = await Service.findOneBy({ _id: req.params.id });
        if (!service) throw new Error('Service not found');
        const service_update = await service.updateService(req);
        res.status(200).send({ code: 200, message: "resources updated successfully", result: service_update});
    } catch (err) {
        res.status(400).send({ code: 400, error: (err as Error).message });
    }
}

async function update_subservice(req: any, res: Response): Promise<void> {
    try {
        let subservice: any = await Subservice.findOneBy({ _id: req.params.id });
        if (!subservice) throw new Error('Subservice not found');
        subservice = await subservice.updateSubservice(req);
        res.status(200).send({ code: 200, message: "resources updated successfully", result: subservice});
    } catch (err) {
        res.status(400).send({ code: 400, error: (err as Error).message });
    }
}


async function update_pricetier(req: any, res: Response): Promise<void> {
    try {
        let pricetier: any = await Pricetier.findOneBy({ _id: req.params.id });
        if (!pricetier) throw new Error('Pricetier not found');
        pricetier = await pricetier.updatePricetier(req.body);
        res.status(200).send({ code: 200, message: "resources updated successfully", result: pricetier });
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
async function delete_service(req: any, res: Response): Promise<void> {
    try {
        const service = await Service.findOneBy({ _id: req.params.id });
        if (!service) throw new Error('Service not found')
        await service.remove();
        res.status(200).send({ code: 200, message: "service removed successfully" }); // INFO does the profile needs to return token
    } catch (error) {
        res.status(400).send({ code: 400, error: error.message });
    }
   
}


async function delete_subservice(req: any, res: Response): Promise<void> {
    try {
        const subservice = await Subservice.findOneBy({ _id: req.params.id });
        if (!subservice) throw new Error('Subservice not found')
        await subservice.remove();
        res.status(200).send({ code: 200, message: "subservice removed successfully" }); // INFO does the profile needs to return token
    } catch (error) {
        res.status(400).send({ code: 400, error: error.message });
    }
}


async function delete_pricetier(req: any, res: Response): Promise<void> {
    try {
        const pricetier = await Pricetier.findOneBy({ _id: req.params.id });
        if (!pricetier) throw new Error('Pricetier not found')
        await pricetier.remove();
        res.status(200).send({ code: 200, message: "pricetier removed successfully" }); // INFO does the profile needs to return token
    } catch (error) {
        res.status(400).send({ code: 400, error: error.message });
    }
}



export { addService };
export { update_service };
export { get_service_by_id };
export { get_services };
export { delete_service };
export { addSubservice };
export { update_subservice };
export { get_subservice_by_id };
export { get_subservices };
export { delete_subservice };
export { addPricetier };
export { update_pricetier };
export { get_pricetier_by_id };
export { get_pricetiers };
export { delete_pricetier };

