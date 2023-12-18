import jwt from 'jsonwebtoken';
import Customer from '../entities/customer';
import { Response, NextFunction } from 'express';
import { JwtPayload } from "../interfaces/jwtpayload";
import { ICustomerRequest } from "../interfaces/request";

/**
 * @description = autorization middleware to verify the user as system customer
 * @param {*} req 
 * @param {*} res 
 * @param {*} next - calls the next action in the middleware chain
 */
const auth = async (req: ICustomerRequest, res: Response, next: NextFunction) => {
    try {
        const authorizationHeader = req.header("Authorization");
        if (!authorizationHeader) {
            throw new Error("please provide authentication");
        }
        const token = req.header("Authorization")!.replace("Bearer ", "");
        const decoded = jwt.verify(token, process.env.SET_JWT_SECRET!) as JwtPayload;
        if (!decoded) {
            throw new Error("Invalid token");
        }
        //const user = await User.findOneBy({_id: decoded._id, "tokens.token": token,});
        // const user = await User.find({ where: { _id: decoded._id, tokens: { token: token } } });
        const customer = await Customer.findOne({ where: { _id: decoded._id } });
        if (!customer) {
            throw new Error('please provide customer authorization');
        }
        const tokens = customer!.tokens;
        const tokenExists = tokens.find((t) => t.token === token);
        if (!tokenExists) {
            throw new Error('token does not exist or user forcedly logged out');
        }
        req.token = token;
        req.customer = customer;
        next();
    } catch (error) {
        res.status(401).send({ code: 401, error: error.message });
        // res.status(401).send({ code: 401, error: "please provide authentication" });
    }
};
export default auth;