import jwt from 'jsonwebtoken';
import Staff from '../entities/staff';
import { Response, NextFunction } from 'express';
import { JwtPayload } from "../interfaces/jwtpayload";
import { IStaffRequest } from "../interfaces/request";

/**
 * @description = autorization middleware to verify the user as system staff
 * @param {*} req 
 * @param {*} res 
 * @param {*} next - calls the next action in the middleware chain
 */
const authStaff = async (req: IStaffRequest, res: Response, next: NextFunction) => {
    try {
        const authorizationHeader = req.header("Authorization");
        if (!authorizationHeader) {
            throw new Error("please provide authentication");
        }
        const token = req.header("Authorization")!.replace("Bearer ", "");
        const decoded = jwt.verify(token, process.env.SET_JWT_SECRET!) as JwtPayload;
        //const user = await User.findOneBy({_id: decoded._id, "tokens.token": token,});
        // const user = await User.find({ where: { _id: decoded._id, tokens: { token: token } } });
        const staff = await Staff.findOne({ where: { _id: decoded._id } });
        if (!staff) {
            throw new Error('please provide staff authorization');
        }
        const tokens = staff!.tokens;
        const tokenExists = tokens.find((t) => t.token === token);
        if (!tokenExists) {
            throw new Error('token does not exist or user forcedly logged out');
        }
        req.token = token;
        req.staff = staff;
        req.roles = staff.roles;
        next();
    } catch (error) {
        res.status(401).send({ code: 401, error: error.message });
        // res.status(401).send({ code: 401, error: "please provide authentication" });
    }
};

export default authStaff;