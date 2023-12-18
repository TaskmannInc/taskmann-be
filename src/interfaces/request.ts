import { Request } from 'express';



/**
 * @description = extends the request interface for admins to add the admin object and token
 */
interface ICustomerRequest extends Request {
    customer: any,
    token: any
}


/**
 * @description = extends the request interface for admins to add the admin object and token
 */
interface IStaffRequest extends Request {
    staff: any,
    token: any,
    roles: any
}

export { ICustomerRequest, IStaffRequest };