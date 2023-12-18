import path from 'path';
import { ValidationError, MinLength, MaxLength, IsNotEmpty, IsString, Length, validate, validateOrReject, IsUrl } from 'class-validator';
import { AfterInsert, BaseEntity, BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn, getRepository } from 'typeorm';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import CloudinaryService from '../../services/cloudinary';



/**
 * @description About Us entity            
 */
@Entity('about_us')
class AboutUs extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    _id!: string;

    @Column({
        nullable: false,
        unique: false
    })
    header!: string;

    @Column({
        nullable: true,
        type: "simple-json",
        default: () => "('{}')",
    })
    content_image!: { cloudinary_id: string, image_url: string, asset_id: string };

    @Column({
        nullable: true,
        unique: false,
        type: "text"
    })
    content!: string;

    @Column({
        nullable: false,
        unique: false
    })
    created_by!: string;

    @Column({
        nullable: false,
        unique: false
    })
    last_updated_by!: string;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;


    static async createAboutUs(data: any) {
        try {
            const Manager = this.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                console.log('req data', data);
                const about_us = await transactionalEntityManager.create(AboutUs, data.body);
                console.log('about_us 1', about_us);
                // await validateOrReject(vault);
                console.log('about_us 2', data.staff);
                about_us.created_by = data.staff.last_name + ' ' + data.staff.first_name;
                about_us.last_updated_by = data.staff.last_name + ' ' + data.staff.first_name;
                console.log('about_us 0', about_us);
                console.log('file', data.file);
                if (data.file) {
                    console.log('about_us 3');
                    const cs = new CloudinaryService();
                    const file = await cs.uploadfile(data.file.path);
                    about_us.content_image = { cloudinary_id: file.public_id, image_url: file.url, asset_id: file.asset_id };
                    await transactionalEntityManager.save(about_us);
                    return about_us;
                }
                await transactionalEntityManager.save(about_us);
                return about_us;
            })

        } catch (error) {
            return new Error(error.message);
        }

    }

    async updateAboutUs(data: any) {
        try {
            const Manager = AboutUs.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                // const updates = Object.keys(data);
                // const allowedupdates = [
                //     'header',
                //     'content',
                // ];
                const about_us = this; // await transactionalEntityManager.findOneByOrFail(AboutUs, { _id: data._id });
                if (!about_us) {
                    throw new Error("data not found");
                }
                about_us.last_updated_by = data.staff.last_name + ' ' + data.staff.first_name;
                if (data.file) {
                    const cs = new CloudinaryService();
                    const file = await cs.uploadfile(data.file.path);
                    data.body.content_image = { cloudinary_id: file.public_id, image_url: file.url, asset_id: file.asset_id };
                    Object.assign(about_us, data.body);
                    await transactionalEntityManager.save(about_us);
                    // await transactionalEntityManager.update(Service, { _id: service._id }, service);
                    return about_us;
                }
                Object.assign(about_us, data.body);
                await transactionalEntityManager.save(about_us);
                return about_us;
            })
        } catch (error) {
            return new Error(error.message);
        }
    }

    async removeAboutUs(id: string) {
        try {
            const Manager = AboutUs.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                const about_us = await transactionalEntityManager.delete(AboutUs, { _id: id });
                await transactionalEntityManager.save(about_us);
                return about_us;
            })
        } catch (error) {
            return new Error(error);
        }
    }

}

export default AboutUs;
