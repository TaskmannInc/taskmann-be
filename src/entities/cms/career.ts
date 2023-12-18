import path from 'path';
import { ValidationError, MinLength, MaxLength, IsNotEmpty, IsString, Length, validate, validateOrReject, IsUrl } from 'class-validator';
import { AfterInsert, BaseEntity, BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn, getRepository } from 'typeorm';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import CloudinaryService from '../../services/cloudinary';



/**
 * @description Career entity            
 */
@Entity('careers')
class Career extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    _id!: string;

    @Column({
        nullable: false,
        unique: false
    })
    position!: string;

    @Column({
        nullable: false,
        unique: false
    })
    location!: string;

    @Column({
        nullable: false,
        unique: false
    })
    description!: string;

    @Column({
        nullable: false,
    })
    status!: boolean;

    @Column({
        nullable: false,
        unique: false
    })
    link!: string;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    //TODO: send this content to email

    static async createCareer(data: any) {
        try {
            const Manager = this.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                const career = await transactionalEntityManager.create(Career, data);
                if (career.status == 'true' ) {
                    career.status = true; 
                }
                await transactionalEntityManager.save(career);
                return career;
            })
        } catch (error) {
            return new Error(error.message);
        }
    }

    async updateCareer(data: any) {
        try {
            const Manager = Career.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                const updates = Object.keys(data);
                const career = this// await transactionalEntityManager.findOneBy(Service, { _id: _id });
                if (!career) {
                    throw new Error("career not found");
                }
                if (data.status == 'true') {
                    data.status = true; 
                }
                Object.assign(career, data);
                await transactionalEntityManager.save(career);
                return career;
            })
        } catch (error) {
            return new Error(error.message);
        }
    }

    async removeCareer(contact_id: string) {
        try {
            const Manager = Career.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                const career = await transactionalEntityManager.delete(Career, { _id: contact_id });
                await transactionalEntityManager.save(career);
                return career;
            })
        } catch (error) {
            return new Error(error);
        }
    }


}


export default Career;
