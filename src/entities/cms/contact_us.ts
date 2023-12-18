import path from 'path';
import { ValidationError, MinLength, MaxLength, IsNotEmpty, IsString, Length, validate, validateOrReject, IsUrl } from 'class-validator';
import { AfterInsert, BaseEntity, BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn, getRepository } from 'typeorm';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import CloudinaryService from '../../services/cloudinary';
import EmailService from '../../services/mail';


/**
 * @description Contact Us entity            
 */
@Entity('contact_us')
class Contact extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    _id!: string;

    @Column({
        nullable: false,
        unique: false
    })
    first_name!: string;

    @Column({
        nullable: false,
        unique: false
    })
    last_name!: string;

    @Column({
        nullable: false,
        unique: false
    })
    email!: string;

    @Column({
        nullable: true,
        unique: false
    })
    phone_number!: string;

    @Column({
        nullable: false,
        unique: false
    })
    message!: string;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
        
    static async createContact(data: any) {
        try {
            const Manager = this.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                const contact = await transactionalEntityManager.create(Contact, data);
                // await validateOrReject(vault);
                const es = new EmailService();
                await transactionalEntityManager.save(contact);
                const response =  await es.send_generic_email(data)
                return contact;
            })

        } catch (error) {
            return new Error(error.message);
        }

    }

    async updateContact(data: any) {
        try {
            const Manager = Contact.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                const updates = Object.keys(data);
                const allowedupdates = [
                    'name',
                    'email',
                    'message'
                ];
                const contact = await transactionalEntityManager.findOneByOrFail(Contact, { _id: data._id });
                if (!contact) {
                    throw new Error("contact not found");
                }
                const isvalidoperation = updates.every((update) => {
                    return allowedupdates.includes(update as string);
                });
                if (!isvalidoperation) {
                    throw new Error({ error: "Invalid updates" } as unknown as string);
                }
                updates.forEach((update) => {
                    contact[update] = data[update];
                });

                await transactionalEntityManager.save(contact);
                return this;
            })
        } catch (error) {
            return new Error(error);
        }
    }

    async removeContact(contact_id: string) {
        try {
            const Manager = Contact.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                const contact = await transactionalEntityManager.delete(Contact, { _id: contact_id });
                await transactionalEntityManager.save(contact);
                return contact;
            })
        } catch (error) {
            return new Error(error);
        }
    }

}

export default Contact;
