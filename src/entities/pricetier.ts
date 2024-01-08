import { Repository, BaseEntity, Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, OneToOne, JoinColumn, Unique } from "typeorm";
import Staff from "./staff";
import Customer from "./customer";
import Service from "./service";
import Subservice from "./subservice";
import { cost_parameters } from "../enums/enum";

/**
 * @description Pricetier schema            
 */
@Entity('pricetiers')
@Unique(["tier_name", "subservice"])
class Pricetier extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    _id!: string;

    @Column({
        nullable: false,
        unique: false
    })
    //TODO: we can make this field predefined using enum
    tier_name!: string;

    @Column({
        nullable: true
    })
    description!: string;

    @Column({
        nullable: true
    })
    duration!: number;

    @Column({
        nullable: false,
        default: true
    })
    active!: boolean;

    @Column({
        nullable: false
    })
    price!: number;

    @Column({
        nullable: true,
        type: "jsonb",
        // enum: cost_parameters,
        // array: true,
    })
    cost_parameters!: object[];


    @ManyToOne(() => Subservice, (subservice) => subservice.pricetier, {
        nullable: false,
        onUpdate: 'CASCADE',
        // eager: true
        // onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'subservice_id' })
    subservice!: Subservice;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    static async createPricetier(data) {
        try {
            const Manager = this.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                const pricetier = await transactionalEntityManager.create(Pricetier, data);
                console.log('data', pricetier);
                await transactionalEntityManager.save(pricetier);
                return pricetier;
            })
        }
        catch (error) {
            return new Error(error.message);
        }
    }

    async updatePricetier(data) {
        try {
            const Manager = Pricetier.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                // const updates = Object.keys(data);
                // const allowedupdates = [
                //     "tier_name",
                //     "description",
                //     "active",
                //     "price"
                // ];
                const pricetier = await transactionalEntityManager.findOneBy(Pricetier, { _id: data._id });
                if (!pricetier) {
                    throw new Error("Pricetier not found");
                }
                Object.assign(pricetier, data);
                await transactionalEntityManager.save(pricetier);
                return pricetier;
            })
        }
        catch (error) {
            return new Error(error);
        }
    }

    async removePricetier() {
        try {
            const Manager = Pricetier.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                const pricetier = await transactionalEntityManager.remove(this);
                await transactionalEntityManager.save(pricetier);
                return pricetier;
            })
        }
        catch (error) {
            return new Error(error);
        }
    }

}
export default Pricetier;