import jwt from 'jsonwebtoken';
import Staff from '../entities/staff';
import { Response, NextFunction } from 'express';
import { JwtPayload } from "../interfaces/jwtpayload";
import { IStaffRequest } from "../interfaces/request";
import { Any, In, Raw } from 'typeorm';
import { Console } from 'console';

/**
 * @description = autorization middleware to verify the user as system admin or manager
 * @param {*} req 
 * @param {*} res 
 * @param {*} next - calls the next action in the middleware chain
 */
const auth = async (req: IStaffRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.header("Authorization")) {
            throw new Error("please provide authentication");
        }
        const token = req.header("Authorization")!.replace("Bearer ", "");
        const decoded = jwt.verify(token, process.env.SET_JWT_SECRET!) as JwtPayload;
        if (!decoded) {
            throw new Error("Invalid token");
        }
        //const user = await User.findOneBy({_id: decoded._id, "tokens.token": token,});
        // const user = await User.find({ where: { _id: decoded._id, tokens: { token: token } } });
        // const staff = await Staff.findOneOrFail({ where: { _id: decoded._id, roles: In(['ADMIN']) } });
        // find a staff who has both 'ADMIN' and 'MANAGER' roles
        // const staff = await Staff.findOneOrFail({
        //     where: {
        //         _id: decoded._id,
        //         roles: Raw((columnAlias) => `${columnAlias} @> '{ADMIN, MANAGER}'`),
        //     },
        // });
        const staff = await Staff.findOne({
            where: {
                _id: decoded._id,
                roles: Raw((columnAlias) => `${columnAlias} && '{ADMIN, MANAGER}'`), 
                //TODO fix me when staff type is an array
            },
        });
        if (!staff) {
            throw new Error('please provide admin or manager authorization');
        }
        // console.log('staff', staff);
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

export default auth;