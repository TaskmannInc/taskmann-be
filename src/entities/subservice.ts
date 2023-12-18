import { Repository, BaseEntity, Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, OneToOne, JoinColumn } from "typeorm";
import Staff from "./staff";
import Customer from "./customer";
import Service from "./service";
import Pricetier from "./pricetier";
import CloudinaryService from "../services/cloudinary";


/**
 * @description SubService schema            
 */
@Entity('subservices')
class Subservice extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    _id!: string;

    @Column({
        nullable: false,
        unique: true,
    })
    sub_service_name!: string;

    @Column({
        nullable: true
    })
    description!: string;

    @Column({
        nullable: false,
        default: true
    })
    active!: boolean;

    @Column({
        nullable: true,
        type: "jsonb",
        default : []
        // default: () => "('{}')",
    })
    subservice_image!: { cloudinary_id: string, image_url: string, asset_id: string, primary_image: boolean }[];

    @ManyToOne(() => Service, (service) => service.subservice, {
        nullable: false,
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'service_id' }) // this creates a foreign key constraint
    service!: Service;


    @OneToMany(() => Pricetier, (pricetier) => pricetier.subservice, {
        cascade: true,
        eager: true
    })
    pricetier!: Pricetier[];

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    static async createSubservice(data: any) {
        try {
            const Manager = this.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                const subservice = await transactionalEntityManager.create(Subservice, data.body);
                if (subservice.active == 'true') {
                    subservice.active = true;
                }
                // await validateOrReject(vault);
                // console.log('pathhs',data.file);
                if (data.files.length >= 1) {
                    subservice.subservice_image = [];
                    let primary_image = true;
                    const cs = new CloudinaryService();
                    
                    for (const file_object of data.files) {
                        const file = await cs.uploadfile(file_object.path);
                        subservice.subservice_image.push({ cloudinary_id: file.public_id, image_url: file.url, asset_id: file.asset_id, primary_image });
                        primary_image = false;
                    }
                    await transactionalEntityManager.save(subservice);
                    return subservice;
                }
                await transactionalEntityManager.save(subservice);
                return subservice;
            })
        } catch (error) {
            return new Error(error.message);
        }
    }

    async updateSubservice(data: any) {
        try {
            const Manager = Subservice.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                const subservice = this// await transactionalEntityManager.findOneBy(Service, { _id: _id });
                if (!subservice) {
                    throw new Error("subservice not found");
                }
                if (data.body.active == 'true') {
                    data.body.active = true;
                }

                // TODO remove empty fields
                if (data.files.length >= 1) {
                    const cs = new CloudinaryService();
                    for (const file_object of data.files) {
                        const file = await cs.uploadfile(file_object.path);
                        subservice.subservice_image.push({ cloudinary_id: file.public_id, image_url: file.url, asset_id: file.asset_id, primary_image: false });
                    }
                    
                    Object.assign(subservice, data.body);
                    console.log('subservice', subservice);
                    await transactionalEntityManager.save(subservice);
                    console.log('subservice', subservice);
                    return subservice;
                }
                Object.assign(subservice, data.body);
                await transactionalEntityManager.save(subservice);
                // await transactionalEntityManager.update(Service, { _id: service._id }, service);
                return subservice;

            })
        } catch (error) {
            return new Error(error.message);
        }
    }

    

    async removeSubservice(_id: string) {
        try {
            const Manager = Subservice.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                await transactionalEntityManager.delete(Subservice, { _id: _id });
                // await transactionalEntityManager.save(service);
                // return service;
            })
        } catch (error) {
            return new Error(error.message);
        }
    }

}
export default Subservice;