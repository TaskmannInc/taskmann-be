import path from 'path';
import { ValidationError, MinLength, MaxLength, IsNotEmpty, IsString, Length, validate, validateOrReject, IsUrl } from 'class-validator';
import { AfterInsert, BaseEntity, BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn, getRepository } from 'typeorm';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import CloudinaryService from '../../services/cloudinary';



/**
 * @description Reviews entity            
 */
@Entity('reviews_tesimonies')
class ReviewTestimony extends BaseEntity {

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
    statement!: string;

    @Column({
        nullable: false,
        unique: false
    })
    rating!: string;

    @Column({
        nullable: false,
        unique: false
    })
    email!: string;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    static async createTestimonyReview(data: any) {
        try {
            const Manager = this.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                const reviewtestimony = await transactionalEntityManager.create(ReviewTestimony, data);
                // await validateOrReject(vault);
                await transactionalEntityManager.save(reviewtestimony);
                return reviewtestimony;
            })

        } catch (error) {
            return new Error(error);
        }

    }

    async updateReviewTestimony(data: any) {
        try {
            const Manager = ReviewTestimony.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                const updates = Object.keys(data);
                const allowedupdates = [
                    'name',
                    'statement'
                ];
                const reviewtestimony = await transactionalEntityManager.findOneByOrFail(ReviewTestimony, { _id: data._id });
                if (!reviewtestimony) {
                    throw new Error("No review or testimony found");
                }
                const isvalidoperation = updates.every((update) => {
                    return allowedupdates.includes(update as string);
                });
                if (!isvalidoperation) {
                    throw new Error({ error: "Invalid updates" } as unknown as string);
                }
                updates.forEach((update) => {
                    reviewtestimony[update] = data[update];
                });

                await transactionalEntityManager.save(reviewtestimony);
                return this;
            })
        } catch (error) {
            return new Error(error);
        }
    }

    async removeReviewTestimony(team_id: string) {
        try {
            const Manager = ReviewTestimony.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                const reviewtestimony = await transactionalEntityManager.delete(ReviewTestimony, { _id: team_id });
                await transactionalEntityManager.save(reviewtestimony);
                return reviewtestimony;
            })
        } catch (error) {
            return new Error(error);
        }
    }
}
export default ReviewTestimony;
