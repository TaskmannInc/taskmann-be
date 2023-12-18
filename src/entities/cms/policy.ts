import path from 'path';
import { ValidationError, MinLength, MaxLength, IsNotEmpty, IsString, Length, validate, validateOrReject, IsUrl } from 'class-validator';
import { AfterInsert, BaseEntity, BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn, getRepository } from 'typeorm';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import CloudinaryService from '../../services/cloudinary';



/**
 * @description Policy Us entity            
 */
@Entity('policies')
class Policy extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    _id!: string;

    @Column({
        nullable: false,
        unique: false
    })
    policy_name!: string;

    @Column({
        nullable: false,
        unique: false
    })
    policy_description!: string;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    static async createPolicy(data: any) {
        try {
            const Manager = this.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                const policy = await transactionalEntityManager.create(Policy, data);
                // await validateOrReject(vault);
                await transactionalEntityManager.save(policy);
                return policy;
            })

        } catch (error) {
            return new Error(error);
        }

    }

    async updatePolicy(data: any) {
        try {
            const Manager = Policy.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                const policy = this// await transactionalEntityManager.findOneBy(Service, { _id: _id });
                if (!policy) {
                    throw new Error("policy not found");
                }
                Object.assign(policy, data);
                // console.log('blog', blog);
                await transactionalEntityManager.save(policy);
                // await transactionalEntityManager.update(Service, { _id: service._id }, service);
                return policy;
            })
        } catch (error) {
            return new Error(error).message;
        }
    }

    async removePolicy(policy_id: string) {
        try {
            const Manager = Policy.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                const policy = await transactionalEntityManager.delete(Policy, { _id: policy_id });
                await transactionalEntityManager.save(policy);
                return policy;
            })
        } catch (error) {
            return new Error(error);
        }
    }

}

export default Policy;
