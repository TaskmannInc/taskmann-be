import path from 'path';
import { ValidationError, MinLength, MaxLength, IsNotEmpty, IsString, Length, validate, validateOrReject, IsUrl } from 'class-validator';
import { AfterInsert, BaseEntity, BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn, getRepository } from 'typeorm';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import CloudinaryService from '../../services/cloudinary';



/**
 * @description Team entity            
 */
@Entity('teams')
class Team extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    _id!: string;

    @Column({
        nullable: false,
        unique: false
    })
    name!: string;

    @Column({
        nullable: false,
        unique: false
    })
    position!: string;

    @Column({
        nullable: false,
        unique: false
    })
    message!: string;

    @Column({
        nullable: true,
        type: "simple-json",
        default: () => "('{}')",
    })
    member_image!: { cloudinary_id: string, image_url: string, asset_id: string };

    // static async createTeam(data: any) {
    //     try {
    //         const Manager = this.getRepository().manager;
    //         return Manager.transaction(async transactionalEntityManager => {
    //             const team = await transactionalEntityManager.create(Team, data);
    //             // await validateOrReject(vault);
    //             await transactionalEntityManager.save(team);
    //             return team;
    //         })

    //     } catch (error) {
    //         return new Error(error);
    //     }

    // }

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;


    static async createTeam(data: any) {
        try {
            const Manager = this.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                const team = await transactionalEntityManager.create(Team, data.body);
    
                // await validateOrReject(vault);
                // console.log('pathhs',data.file);
                if (data.file) {
                    const cs = new CloudinaryService();
                    const file = await cs.uploadfile(data.file.path);
                    team.member_image = { cloudinary_id: file.public_id, image_url: file.url, asset_id: file.asset_id };
                    await transactionalEntityManager.save(team);
                    return team;
                }
                await transactionalEntityManager.save(team);
                return team;
            })

        } catch (error) {
            return new Error(error.message);
        }
    }


    async updateTeam(data: any) {
        try {
            const Manager = Team.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                const team = this// await transactionalEntityManager.findOneBy(Service, { _id: _id });
                if (!team) {
                    throw new Error("team not found");
                }
                // if (data.body.active == 'true') {
                //     data.body.active = true;
                // }
                // TODO remove empty fields
                if (data.file) {
                    const cs = new CloudinaryService();
                    const file = await cs.uploadfile(data.file.path);
                    data.body.member_image = { cloudinary_id: file.public_id, image_url: file.url, asset_id: file.asset_id };
                    // await transactionalEntityManager.save(service);
                    await transactionalEntityManager.update(Team, { _id: team._id }, data.body);
                    return team;
                }
                Object.assign(team, data.body);
                // console.log('blog', blog);
                await transactionalEntityManager.save(team);
                // await transactionalEntityManager.update(Service, { _id: service._id }, service);
                return team;
            })
        } catch (error) {
            return new Error(error.message);
        }
    }


    // async updateTeam(data: any) {
    //     try {
    //         const Manager = Team.getRepository().manager;
    //         return Manager.transaction(async transactionalEntityManager => {
    //             const updates = Object.keys(data);
    //             const allowedupdates = [
    //                 'name',
    //                 'position',
    //                 'message'
    //             ];
    //             const team = await transactionalEntityManager.findOneByOrFail(Team, { _id: data._id });
    //             if (!team) {
    //                 throw new Error("Team not found");
    //             }
    //             const isvalidoperation = updates.every((update) => {
    //                 return allowedupdates.includes(update as string);
    //             });
    //             if (!isvalidoperation) {
    //                 throw new Error({ error: "Invalid updates" } as unknown as string);
    //             }
    //             updates.forEach((update) => {
    //                 team[update] = data[update];
    //             });

    //             await transactionalEntityManager.save(team);
    //             return this;
    //         })
    //     } catch (error) {
    //         return new Error(error);
    //     }
    // }

    async removeTeam(team_id: string) {
        try {
            const Manager = Team.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                const team = await transactionalEntityManager.delete(Team, { _id: team_id });
                await transactionalEntityManager.save(team);
                return team;
            })
        } catch (error) {
            return new Error(error);
        }
    }
}

export default Team;
