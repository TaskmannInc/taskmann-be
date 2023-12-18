import path from 'path';
import { ValidationError, MinLength, MaxLength, IsNotEmpty, IsString, Length, validate, validateOrReject, IsUrl, UUIDVersion } from 'class-validator';
import { AfterInsert, BaseEntity, BeforeInsert, Column, CreateDateColumn, Entity, Equal, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import jwt from "jsonwebtoken";
import { v4 as uuid } from 'uuid';
import bcrypt from "bcrypt";
import EmailService from "../services/mail";
import TwilioService from "../services/sms";
import UtilSever from "../utils/util";
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { randomUUID } from 'crypto';
import { JwtPayload } from "../interfaces/jwtpayload";
import { IStaffRequest } from "../interfaces/request";
import { staff_roles, genders } from "../enums/enum"
import CloudinaryService from '../services/cloudinary';
import IStaff from "../interfaces/staff";
import Staffverification from './staffVerification';
import Task from './task';




/**
 * @description Staff entity            
 */
@Entity('staffs')
class Staff extends BaseEntity {

    @PrimaryColumn("uuid")
    _id!: string;

    @Column({
        nullable: false,
        unique: false
    })
    @IsString()
    @IsNotEmpty({ message: "Please enter staff first name" })
    first_name!: string;

    @Column({
        nullable: false,
        unique: false
    })
    @IsString()
    @IsNotEmpty({ message: "Please enter staff last name" })
    last_name!: string;

    @Column({
        unique: true,
        nullable: false,
    })
    email!: string;

    //@IsUrl()
    @Column({
        unique: true,
        nullable: true,
    })
    phone!: string;

    @Column({
        nullable: true,
    })
    address!: string;

    @Column({
        nullable: true,
    })
    city!: string;

    @Column({
        nullable: false,
        type: 'enum',
        enum: staff_roles,
        array: true,
        default: [staff_roles.TASKER]
    })
    roles!: staff_roles[];


    @Column({
        nullable: true,
        type: 'enum',
        enum: genders,
        default: genders.other
    })
    gender!: genders;

    // @Column('simple-array', {
    //     nullable: true,
    //     default: [staff_roles.TASKER]
    // })
    // roles!: staff_roles[];


    // @Column({
    //     nullable: false,
    //     type: 'enum',
    //     enum: staff_type,
    //     default: staff_type.STAFF
    // })
    // type!: staff_type

    @Column({
        nullable: true,
        type: "simple-json",
    })
    profile_image!: { cloudinary_id: string, image_url: string, asset_id: string };

    @Column({
        select: true
    })
    @MinLength(8, { message: "Password must be at least 6 characters long" })
    // @MaxLength(20, { message: "Password must be less than 20 characters long" })
    password!: string;

    @Column({
        type: 'jsonb',
        select: true,
        array: false,
        default: () => "'[]'",
        nullable: false,
    })
    tokens!: Array<{ token: string }>;

    @Column({
        default: false,
    })
    verify_email!: boolean;

    @Column({
        default: false,
    })
    verify_phone!: boolean;

    @Column({
        nullable: true,
    })
    resetlink!: string;

    @Column({
        nullable: true,
    })
    reset_code!: number;

    @Column({
        nullable: true,
        default: true
    })
    active!: boolean;
    // @ManyToOne(() => Hospital, hospital => hospital.staff, {
    //     cascade: true,
    //     eager: true,
    //     nullable: false
    // })
    // @JoinColumn()
    // hospital!: Hospital;

    // @OneToMany(() => HospitalVault, hospitalvault => hospitalvault.staff)
    // hospitalvault!: HospitalVault[];

    // @OneToMany(() => BudgetExtimate, budgetextimate => budgetextimate.staff)
    // budgetextimate!: BudgetExtimate[];

    @OneToOne(() => Staffverification, staffverification => staffverification.staff, {
        //cascade: true,
        //eager: true
    })
    staffverification!: Staffverification;

    @OneToMany(() => Task, (task) => task.order)
    task: Task[];

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    /**
    * @description - staff registration processing method to run before inserting the staff into the database
    */
    @BeforeInsert()   //INFO - check if this is only called when a user is being created
    async registrationprocessing(): Promise<any> {
        try {
            const staff = this;
            staff._id = randomUUID(); //NOTE - assign a random id to the user manually, because typeorm does not give you access to the id before you save the model
            const token = jwt.sign({ _id: staff._id.toString() }, process.env.SET_JWT_SECRET!, {
                algorithm: "HS256",
                expiresIn: "7d", //TODO - work on the token expiration
            });
            if (!staff.tokens) staff.tokens = []; //NOTE - typeorm does not add the default value to the tokens array before save, so it will be undefined, so we need to add it manually before performing any operation on it.
            staff.tokens = staff.tokens.concat({ token });
            staff.password = await bcrypt.hash(staff.password, parseInt(process.env.HASH_ROUNDS!));
            return staff /// .generateCode(); // generate all necessary verification codes
            /// .generateCode(); // generate all necessary verification codes
        }
        catch (err) {
            throw new Error((err as Error).message);
        }
    }


    /**
    * @description - method to verify a user
    * @param {object} staffinstance - user instance object
    * @returns {object} userverification instance
    */
    static async createStaff(data: any): Promise<any> {
        try {
            const Manager = this.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                const staff = await transactionalEntityManager.create(Staff, data);
                //TODO - check if data contains password, if not, generate a random password and send it to the user
                let staffverification = transactionalEntityManager.create(Staffverification);
                await validateOrReject(staff);
                if (staff.email) {
                    staffverification = staffverification.generateEmailVerificationCode();
                    const es = new EmailService();
                    await transactionalEntityManager.save(staff);
                    staffverification.staff = staff._id;
                    await transactionalEntityManager.save(staffverification);
                    const verificationlink = `${process.env.FRONTEND_VERCEL}/admin/auth/email-verification?code=${staffverification.emailverificationcode}`;
                    es.senduserregistrationemail(staff.email, verificationlink, staff.first_name);
                    // const phone_data = staffverification.generatePhoneVerificationCode(staff.phone);
                    return staffverification.emailverificationcode;
                }
                await transactionalEntityManager.save(staff);
                staffverification.staff = staff._id;
                await transactionalEntityManager.save(staffverification);
                // return staffverification.generatePhoneVerificationCode(staff.phone);
                return null
            })
        }
        catch (err) {
            throw new Error((err as Error).message);
        }
    }


    /**
    * @description a method to hash user password before it is saved in raw form
    * @param {string} password - user password 
    * @returns 
    */
    static async hashPassword(password: string): Promise<string> {
        try {
            return await bcrypt.hash(password, parseInt(process.env.HASH_ROUNDS!));
        }
        catch (error) {
            throw new Error((error as Error).message);
        }
    }


    /**
    * @description - Generate auth token for staff which is attached to the staff instance and saved in the database
    * @returns {string} - JWTtoken to be attached to the user instance
    */
    async generateAuthtoken(registration: boolean = false): Promise<string> {
        const staff = this;
        const token = jwt.sign({ _id: staff._id.toString() }, process.env.SET_JWT_SECRET!, {
            algorithm: "HS256",
            expiresIn: "7d",
        });
        if (!staff.tokens) staff.tokens = []; // if the tokens array is undefined, then we need to add it manually
        staff.tokens = staff.tokens.concat({ token });
        await staff.save();
        return token;
    };


    /**
    * @description - method to generate a verification phone and email verification token
    * @param {object} staffinstance - user instance object
    * @returns {object} userverification instance
    */
    async generateCode(): Promise<any> {  //TODO - uncomment this method
        try {
            const staffid = this._id;
            console.log("customerid", staffid);
            const Manager = Staffverification.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                // const staffverification = await Staffverification.findOne({ where: { staff: { _id: staffid } } })
                //  await Manager.findOne(Customerverification, { where: {customer: { _id:  customerid} } });
                let staffverification = await transactionalEntityManager.findOne(Staffverification, { where: { staff: { _id: staffid } } });
                // const customerverification = await Customerverification.findOne({ where: { customer: { _id: customerid } } })
                //  await Manager.findOne(Customerverification, { where: {customer: { _id:  customerid} } });
                if (!staffverification) {
                    throw new Error("Unable to generate code, wrong record or already verified");
                }
                if (staffverification.emailverified) {
                    throw new Error("Already verified");
                }
                const es = new EmailService();
                staffverification = staffverification.generateEmailVerificationCode();
                const verificationlink = `${process.env.FRONTEND_VERCEL}/admin/auth/email-verification?code=${staffverification.emailverificationcode}`;
                let d = await es.senduserregistrationemail(this.email, verificationlink, this.first_name);
                if (!staffverification || staffverification.emailverified) {
                    throw new Error("Unable to generate code, wrong record or already verified");
                }
                await transactionalEntityManager.save(staffverification);
                return staffverification.emailverificationcode;
            })
        }
        catch (error) {
            throw new Error((error as Error).message);
        }
    };


    /**
    * @description - Find a user by the provided username and password
    * @param {string} email - email of the user
    * @param {string} password - password of the user
    * @returns {object} user instance object
    */
    static async findByCredentials(email: string, password: string): Promise<any> {
        try {
            const Manager = Staffverification.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                const staff = await transactionalEntityManager.findOne(Staff, { where: { email } });
                if (!staff) {
                    throw new Error("Unable to login staff check credentials");
                }
                if (!staff.verify_email) {
                    throw new Error("Please verify your account");
                }
                const isMatch = await bcrypt.compare(password, staff.password);
                if (!isMatch) {
                    throw new Error("Unable to login user check credentials");
                }
                delete staff.password;
                // delete staff.tokens;
                return staff;
            })
        }
        catch (error) {
            throw new Error((error as Error).message);
        }
    };


    /**
    * @description - initiate the password reset process for the user provided
    * @param {string} email - email address of the user initiating the password reset
    * @returns
    */
    static async forgotpassword(email: string): Promise<any> { // Promise<SMTPTransport.SentMessageInfo>
        //const es = new EmailService();
        const staff = await Staff.findOneBy({ email });
        const Manager = Staff.getRepository().manager;
        return Manager.transaction(async transactionalEntityManager => {
            try {
                const staff = await transactionalEntityManager.findOne(Staff, { where: { email } });
                if (!staff) {
                    throw new Error("No User Associated with this email");
                }
                const token = jwt.sign({ _id: staff._id.toString() }, process.env.RESET_JWT_SECRET!, {
                    algorithm: "HS256",
                    expiresIn: "20m",
                });
                const resetlink = `${process.env.FRONTEND_VERCEL}/admin/auth/reset-password?code=${token}`;
                staff.resetlink = token;
                //TODO - uncomment this line
                if (staff.email) {
                    const es = new EmailService();
                    await staff.save();
                    return await es.sendpasswordresetemail(resetlink, staff.first_name, staff.email);
                }
                await staff.save();
                return token
            }
            catch (err) {
                throw new Error((err as Error).message);
            }
        });

    };


    /**
     * @description - method to reset the password of the user through sms 
     * @param phone - phone number of the staff used to register
     * @returns 
     */
    static async forgotpasswordSMS(phone: string): Promise<any> {
        const staff = await Staff.findOneBy({ phone });
        if (!staff) {
            throw new Error("No User Associated with this phone");
        }
        try {
            const ts = new TwilioService();
            const code = new UtilSever().generateToken(6);
            staff.reset_code = code;
            await staff.save();
            return await ts.sendSMS(phone, `Your reset code is ${code}`);
        }
        catch (err) {
            throw new Error((err as Error).message);
        }
    }





    /**
     * @description - reset the password of the user provided
     * @param {string} token - token to be verified
     * @param {string} password - new password to be set
     * @returns {object} - user instance object
     */
    static async resetpassword(token: string, password: string): Promise<any> {
        const staff = await Staff.findOneBy({ resetlink: token });
        if (!staff) {
            throw new Error("No Reset Link Associated with this code");
        }
        try {
            const decoded = jwt.verify(token, process.env.RESET_JWT_SECRET!) as JwtPayload;
            const decodedstaff = await Staff.findOneBy({ _id: decoded._id, resetlink: token, });
            if (!decodedstaff) {
                throw new Error("No Reset Link Associated with this code");
            }
            staff.password = await Staff.hashPassword(password);
            staff.resetlink = "";
            //TODO : send email to user to notify password reset
            await staff.save();
            // delete staff.password;
            // delete staff.tokens;
            return staff
        }
        catch (err) {
            throw new Error((err as Error).message);
        }
    }


    /**
    * @description - reset the password of the user provided
    * @param {string} token - token to be verified
    * @param {string} password - new password to be set
    * @returns {object} - user instance object
    */
    static async resetpasswordSMS(token: number, password: string): Promise<any> {
        const staff = await Staff.findOneBy({ reset_code: token });
        if (!staff) {
            throw new Error("No Password Reset Associated with this code");
        }
        try {
            staff.password = await Staff.hashPassword(password);
            staff.reset_code = null;
            //TODO : send email to user to notify password reset
            await staff.save();
            delete staff.password;
            delete staff.tokens;
            return staff
        }
        catch (err) {
            throw new Error((err as Error).message);
        }
    }

    static async changepassword(req: IStaffRequest, currentpassword: string, newpassword: string): Promise<any> {
        const staff = await Staff.findOneBy({ _id: Equal(req.staff._id) });
        if (!staff) {
            throw new Error("No User Associated with this code");
        }
        try {
            const isMatch = await bcrypt.compare(currentpassword, staff.password);
            if (!isMatch) {
                //TODO send notification email to user to notify password change failed
                throw new Error("Current Password is incorrect");
            }
            staff.password = await Staff.hashPassword(newpassword);
            await staff.save();
            //TODO send notification email to user to notify password change success
            delete staff.password;
            delete staff.tokens;
            return staff;
        }
        catch (err) {
            throw new Error((err as Error).message);
        }
    }


    /**
     * @description =
     * @param {string} userid - userid of the user
     * @param {string} verifystate - verification action/state eg. verify_email, verify_phone
     * @returns {object} - user instance object
     */
    static async verifyEmail(userid: string, verifystate: string): Promise<any> {
        try {

            const staff = await Staff.findOneBy({ _id: Equal(userid) });
            if (!staff) {
                throw new Error("No User Associated with this code");
            }
            // check if the verifystate passed which is verify_email or verify_phone is already true, if yes then throw an error
            // else update the user option passed to true
            if (staff.verify_email) { // FIXME make the user verify option just email
                console.log("User Already Verified", staff.verify_email);
                throw new Error(`User ${verifystate} Already Verified`);
            }
            staff.verify_email = true;
            await staff.save();
            delete staff.password
            // delete staff.tokens;
            return staff;
        }
        catch (error) {
            throw new Error((error as Error).message);
        }
    };


    /**
     * @description =
     * @param {string} userid - userid of the user
     * @param {string} verifystate - verification action/state eg. verify_email, verify_phone
     * @returns {object} - user instance object
     */
    static async verifyPhone(userid: string, verifystate: string): Promise<any> {
        try {
            const staff = await Staff.findOneBy({ _id: userid });
            if (!staff) {
                throw new Error("No User Associated with this code");
            }
            // check if the verifystate passed which is verify_email or verify_phone is already true, if yes then throw an error
            // else update the user option passed to true
            if (staff.verify_phone) { // FIXME make the user verify option just email
                throw new Error(`User ${verifystate} Already Verified`);
            }
            staff.verify_phone = true;
            await staff.save();
            delete staff.password
            delete staff.tokens;
            return staff;
        }
        catch (error) {
            throw new Error((error as Error).message);
        }
    };


    static async updatestaff(req: IStaffRequest): Promise<IStaff> {
        const updates = Object.keys(req.body);
        //NOTE: this is to check if the user is updating a field that is not allowed
        // const allowedupdates = [
        //     "first_name",
        //     "last_name",
        //     "address",
        //     "phone"
        // ];
        // const isvalidoperation = updates.every((update) => {
        //     return allowedupdates.includes(update);
        // });
        // if (!isvalidoperation) {
        //     throw new Error('invalid updates');
        // }
        // if (req.body.ghana_card) {
        //     new UtilSever().validateGHCard(req.body.ghana_card)
        // }
        let index = updates.indexOf('email');

        if (index !== -1) {
            updates.splice(index, 1);
        }
        const staff = req.staff;
        updates.forEach((update) => {
            staff[update] = req.body[update];
        });
        await staff.save();
        delete staff.password;
        // delete staff.tokens;
        return staff;
    };


    static async addProfileImage(data: any, _id: string): Promise<any> {
        try {
            console.log("file", data.file.path);
            if (!data.file) {
                throw new Error("No File Provided");
            }
            const cs = new CloudinaryService();
            const Manager = this.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                console.log("file", data.file.path);
                const staff = await transactionalEntityManager.findOne(Staff, { where: { _id: Equal(_id) } });
                if (!staff.profile_image) {
                    const result = await cs.uploadfile(data.file.path);
                    console.log("valut", result);
                    staff.profile_image = { cloudinary_id: result.public_id, image_url: result.url, asset_id: result.asset_id };
                    await transactionalEntityManager.save(staff);
                    delete staff.password;
                    // delete staff.tokens;
                    return staff;
                }
                const result = await cs.updatefile(staff.profile_image.cloudinary_id, data.file.path);
                staff.profile_image = { cloudinary_id: result.public_id, image_url: result.url, asset_id: result.asset_id };
                await transactionalEntityManager.save(staff);
                delete staff.password;
                // delete staff.tokens;
                return staff;
            })
        } catch (err) {
            throw new Error((err as Error).message);
        }
    }

    async changepassword(req: IStaffRequest, currentpassword: string, newpassword: string): Promise<any> {
        const staff = await Staff.findOneBy({ _id: Equal(req.staff._id) });
        if (!staff) {
            throw new Error("No staff Associated with this id");
        }
        try {
            const isMatch = await bcrypt.compare(currentpassword, staff.password);
            if (!isMatch) {
                //TODO send notification email to user to notify password change failed
                throw new Error("Current Password is incorrect");
            }
            staff.password = await Staff.hashPassword(newpassword);
            await staff.save();
            //TODO send notification email to user to notify password change success
            delete staff.password;
            // delete staff.tokens;
            return staff;
        }
        catch (err) {
            throw new Error((err as Error).message);
        }
    }


    /**
    * @description - logout staff from a single device or all device
    * @param {object} req req object that contains the user token, etc
    * @param {boolean} all boolen value to know if user wants to logout all connected device
    * @returns - return req object with user token removed or invalidated
    */
    static async logoutstaff(req: IStaffRequest, all: boolean = false): Promise<any[] | undefined> {
        if (all) {
            req.staff.tokens = [];
            return req.staff.save();
        } else {
            req.staff.tokens = req.staff.tokens.filter((token: { token: any; }) => {
                return token.token !== req.token;
            });
            return await req.staff.save();
        }
    };


    /**
     * @description - update staff role
     * @param {object} req req object that contains the user token, etc
     * @param {string} role role to be updated
     * @returns - return req object with user token removed or invalidated
     * @note - this method is able to change the role of the user to any role except the manager role
     * @note - only the manager role can change the role of a user to manager
     * 
     */
    static async updatestaffrole(req: IStaffRequest, data: { roles: staff_roles, staff_id: typeof uuid }): Promise<any> {
        try {
            console.log("staff..................................", req.staff);
            const Manager = this.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                const { roles, staff_id } = data;
                console.log("staff..................................", roles, staff_id, data);
                const c_staff = await transactionalEntityManager.findOne(Staff, { where: { _id: req.staff._id } });
                const staff = await transactionalEntityManager.findOne(Staff, { where: { _id: String(staff_id) } });
                // const c_staff = await Staff.findOneBy({ _id: req.staff._id });
                // const staff = await Staff.findOneBy({ _id: String(staff_id) });
                if (!c_staff || !staff) {
                    throw new Error("Unauthorized Access or Staff not found");
                }

                if (c_staff._id === staff._id) {
                    throw new Error("You cannot change your own role");
                }

                if (roles[0] === staff.roles[0]) {
                    return staff;
                }

                // check if the staff role array contains manager
                // if (staff.roles.includes("MANAGER")) {
                //     throw new Error("Only the manager can change the role of a user to manager");
                // }

                console.log("staff", c_staff.roles, roles, staff.roles, c_staff.roles.includes(staff_roles.MANAGER));
                console.log("staff", c_staff.roles.includes(staff_roles.ADMIN) === false);
                console.log("staff", !c_staff.roles.includes(staff_roles.ADMIN));

                if (roles[0] === "MANAGER" && c_staff.roles.includes(staff_roles.MANAGER) === false) {
                    throw new Error("Only a manager staff can change the role of a user to manager");
                }
                staff.roles[0] = roles[0] as staff_roles;
                await staff.save(); 
                delete staff.password;
                // delete req.staff.tokens;
                return staff;
            })
        }
        catch (err) {
            throw new Error((err as Error).message);
        }
    }

}

export default Staff;