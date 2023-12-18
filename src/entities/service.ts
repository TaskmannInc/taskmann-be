import { Repository, BaseEntity, Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, OneToOne, JoinColumn } from "typeorm";
import Subservice from "./subservice";
import CloudinaryService from '../services/cloudinary';
import { IsBoolean } from "class-validator";
import { Transform } from "class-transformer";


/**
 * @description Service schema            
 */
@Entity('services')
class Service extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    _id!: string;

    @Column({
        nullable: false,
        unique: true
    })
    service_name!: string;

    @Column({
        nullable: true
    })
    description!: string;

    @IsBoolean()
    @Transform(({ value }) => value === 'true')
    @Column({
        nullable: false,
        default: false
    })
    active!: boolean;

    // @Column({
    //     nullable: true,
    //     type: "simple-json",
    //     //default: () => "('{}')",
    // })
    // service_image!: [{ cloudinary_id: string, image_url: string, asset_id: string, primary_image: boolean }];

    @Column('jsonb', { 
        nullable: true, 
        default: [] 
    })
    service_image: { cloudinary_id: string, image_url: string, asset_id: string, primary_image: boolean }[];

    @OneToMany(() => Subservice, (subservice) => subservice.service, {
        cascade: true,
        eager: true
    })
    subservice!: Subservice[];

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;


    static async createService(data: any) {
        try {
            const Manager = this.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                const service = await transactionalEntityManager.create(Service, data.body);
                if (service.active == 'true') {
                    service.active = true;
                }
                // await validateOrReject(vault);
                if (data.files.length >= 1) {
                    service.service_image = [];
                    let primary_image = true;
                    const cs = new CloudinaryService();
                    // await data.files.forEach(async (file_object: any) => {
                    //     // console.log('file_object', file_object);
                    //     const file = await cs.uploadfile(file_object.path);
                    //     service.service_image.push({ cloudinary_id: file.public_id, image_url: file.url, asset_id: file.asset_id, primary_image });
                    //     // console.log('service_image', service.service_image);
                    //     primary_image = false;
                    // });
                    for (const file_object of data.files) {
                        const file = await cs.uploadfile(file_object.path);
                        await service.service_image.push({ cloudinary_id: file.public_id, image_url: file.url, asset_id: file.asset_id, primary_image });
                        primary_image = false;
                    }
                    await transactionalEntityManager.save(service);
                    return service;
                }
                await transactionalEntityManager.save(service);
                return service;
            })

        } catch (error) {
            return new Error(error.message);
        }
    }

    async updateService(data: any) {
        try {
            const Manager = Service.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                const service = this// await transactionalEntityManager.findOneBy(Service, { _id: _id });
                if (!service) {
                    throw new Error("Service not found");
                }
                if (data.body.active == 'true') {
                    data.body.active = true;
                }
                // await transactionalEntityManager
                //     .createQueryBuilder()
                //     .insert(Service)
                //     .set(data)
                //     .where("_id = :_id", { _id: service._id })
                //     .execute();
                //.update(Service, { _id: service._id }, data);
                // TODO remove empty fields
                if (data.files.length >= 1) {
                    const cs = new CloudinaryService();
                    for (const file_object of data.files) {
                        const file = await cs.uploadfile(file_object.path);
                        service.service_image.push({ cloudinary_id: file.public_id, image_url: file.url, asset_id: file.asset_id, primary_image: false});
                    }
                    // const file = await cs.uploadfile(data.file.path);
                    // data.body.service_image = { cloudinary_id: file.public_id, image_url: file.url, asset_id: file.asset_id };
                    // await transactionalEntityManager.save(service);
                    Object.assign(service, data.body);
                    console.log('service', service);
                    // await transactionalEntityManager.update(Service, { _id: service._id }, service);
                    await transactionalEntityManager.save(service);
                    console.log('service', service);
                    return service;
                }
                Object.assign(service, data.body);
                await transactionalEntityManager.save(service);
                // await transactionalEntityManager.update(Service, { _id: service._id }, service);
                return service;
            })
        } catch (error) {
            return new Error(error.message);
        }
    }


    static async addServiceImage(service_id: string, image: any) {
        try {
            const Manager = this.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                const service = await transactionalEntityManager.findOneByOrFail(Service, { _id: service_id });
                if (!service) {
                    throw new Error("Service not found");
                }
                service.service_image = image;
                await service.save();
                return service;
            })
        }
        catch (error) {
            throw new Error(error.message);
        }
    }

    async removeService(service_id: string) {
        try {
            const Manager = Service.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                await transactionalEntityManager.delete(Service, { _id: service_id });
                // await transactionalEntityManager.save(service);
                // return service;
            })
        } catch (error) {
            return new Error(error.message);
        }
    }

}
export default Service;


