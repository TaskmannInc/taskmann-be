import nodemailer from 'nodemailer';
import nodemailMailgun from 'nodemailer-mailgun-transport';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import password_reset_email_template from '../templates/email/forgotpassword';
import user_registration_email_template from '../templates/email/registration';
import user_contact_us_template from '../templates/email/contact_us';
import formData from 'form-data';
import Mailgun from 'mailgun.js';



/**
* @description - Email service to send email Notification to user, will contain all the email related methods
*/
class MailService {
    mailgunAuth = {
        auth: {
            // api_key: '8de6bb241316fe8c189031185f820d31-52d193a0-ea967e7b' as string,
            // domain: 'mg.taskmann.ca' as string,
            // host: "api.eu.mailgun.net",
            host: "smtp.eu.mailgun.org",
            port: 587,
            // secure: false,
            // requireTLS: true,
            auth: {
                user: 'Enter your email address',
                pass: 'e8495a9fa840a21f28cdf34e5e95543b-db4df449-fb15675d'
            }

        }
    }

    auth = {
        host: "smtp.eu.mailgun.org",
        port: 587,
        // secure: false,
        // requireTLS: true,
        auth: {
            user: 'postmaster@mg.taskmann.ca',
            pass: 'e8495a9fa840a21f28cdf34e5e95543b-db4df449-fb15675d'
        }
    }

    hotmail = {
        service: 'hotmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
            ,
        }
    }
    // mailgun = new Mailgun(formData);
    // client = this.mailgun.client({ username: 'api', key: 'e9c1c2c92fd0e92f47ffe3accc6e41fa-db4df449-a5e13dfd' });

    //transporter = nodemailer.createTransport(nodemailMailgun(this.mailgunAuth));
    transporter = nodemailer.createTransport(this.hotmail);


    constructor() { }

    public async sendpasswordresetemail(resetlink: string, name: string, to: string): Promise<SMTPTransport.SentMessageInfo> {
        try {
            const mailOptions = {
                from: `TaskMann <${process.env.EMAIL}>`,
                to: to,
                subject: 'Password Reset',
                html: await password_reset_email_template(resetlink, name)
            }
            return await this.transporter.sendMail(mailOptions);
        }
        catch (err) {
            throw new Error((err as Error).message);
        }
    }

    public async senduserregistrationemail(to: string, link: string, username: string): Promise<SMTPTransport.SentMessageInfo> {
        try {
            const mailOptions = {
                from: `TaskMann <${process.env.EMAIL}>`,//"Mailgun Sandbox <postmaster@sandbox730453bb05564f7f9e3607399b97a30b.mailgun.org>",
                to: [to],
                subject: 'Congratulations! You have successfully registered with TaskMann',
                html: await user_registration_email_template(link, username)
            }
            return await this.transporter.sendMail(mailOptions);
        }
        catch (error) {
            console.log(error);
            throw new Error((error as Error).message);
        }
    }

    // public async senduserregistrationemailfake(to: string, link: string, username: string): Promise<any> {
    //     try {
    //         const formData = require('form-data');
    //         const Mailgun = require('mailgun.js');
    //         const mailgun = new Mailgun(formData);
    //         const mg = mailgun.client({
    //             username: 'api',
    //             key: '8de6bb241316fe8c189031185f820d31-52d193a0-ea967e7b',
    //         });
    //         mg.messages.create('sandbox730453bb05564f7f9e3607399b97a30b.mailgun.org', {
    //             from: "Mailgun Sandbox <postmaster@sandbox730453bb05564f7f9e3607399b97a30b.mailgun.org>",
    //             to: [to],
    //             subject: 'Congratulations! You have successfully registered with TaskMann',
    //             html: await user_registration_email_template(link, username)
    //         })
    //             .then(msg => console.log(msg)) // logs response data
    //             .catch(err => console.log(err)); // logs any error`;
    //     }
    //     catch (error) {
    //         throw new Error((error as Error).message);
    //     }
    // }

    public async send_generic_email(data: any): Promise<any> {
        try {
            const mailOptions = {
                from: `TaskMann <${process.env.EMAIL}>`,//"Mailgun Sandbox <postmaster@sandbox730453bb05564f7f9e3607399b97a30b.mailgun.org>",
                to: [process.env.EMAIL],
                subject: `You have a contact message from ${data.first_name} ${data.last_name}`,  // 'Congratulations! You have successfully registered with TaskMann',
                html: await user_contact_us_template(data)
            }
            return await this.transporter.sendMail(mailOptions)
        }
        catch (error) {
            throw new Error((error as Error).message);
        }
    }

    // public async sendemail(to: string, subject: string, html: string): Promise<any> {
    //     try {
    //         const mailOptions = {
    //             from: `TaskMann <${'brad@mg.taskmann.ca'}>`,
    //             to: to,
    //             subject: subject,
    //             html: html
    //         }
    //         return await this.client.messages.create('mg.taskmann.ca', mailOptions)
    //     }
    //     catch (error) {
    //         console.log(error);
    //         throw new Error((error as Error).message);
    //     }
    // }
}


export default MailService;
