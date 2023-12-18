import { randomUUID } from "crypto";
import TwilioService from "../services/sms";
import { BaseEntity, Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, Equal, CreateDateColumn, UpdateDateColumn } from "typeorm";
import Customer from "./customer";


/**
 * @description Customer verification schema            
 */
@Entity('customerverification')
class Customerverification extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({
        unique: true,
        nullable: false
    })
    emailverificationcode!: string;

    @Column({
        default: false
    })
    emailverified!: boolean;

    @OneToOne(() => Customer, customer => customer.customerverification, { cascade: true, eager: true })
    @JoinColumn({name: "customer_id"})
    customer!: Customer;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    /**
    * 
    * @returns {string} - code to be used to verify user email
    */
    generateEmailVerificationCode(): Customerverification {
        const patientverification = this;  //BUG new instance of userverification is not been created correctly
        const verificationcode = randomUUID();
        // console.log(verificationcode);
        patientverification.emailverificationcode = verificationcode;
        // patientverification.save();
        return patientverification;
    }

    /**
    * @description - generate and send verification code to user phone using twilio verify service
    * @param {string} phone - user phone number
    * @returns {string} - code to be used to verify user phone
    */
    async generatePhoneVerificationCode(phone: string): Promise<object> {  //TODO uncomment this
        const ts = new TwilioService();
        const twillostatus = await ts.twiliogenerateandsendtoken(phone, "sms");
        return twillostatus;
    }


    /**
    * @param {string} verifier - phone number that received the verification code
    * @param {string} code - verification code been verified
    * @returns {object} - response object from the twilio verify service verifytoken operation
    */
    static async verifyphone(verifier: string, code: string): Promise<object> {
        try {
            const ts = new TwilioService();
            const verifystatus = await ts.twilioverifytoken(verifier, code);
            if (verifystatus.status !== "approved") {
                throw new Error("Verification code is invalid");
            }
            return verifystatus;
        }
        catch (error) {
            throw new Error((error as Error).message);
        }
    }


    /**
    * @description - 
    * @param {string} code - verification code
    * @returns {object} - userverification object
    */
    static async verifyemail(code: string): Promise<any> {
        try {
            const customerverifycode = await Customerverification.findOneBy({ emailverificationcode: Equal(code) });
            if (!customerverifycode) {
                throw new Error("Verification code is invalid");
            }
            if (customerverifycode.emailverified) {
                throw new Error("Verification code is already used");
            }
            customerverifycode.emailverified = true;
            await customerverifycode.save();
            return customerverifycode;
        }
        catch (error) {
            throw new Error((error as Error).message);
        }
    }
}

export default Customerverification;
