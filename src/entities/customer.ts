import path from 'path';
import { ValidationError, MinLength, MaxLength, IsNotEmpty, IsString, Length, validate, validateOrReject, IsUrl } from 'class-validator';
import { AfterInsert, BaseEntity, BeforeInsert, Column, CreateDateColumn, Entity, Equal, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryColumn, UpdateDateColumn, getRepository } from 'typeorm';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import EmailService from "../services/mail";
import TwilioService from "../services/sms";
import UtilSever from "../utils/util";
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { randomUUID } from 'crypto';
import { JwtPayload } from "../interfaces/jwtpayload";
import { ICustomerRequest } from "../interfaces/request";
import CloudinaryService from '../services/cloudinary';
import ICustomer from "../interfaces/customer";
import Customerverification from './customerVerification';
import Cart from './cart';
import Order from './order';




/**
 * @description Customer entity            
 */
@Entity('customers')
class Customer extends BaseEntity {

    @PrimaryColumn("uuid")
    _id!: string;

    @Column({
        nullable: false,
        unique: false
    })
    @IsString()
    @IsNotEmpty({ message: "Please enter customer first name" })
    first_name!: string;

    @Column({
        nullable: false,
        unique: false
    })
    @IsString()
    @IsNotEmpty({ message: "Please enter customer last name" })
    last_name!: string;

    @Column({
        unique: true,
        nullable: true,
    })
    email!: string;

    @Column({
        nullable: true,
    })
    @IsString()
    city!: string;

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
        type: "simple-json",
        default: () => "('{}')",
    })
    profile_image!: { cloudinary_id: string, image_url: string, asset_id: string };

    @Column({
        select: true,
        nullable: false,
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

    @OneToOne(() => Customerverification, customerverification => customerverification.customer, {
        cascade: false,
        // eager: true  Note this might be a problem
    })
    customerverification!: Customerverification;

    @OneToMany(() => Cart, cart => cart.customer, {
        cascade: true,
        // eager: true
    })
    cart!: Cart[];

    @OneToMany(() => Order, order => order.customer, {
        cascade: true,
        // eager: true
    })
    orders!: Order[];
    
    @Column({
        nullable: true,
        default: true
    })
    active!: boolean;
    
    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    /**
    * @description - customer registration processing method to run before inserting the customer into the database
    */

    @BeforeInsert()   //INFO - check if this is only called when a user is being created
    async registrationprocessing(): Promise<any> {
        try {
            const customer = this;
            customer._id = randomUUID(); //NOTE - assign a random id to the user manually, because typeorm does not give you access to the id before you save the model
            const token = jwt.sign({ _id: customer._id.toString() }, process.env.SET_JWT_SECRET!, {
                algorithm: "HS256",
                expiresIn: "7d", //TODO - work on the token expiration
            });
            if (!customer.tokens) customer.tokens = []; //NOTE - typeorm does not add the default value to the tokens array before save, so it will be undefined, so we need to add it manually before performing any operation on it.
            customer.tokens = customer.tokens.concat({ token });
            customer.password = await bcrypt.hash(customer.password, parseInt(process.env.HASH_ROUNDS!));
            return await customer /// .generateCode(); // generate all necessary verification codes
        }
        catch (err) {
            throw new Error((err as Error).message);
        }
    }


    /**
    * @description - method to verify a user
    * @param {object} customerinstance - user instance object
    * @returns {object} userverification instance
    */
    static async createCustomer(data: any): Promise<any> {
        try {
            const Manager = this.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                const customer = await transactionalEntityManager.create(Customer, data);
                let customerverification = transactionalEntityManager.create(Customerverification);
                await validateOrReject(customer);
                if (customer.email) {
                    customerverification = customerverification.generateEmailVerificationCode();
                    const es = new EmailService();
                    await transactionalEntityManager.save(customer);
                    customerverification.customer = customer._id;
                    await transactionalEntityManager.save(customerverification);
                    const verificationlink = `${process.env.FRONTEND_VERCEL}/auth/email-verification?code=${customerverification.emailverificationcode}`;
                    let d = await es.senduserregistrationemail(customer.email, verificationlink, customer.first_name);
                    // const result = es.senduserregistrationemailfake(customer.email, verificationlink, customer.name);
                    // const phone_data = customerverification.generatePhoneVerificationCode(customer.phone);
                    return customerverification.emailverificationcode;
                }

                await transactionalEntityManager.save(customer);
                customerverification.customer = customer._id;
                await transactionalEntityManager.save(customerverification);
                // return customerverification.generatePhoneVerificationCode(customer.phone);
                return null;
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
    * @description - Generate auth token for customer which is attached to the customer instance and saved in the database
    * @returns {string} - JWTtoken to be attached to the user instance
    */
    async generateAuthtoken(registration: boolean = false): Promise<string> {
        const customer = this;
        const token = jwt.sign({ _id: customer._id.toString() }, process.env.SET_JWT_SECRET!, {
            algorithm: "HS256",
            expiresIn: "7d",
        });
        if (!customer.tokens) customer.tokens = []; // if the tokens array is undefined, then we need to add it manually

        customer.tokens = customer.tokens.concat({ token });
        await customer.save();
        return token;
    };


    /**
    * @description - method to generate a verification phone and email verification token
    * @param {object} userinstance - user instance object
    * @returns {object} userverification instance
    */
    async generateCode(): Promise<any> {  // TODO - uncomment this method
        try {
            const customerid = this._id;
            console.log("customerid", customerid);
            const Manager = Customerverification.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                // console.log("Manager", Manager);
                // const budgets = await Manager.find(Budget, { where: { patient: { _id: patient }, created_at: Between(fourmonth, new Date) } })
                //const customerverification = await transactionalEntityManager.findOne(Customerverification, { where: { customer: { _id: customerid } } });
                let customerverification = await transactionalEntityManager.findOne(Customerverification, { where: { customer: { _id: customerid } } });
                // const customerverification = await Customerverification.findOne({ where: { customer: { _id: customerid } } })
                //  await Manager.findOne(Customerverification, { where: {customer: { _id:  customerid} } });
                if (!customerverification) {
                    throw new Error("Unable to generate code, wrong record or already verified");
                }
                if (customerverification.emailverified) {
                    throw new Error("Already verified");
                }
                const es = new EmailService();
                console.log("customerverification", customerverification);
                customerverification = customerverification.generateEmailVerificationCode();
                const verificationlink = `${process.env.FRONTEND_VERCEL}/auth/email-verification?code=${customerverification.emailverificationcode}`;
                let d = await es.senduserregistrationemail(this.email, verificationlink, this.first_name);
                if (!customerverification || customerverification.emailverified) {
                    throw new Error("Unable to generate code, wrong record or already verified");
                }
                await transactionalEntityManager.save(customerverification);
                return customerverification.emailverificationcode;

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
            const customer = await Customer.findOneBy({ email: Equal(email) });
            if (!customer) {
                throw new Error("Unable to login user check credentials");
            }
            if (!customer.verify_email) {
                throw new Error("Please verify your account");
            }
            const isMatch = await bcrypt.compare(password, customer.password);
            if (!isMatch) {
                throw new Error("Unable to login user check credentials");
            }
            delete customer.password;
            // delete customer.tokens;
            return customer;
        }
        catch (err) {
            throw new Error((err as Error).message);
        }
    };


    /**
    * @description - initiate the password reset process for the user provided
    * @param {string} email - email address of the user initiating the password reset
    * @returns
    */
    static async forgotpassword(email: string): Promise<any> { // Promise<SMTPTransport.SentMessageInfo>
        //const es = new EmailService();

        try {
            const customer = await Customer.findOneBy({ email: Equal(email) });
            if (!customer) {
                throw new Error("No User Associated with this email");
            }
            const token = jwt.sign({ _id: customer._id.toString() }, process.env.RESET_JWT_SECRET!, {
                algorithm: "HS256",
                expiresIn: "10m",
            });
            const resetlink = `${process.env.FRONTEND_VERCEL}/auth/reset-password?code=${token}`;
            customer.resetlink = token;
            //TODO - uncomment this when the email service is ready
            if (customer.email) {
                const es = new EmailService();
                await customer.save();
                await es.sendpasswordresetemail(resetlink, customer.first_name, customer.email);
                return token;
            }
            //TODO - REMOVE THIS WHEN THE EMAIL SERVICE IS READY
            await customer.save();
            return token;
        }
        catch (err) {
            throw new Error((err as Error).message);
        }
    };


    /**
     * @description - method to reset the password of the user through sms 
     * @param phone - phone number of the customer used to register
     * @returns 
     */
    static async forgotpasswordSMS(phone: string): Promise<any> {
        const customer = await Customer.findOneBy({ phone });
        if (!customer) {
            throw new Error("No User Associated with this phone");
        }
        try {
            const ts = new TwilioService();
            const code = new UtilSever().generateToken(6);
            customer.reset_code = code;
            await customer.save();
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

        try {
            const customer = await Customer.findOneBy({ resetlink: Equal(token) });
            // console.log(customer);
            if (!customer) {
                throw new Error("No Reset Link Associated with this code");
            }
            const decoded = jwt.verify(token, process.env.RESET_JWT_SECRET!) as JwtPayload;
            console.log(decoded);
            const decodedcustomer = await Customer.findOneBy({ _id: decoded._id, resetlink: token, });
            if (!decodedcustomer) {
                throw new Error("No Reset Link Associated with this code");
            }
            // console.log(password);
            const isMatch = await bcrypt.compare(password, customer.password);
            if (isMatch) {
                //TODO send notification email to user to notify password change failed
                throw new Error("You can not use your old password as your new password");
            }
            customer.password = await Customer.hashPassword(password);
            customer.resetlink = "";
            //TODO : send email to user to notify password reset
            await customer.save();
            delete customer.password;
            // delete customer.tokens;
            return customer
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
        const customer = await Customer.findOneBy({ reset_code: token });
        if (!customer) {
            throw new Error("No Password Reset Associated with this code");
        }
        try {
            customer.password = await Customer.hashPassword(password);
            customer.reset_code = null;
            //TODO : send email to user to notify password reset
            await customer.save();
            delete customer.password;
            delete customer.tokens;
            return customer
        }
        catch (err) {
            throw new Error((err as Error).message);
        }
    }

    static async changepassword(req: ICustomerRequest, currentpassword: string, newpassword: string): Promise<any> {
        const customer = await Customer.findOneBy({ _id: req.customer._id });
        if (!customer) {
            throw new Error("No User Associated with this code");
        }
        try {
            const isMatch = await bcrypt.compare(currentpassword, customer.password);
            if (!isMatch) {
                //TODO send notification email to user to notify password change failed
                throw new Error("Current Password is incorrect");
            }
            customer.password = await Customer.hashPassword(newpassword);
            await customer.save();
            //TODO send notification email to user to notify password change success
            delete customer.password;
            delete customer.tokens;
            return customer;
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
            const customer = await Customer.findOneBy({ _id: Equal(userid) });
            if (!customer) {
                throw new Error("No Customer Associated with this code");
            }
            // check if the verifystate passed which is verify_email or verify_phone is already true, if yes then throw an error
            // else update the user option passed to true
            if (customer.verify_email) { // FIXME make the user verify option just email
                console.log("User Already Verified", customer.verify_email);
                throw new Error(`User ${verifystate} Already Verified`);
            }
            customer.verify_email = true;
            await customer.save();
            delete customer.password
            // delete customer.tokens;
            return customer;
        }
        catch (err) {
            throw new Error((err as Error).message);
        }
    };

    /**
     * @description =
     * @param {string} userid - userid of the user
     * @param {string} verifystate - verification action/state eg. verify_email, verify_phone
     * @returns {object} - user instance object
     */
    static async verifyPhone(userid: string, verifystate: string): Promise<any> {
        const customer = await Customer.findOneBy({ _id: userid });
        if (!customer) {
            throw new Error("No User Associated with this code");
        }
        // check if the verifystate passed which is verify_email or verify_phone is already true, if yes then throw an error
        // else update the user option passed to true
        if (customer.verify_phone) { // FIXME make the user verify option just email
            throw new Error(`User ${verifystate} Already Verified`);
        }
        customer.verify_phone = true;
        await customer.save();
        delete customer.password
        delete customer.tokens;
        return customer;
    };


    static async updatecustomer(req: ICustomerRequest): Promise<ICustomer> {
        const updates = Object.keys(req.body);
        // const allowedupdates = [
        //     "first_name",
        //     "last_name",
        //     "phone",
        //     "city",
        //     "address",
        // ];
        //NOTE : this is a way to check if the updates sent by the user is allowed
        // const isvalidoperation = updates.every((update) => {
        //     return allowedupdates.includes(update);
        // });
        // if (!isvalidoperation) {
        //     throw new Error('invalid updates');
        // }
        // if (req.body.ghana_card) {
        //     new UtilSever().validateGHCard(req.body.ghana_card)
        // }
        // check if email is in the request body, if yes then remove it from the updates array
        let index = updates.indexOf('email');

        if (index !== -1) {
            updates.splice(index, 1);
        }
        const customer = req.customer;
        updates.forEach((update) => {
            customer[update] = req.body[update];
        });
        await customer.save();
        delete customer.password;
        // delete customer.tokens;
        return customer;
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
                const customer = await transactionalEntityManager.findOne(Customer, { where: { _id } });
                if (!customer.profile_image) {
                    const result = await cs.uploadfile(data.file.path);
                    console.log("valut", result);
                    customer.profile_image = { cloudinary_id: result.public_id, image_url: result.url, asset_id: result.asset_id };
                    await transactionalEntityManager.save(customer);
                    delete customer.password;
                    //delete customer.tokens;
                    return customer;
                }
                const result = await cs.updatefile(customer.profile_image.cloudinary_id, data.file.path);
                customer.profile_image = { cloudinary_id: result.public_id, image_url: result.url, asset_id: result.asset_id };
                await transactionalEntityManager.save(customer);
                delete customer.password;
                // delete customer.tokens;
                return customer;
            })
        } catch (err) {
            throw new Error((err as Error).message);
        }
    }

    async changepassword(req: ICustomerRequest, currentpassword: string, newpassword: string): Promise<any> {
        const customer = await Customer.findOneBy({ _id: req.customer._id });
        if (!customer) {
            throw new Error("No customer Associated with this id");
        }
        try {
            const isMatch = await bcrypt.compare(currentpassword, customer.password);
            if (!isMatch) {
                //TODO send notification email to user to notify password change failed
                throw new Error("Current Password is incorrect");
            }
            customer.password = await Customer.hashPassword(newpassword);
            await customer.save();
            //TODO send notification email to user to notify password change success
            delete customer.password;
            // delete customer.tokens;
            return customer;
        }
        catch (err) {
            throw new Error((err as Error).message);
        }
    }


    /**
    * @description - logout customer from a single device or all device
    * @param {object} req req object that contains the user token, etc
    * @param {boolean} all boolen value to know if user wants to logout all connected device
    * @returns - return req object with user token removed or invalidated
    */
    static async logoutcustomer(req: ICustomerRequest, all: boolean = false): Promise<any[] | undefined> {
        if (all) {
            req.customer.tokens = [];
            return await req.customer.save();
        } else {
            req.customer.tokens = req.customer.tokens.filter((token: { token: any; }) => {
                return token.token !== req.token;
            });
            return await req.customer.save();
        }
    };

}


export default Customer;