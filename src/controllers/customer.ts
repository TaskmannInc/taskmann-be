import { Request, Response } from "express";
import { ICustomerRequest } from "../interfaces/request";
import Customer from "../entities/customer";
import Customerverification from "../entities/customerVerification";
import TwilioService from "../services/sms";
import UtilSever from "../utils/util";
import { throwTwilioAndGenericErrorMessage, throwTypeOrmEntityFieldError, throwTypeOrmEntityNotFoundErrorMessage, throwTypeOrmQueryFailedErrorMessage } from "../utils/error";
import { EntityNotFoundError, Equal, QueryFailedError } from "typeorm";
import { ValidationError } from "class-validator";


/**
 * @description - Register a new customer
 * @param {Request} req - request object from the request body
 * @param {Response} res - response object to send a response back to the client
 * @example - localhost:3000/api/v1/register_user
 * @example - request body - {}
 * }
 * @returns {object} - returns an object with customer verification details
 */
async function register_customer(req: Request, res: Response): Promise<void> {
    try {
        const token = await Customer.createCustomer(req.body);
        // const token = await user.registrationprocessing(); //NOTE call this method off the user entity instead of using beforeinsert hook
        // await customer.save();
        res.status(201).send({ code: 201, message: 'registration successful. verification token sent' });
    } catch (err) {
        console.log('eroror', err);
        // console.log('errr22', err,  err[0].constraints, err[0] instanceof ValidationError, err instanceof QueryFailedError);
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
 * @description verify customer registration email
 * @param {Request} req - request object
 * @param {Response} res - response object to send a response back to the client
 */
async function verify_email(req: Request, res: Response): Promise<void> {
    try {
        const customerverify = await Customerverification.verifyemail(req.query.code as string);

        const sattus = await Customer.verifyEmail(customerverify.customer._id, "verify_email"); // FIXME check if this method accepting 2nd arguments is still useful
        res.status(200).send({ code: 200, message: 'email verification successful' });
    } catch (err) {
        res.status(400).send({ code: 400, error: err.message });  // as error to infer the err
    }
}


/**
 * @description verify customer registration phone
 * @param {Request} req - request object
 * @param {Response} res - response object to send a response back to the client
 */
async function verify_phone(req: Request, res: Response): Promise<void> {
    try {
        await Customerverification.verifyphone(req.body.phone as string, req.body.code as string);
        const customer = await Customer.findOneByOrFail({ phone: req.body.phone as string });
        const data = await Customer.verifyPhone(customer!._id, "verify_phone"); // FIXME check if this method accepting 2nd arguments is still useful
        res.status(200).send({ code: 200, message: 'phone verification successful' });
    } catch (err) {
        if (err instanceof EntityNotFoundError) {
            const errMsg = throwTypeOrmEntityNotFoundErrorMessage(err);
            res.status(400).send({ code: 400, error: errMsg });
        }
        else res.status(400).send({ code: 400, error: throwTwilioAndGenericErrorMessage(err) });  // as error to infer the err
    }
}


/**
 * @description - Login a customer into the system
 * @param {*} req request object sent from the client/customer
 * @param {*} res - response object sent to the client/customer
 */
async function login_customer(req: Request, res: Response): Promise<void> {
    try {
        const customer = await Customer.findByCredentials(
            req.body.email,
            req.body.password
        );
        const token = await customer.generateAuthtoken();
        res.status(200).send({ code: 200, message: "login succesful", result: token });
    } catch (err) {
        res.status(401).send({ code: 401, error: (err as Error).message });
    }
}


/**
 * @description search for a customer by id or email
 * @param {object} req - request object sent from the client
 * @param {object} res - response object sent to the client
 */
async function get_customer_by_id(req: ICustomerRequest, res: Response): Promise<void> {
    try {
        const customer = await Customer.findOneBy({ _id: req.params.id });
        if (!customer) throw new Error("customer not found");
        delete customer.password;
        res.status(200).send({ code: 200, message: "customer retrive successfully", result: customer });
    } catch (err) {
        if (err instanceof EntityNotFoundError) {
            const errMsg = throwTypeOrmEntityNotFoundErrorMessage(err);
            res.status(400).send({ code: 400, error: errMsg });
        }
        else res.status(400).send({ code: 400, error: throwTwilioAndGenericErrorMessage(err) });
    }
}



/**
 * @description search for a customer by id or email
 * @param {object} req - request object sent from the client
 * @param {object} res - response object sent to the client
 */
async function get_customers(req: ICustomerRequest, res: Response): Promise<void> {
    try {
        console.log('reached here now');
        const customer = await Customer.find({});
        if (!customer) throw new Error("error fetching customers");
        res.status(200).send({ code: 200, message: "customer retrive successfully", result: customer });
    } catch (err) {
        if (err instanceof EntityNotFoundError) {
            const errMsg = throwTypeOrmEntityNotFoundErrorMessage(err);
            res.status(400).send({ code: 400, error: errMsg });
        }
        else res.status(400).send({ code: 400, error: throwTwilioAndGenericErrorMessage(err) });
    }
}




/**
 * @description - update customer data
 * @param {object} req - request object sent from the client
 * @param {object} res - response object sent to the client
 */
async function update_customer(req: ICustomerRequest, res: Response): Promise<void> {
    try {
        const customer = await Customer.updatecustomer(req)
        res.status(200).send({ code: 200, message: "resources updated successfully", result: customer });
    } catch (err) {
        res.status(400).send({ code: 400, error: (err as Error).message });
    }
}


/**
 * 
 * @param req 
 * @param res 
 */
async function add_profile_image(req: ICustomerRequest, res: Response): Promise<void> {
    try {
        console.log('req.file', req.file);
        console.log("req file path", req.file.path);
        console.log('form', req.body.description)
        const customer = await Customer.addProfileImage(req, req.customer._id);
        res.status(200).send({ code: 200, message: 'Profile image uploaded Successfully', result: customer });
    } catch (err) {
        console.log("data", err, req)
        res.status(400).send({ code: 400, error: (err as Error).message });
    }
}
/**
 * @description - endpoints for customer to initiate a password reset process
 * @param {object} req - request object sent from the client
 * @param {object} res - response object sent to the client
 */
async function forgotpassword(req: Request, res: Response): Promise<void> {
    try {
        const token = req.body.phone ? await Customer.forgotpasswordSMS(req.body.phone) : await Customer.forgotpassword(req.body.email);
        res.status(201).send({ code: 204, status: "Password reset code on it way, check device", result: token });
    }
    catch (err) {
        res.status(400).send({ code: 400, error: (err as Error).message });
    }
}


/**
 * @description - reset customer password from the reset password link sent to the customer's email
 * @param {object} req - request object sent from the client 
 * @param {object} res - response object sent to the client
 */
async function resetpassword(req: Request, res: Response): Promise<void> {
    try {
        await Customer.resetpassword(String(req.query.token), req.body.password);
        res.status(200).send({ code: 200, message: "Password reset successfully" });
    }
    catch (err) {
        res.status(400).send({ code: 400, error: (err as Error).message });
    }
}


/**
 * @description - return the profile of currently logged in user through the request object
 * @param {*} req - request object sent from the client/user
 * @param {*} res - response object sent to the client/user
 * @returns {object} - returns a user object
 */
async function customer(req: ICustomerRequest, res: Response): Promise<void> {

    res.status(200).send({ code: 200, message: "customer profile returned successfully", result: { user: req.customer, token: req.token } }); // INFO does the profile needs to return token
}

/**
 * @description - endpoints for user to initiate a password reset process
 * @param {object} req - request object sent from the client/user, it contains all user informations
 * @param {object} res - response object sent to the client/user
 * @returns {object} - returns a user object
 */
async function changepassword(req: ICustomerRequest, res: Response): Promise<void> {
    try {
        const customer = await Customer.findOneBy({ _id: req.customer._id });
        if (!customer) throw new Error("Customer not found");
        if (customer) {
            await customer.changepassword!(req, req.body.currentpassword, req.body.newpassword);
            //TODO send sms notification to the customer
            res.status(201).send({ code: 201, message: "Password changed successfully" });
        }
    }
    catch (err) {
        res.status(400).send({ code: 400, error: (err as Error).message });
        // if (err instanceof EntityNotFoundError) {
        //     const errMsg = throwTypeOrmEntityNotFoundErrorMessage(err);
        //     res.status(401).send({ code: 401, error: errMsg });
        // }
        // else res.status(400).send({ code: 400, error: throwTwilioAndGenericErrorMessage(err) });
    }
}


/**
 * @description - resend verification token to user phone
 * @param req - request object sent from the client/user
 * @param res - response object sent to the client/user
 */
async function send_verification_code(req: Request, res: Response): Promise<void> {
    try {
        const customer = await Customer.findOneBy({ email: Equal(req.body.email) });
        if (!customer) throw new Error("user not found");
        //console.log("customer", customer);
        const token = await customer.generateCode();
        res.status(200).send({ code: 200, message: "phone verification code sent", result: token });
    } catch (err) {
        // if (err instanceof EntityNotFoundError) {
        //     const errMsg = throwTypeOrmEntityNotFoundErrorMessage(err);
        //     res.status(401).send({ code: 401, error: errMsg });
        // }
        // else res.status(400).send({ code: 400, error: throwTwilioAndGenericErrorMessage(err) });
        res.status(400).send({ code: 400, error: (err as Error).message });
    }
}

/**
 * @description - resend v
 * @param req - request object sent from the client/user that should contain the customer phone
 * @param res 
 */
async function sms_verification_token(req: Request, res: Response): Promise<void> {
    try {
        const ts = new TwilioService();
        const code = new UtilSever().generateToken(6);
        const status = await ts.sendSMS(req.body.phone as string, String(code));
        res.status(201).send({ code: 201, message: "phone verification code sent" });
    } catch (err) {
        //TODO add error handling here
        res.status(400).send({ code: 400, error: (err as Error).message });
    }
}


/**
 * @description logout this particular device from the system
 * @param {object} req - request object sent from the client/user
 * @param {object} res - response object sent to the client/user
 */
async function logout_customer(req: ICustomerRequest, res: Response): Promise<void> {
    try {
        req.customer.tokens = await Customer.logoutcustomer(req, false) // TODO check why this method wont accept only one argument
        res.status(200).send({ "message": "customer logged out successfully" });
    }
    catch (err) {
        res.status(400).send({ "error": (err as Error).message });
    }
}


/**
 * @description - logout all devices used by the guest from the system
 * @param {object} req - request object sent from the client/guest 
 * @param {object} res - response object sent to the client/guest
 */
async function logout_all_guest_device(req: ICustomerRequest, res: Response): Promise<void> {
    try {
        req.customer.tokens = await Customer.logoutcustomer(req, true);
        res.status(200).send({ code: 200, message: "Customer Successfully Logged Out from all devices" });
    } catch (err) {
        console.log(err);
        res.status(400).send({ code: 400, error: (err as Error).message });
    }
}



export { register_customer };
export { verify_email };
export { verify_phone };
export { login_customer };
export { get_customer_by_id };
export { get_customers };
export { update_customer };
export { forgotpassword };
export { resetpassword };
export { customer }
export { send_verification_code };
export { changepassword };
export { sms_verification_token }
export { add_profile_image }
export { logout_customer }
export { logout_all_guest_device }
