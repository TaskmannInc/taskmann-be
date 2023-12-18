import { Request, Response } from "express";
import { IStaffRequest } from "../interfaces/request";
import Staff from "../entities/staff";
import Staffverification from "../entities/staffVerification";
import TwilioService from "../services/sms";
import UtilSever from "../utils/util";
import { throwTwilioAndGenericErrorMessage, throwTypeOrmEntityFieldError, throwTypeOrmEntityNotFoundErrorMessage, throwTypeOrmQueryFailedErrorMessage } from "../utils/error";
import { EntityNotFoundError, QueryFailedError } from "typeorm";
import { ValidationError } from "class-validator";


/**
 * @description - Register a new user
 * @param {Request} req - request object from the request body
 * @param {Response} res - response object to send a response back to the client
 * @example - localhost:3000/api/v1/register_user
 * @example - request body - {}
 * 
 * @returns {object} - returns an object with staff verification details
 */
async function register_staff(req: Request, res: Response): Promise<void> {
    try {
        const token = await Staff.createStaff(req.body);
        // const token = await user.registrationprocessing(); //NOTE call this method off the user entity instead of using beforeinsert hook
        // await staff.save();
        res.status(201).send({ code: 201, message: 'registration successful. verification token sent', token });
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
 * @description verify staff registration email
 * @param {Request} req - request object
 * @param {Response} res - response object to send a response back to the client
 */
async function verify_email(req: Request, res: Response): Promise<void> {
    try {
        const emailverify = await Staffverification.verifyemail(req.query.code as string);
        await Staff.verifyEmail(emailverify.staff._id, "verify_email"); // FIXME check if this method accepting 2nd arguments is still useful
        res.status(200).send({ code: 200, message: 'email verification successful' });
    } catch (err) {
        res.status(400).send({ code: 400, error: err.message });  // as error to infer the err
    }
}


/**
 * @description verify staff registration phone
 * @param {Request} req - request object
 * @param {Response} res - response object to send a response back to the client
 */
async function verify_phone(req: Request, res: Response): Promise<void> {
    try {
        await Staffverification.verifyphone(req.body.phone as string, req.body.code as string);
        const staff = await Staff.findOneByOrFail({ phone: req.body.phone as string });
        const data = await Staff.verifyPhone(staff!._id, "verify_phone"); // FIXME check if this method accepting 2nd arguments is still useful
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
 * @description - Login a staff into the system
 * @param {*} req request object sent from the client/staff
 * @param {*} res - response object sent to the client/staff
 */
async function login_staff(req: Request, res: Response): Promise<void> {
    try {
        const staff = await Staff.findByCredentials(
            req.body.email,
            req.body.password
        );
        if (staff.active !== true) {
            throw new Error("Inactive account");
        }
        const token = await staff.generateAuthtoken();
        res.status(200).send({ code: 200, message: "login succesful", result: token });
    } catch (err) {
        res.status(401).send({ code: 401, error: (err as Error).message });
    }
}


/**
 * @description search for a staff by id or email
 * @param {object} req - request object sent from the client
 * @param {object} res - response object sent to the client
 */
async function get_staff_by_id(req: IStaffRequest, res: Response): Promise<void> {
    try {
        const staff = await Staff.findOneBy({ _id: req.params.id });
        if (!staff) throw new Error("staff not found");
        delete staff.password;
        res.status(200).send({ code: 200, message: "staff retrive successfully", result: staff });
    } catch (err) {
        if (err instanceof EntityNotFoundError) {
            const errMsg = throwTypeOrmEntityNotFoundErrorMessage(err);
            res.status(400).send({ code: 400, error: errMsg });
        }
        else res.status(400).send({ code: 400, error: throwTwilioAndGenericErrorMessage(err) });
    }
}


/**
 * @description search for a staff by id or email
 * @param {object} req - request object sent from the client
 * @param {object} res - response object sent to the client
 */
async function get_staffs(req: IStaffRequest, res: Response): Promise<void> {
    try {
        const staff = await Staff.find({});
        if (!staff) throw new Error("staff not found");
        res.status(200).send({ code: 200, message: "staff retrive successfully", result: staff });
    } catch (err) {
        if (err instanceof EntityNotFoundError) {
            const errMsg = throwTypeOrmEntityNotFoundErrorMessage(err);
            res.status(400).send({ code: 400, error: errMsg });
        }
        else res.status(400).send({ code: 400, error: throwTwilioAndGenericErrorMessage(err) });
    }
}



/**
 * @description - update staff data
 * @param {object} req - request object sent from the client
 * @param {object} res - response object sent to the client
 */
async function update_staff(req: IStaffRequest, res: Response): Promise<void> {
    try {
        const staff = await Staff.updatestaff(req)
        res.status(200).send({ code: 200, message: "resources updated successfully", result: staff });
    } catch (err) {
        res.status(400).send({ code: 400, error: (err as Error).message });
    }
}


/**
 * @description - update staff data
 * @param {object} req - request object sent from the client
 * @param {object} res - response object sent to the client
 */
async function update_staff_role(req: IStaffRequest, res: Response): Promise<void> {
    try {
        const staff = await Staff.updatestaffrole(req, req.body)
        if (staff) res.status(200).send({ code: 200, message: "staff role updated successfully", result: staff });
        // res.status(200).send({ code: 200, message: "resources updated successfully", result: staff });
    } catch (err) {
        res.status(400).send({ code: 400, error: (err as Error).message });
    }
}


/**
 * 
 * @param req 
 * @param res 
 */
async function add_profile_image(req: IStaffRequest, res: Response): Promise<void> {
    try {
        //console.log('req.file', req.file);
        //console.log("req file path", req.file.path);
        //console.log('form', req.body.description)
        const staff = await Staff.addProfileImage(req, req.staff._id);
        res.status(200).send({ code: 200, message: 'Profile image uploaded and updated to Vault Successful', result: staff });
    } catch (err) {
        console.log("data", err, req)
        res.status(400).send({ code: 400, error: (err as Error).message });
    }
}


/**
 * @description - endpoints for staff to initiate a password reset process
 * @param {object} req - request object sent from the client
 * @param {object} res - response object sent to the client
 */
async function forgotpassword(req: Request, res: Response): Promise<void> {
    try {
        const token = req.body.phone ? await Staff.forgotpasswordSMS(req.body.phone) : await Staff.forgotpassword(req.body.email);
        res.status(201).send({ code: 201, status: "Password reset code on it way, check device", result: token });
    }
    catch (err) {
        res.status(400).send({ code: 400, error: (err as Error).message });
    }
}


/**
 * @description - reset staff password from the reset password link sent to the staff's email
 * @param {object} req - request object sent from the client 
 * @param {object} res - response object sent to the client
 */
async function resetpassword(req: Request, res: Response): Promise<void> {
    try {
        //req.query.option === "email" ? console.log("email") : console.log("phone");
        // req.query.option === "email" ? await Staff.resetpassword(String(req.query.code), req.body.password) : await Staff.resetpasswordSMS(Number(req.query.code), req.body.password);
        await Staff.resetpassword(String(req.query.token), req.body.password);
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
async function staff(req: IStaffRequest, res: Response): Promise<void> {

    res.status(200).send({ code: 200, message: "staff profile returned successfully", result: { user: req.staff, token: req.token } }); // INFO does the profile needs to return token
}


/**
 * @description - endpoints for user to initiate a password reset process
 * @param {object} req - request object sent from the client/user, it contains all user informations
 * @param {object} res - response object sent to the client/user
 * @returns {object} - returns a user object
 */
async function changepassword(req: IStaffRequest, res: Response): Promise<void> {
    try {
        const staff = await Staff.findOneByOrFail({ _id: req.staff._id })!;
        if (staff) {
            await staff.changepassword!(req, req.body.currentpassword, req.body.newpassword);
            //TODO send sms notification to the staff
            res.status(200).send({ code: 200, message: "Password changed successfully" });
        }
    }
    catch (err) {
        if (err instanceof EntityNotFoundError) {
            const errMsg = throwTypeOrmEntityNotFoundErrorMessage(err);
            res.status(401).send({ code: 401, error: errMsg });
        }
        else res.status(400).send({ code: 400, error: throwTwilioAndGenericErrorMessage(err) });
    }
}



/**
 * @description - resend verification token to user phone
 * @param req - request object sent from the client/user
 * @param res - response object sent to the client/user
 */
async function send_verification_code(req: Request, res: Response): Promise<void> {
    try {
        const staff = await Staff.findOneBy({ email: req.body.email });
        if (!staff) throw new Error("User not found");
        console.log("customer", staff);
        const token = await staff.generateCode();
        res.status(201).send({ code: 201, message: "phone verification code sent", result: token });
    } catch (err) {
        if (err instanceof EntityNotFoundError) {
            const errMsg = throwTypeOrmEntityNotFoundErrorMessage(err);
            res.status(401).send({ code: 401, error: errMsg });
        }
        else res.status(400).send({ code: 400, error: throwTwilioAndGenericErrorMessage(err) });
    }
}


/**
 * @description - resend v
 * @param req - request object sent from the client/user that should contain the staff phone
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
async function logout_staff(req: IStaffRequest, res: Response): Promise<void> {
    try {
        req.staff.tokens = await Staff.logoutstaff(req, false) // TODO check why this method wont accept only one argument
        res.status(200).send({ "message": "staff logged out successfully" });
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
async function logout_all_guest_device(req: IStaffRequest, res: Response): Promise<void> {
    try {
        req.staff.tokens = await Staff.logoutstaff(req, true);
        res.status(200).send({ code: 200, message: "Staff Successfully Logged Out from all devices" });
    } catch (err) {
        console.log(err);
        res.status(400).send({ code: 400, error: (err as Error).message });
    }
}



export { register_staff };
export { verify_email };
export { verify_phone };
export { login_staff };
export { get_staff_by_id };
export { get_staffs };
export { update_staff };
export { update_staff_role };
export { forgotpassword };
export { resetpassword };
export { staff }
export { send_verification_code };
export { changepassword };
export { sms_verification_token }
export { add_profile_image }
export { logout_staff }
export { logout_all_guest_device }
