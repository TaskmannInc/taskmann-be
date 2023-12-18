import path from 'path';
import { ValidationError, MinLength, MaxLength, IsNotEmpty, IsString, Length, validate, validateOrReject, IsUrl } from 'class-validator';
import { AfterInsert, BaseEntity, BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn, getRepository } from 'typeorm';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import CloudinaryService from '../../services/cloudinary';



/**
 * @description FAQs entity            
 */
@Entity('faqs')
class FAQ extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    _id!: string;

    @Column({
        nullable: false,
        unique: false
    })
    question!: string;

    @Column({
        nullable: false,
        unique: false
    })
    answer!: string;

    @Column({
        nullable: true,
        unique: false,
        default: true
    })
    active!: boolean;

    @Column({
        nullable: true,
        unique: true,
    })
    category!: string;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    static async createFAQ(data: any) {
        try {
            const Manager = this.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                if (data.active == 'true') {
                    data.active = true;
                }
                const faq = await transactionalEntityManager.create(FAQ, data);
                // await validateOrReject(vault);
                await transactionalEntityManager.save(faq);
                return faq;
            })

        } catch (error) {
            return new Error(error);
        }

    }


    async updateFAQ(data: any) {
        try {
            const Manager = FAQ.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                const faq = this// await transactionalEntityManager.findOneBy(Service, { _id: _id });
                if (!faq) {
                    throw new Error("faq not found");
                }
                if (data.active == 'true') {
                    data.active = true;
                }
                // TODO remove empty fields
                // if (data.file) {
                //     const cs = new CloudinaryService();
                //     const file = await cs.uploadfile(data.file.path);
                //     data.body.blog_image = { cloudinary_id: file.public_id, image_url: file.url, asset_id: file.asset_id };
                //     // await transactionalEntityManager.save(service);
                //     await transactionalEntityManager.update(Blog, { _id: blog._id }, data.body);
                //     return blog;
                // }

                Object.assign(faq, data);
                // console.log('blog', blog);
                await transactionalEntityManager.save(faq);
                // await transactionalEntityManager.update(Service, { _id: service._id }, service);
                return faq;
            })
        } catch (error) {
            return new Error(error.message);
        }
    }

    async removeFAQ(policy_id: string) {
        try {
            const Manager = FAQ.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                const faq = await transactionalEntityManager.delete(FAQ, { _id: policy_id });
                await transactionalEntityManager.save(faq);
                return faq;
            })
        } catch (error) {
            return new Error(error);
        }
    }

}
export default FAQ;
