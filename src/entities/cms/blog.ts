import path from 'path';
import { ValidationError, MinLength, MaxLength, IsNotEmpty, IsString, Length, validate, validateOrReject, IsUrl } from 'class-validator';
import { AfterInsert, BaseEntity, BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn, getRepository } from 'typeorm';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import CloudinaryService from '../../services/cloudinary';



/**
 * @description Blog entity            
 */
@Entity('blogs')
class Blog extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    _id!: string;

    @Column({
        nullable: true,
        unique: false
    })
    title!: string;

    @Column({
        nullable: false,
        unique: true
    })
    content!: string;

    @Column({
        nullable: false,
        unique: false
    })
    author!: string;

    @Column({
        nullable: true,
        type: "simple-json",
        default: () => "('{}')",
    })
    blog_image!: { cloudinary_id: string, image_url: string, asset_id: string };

    @Column({
        nullable: true,
        unique: false
    })
    category!: string;

    @Column({
        nullable: true,
        unique: false,
        default: true
    })
    active!: boolean;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;


    static async createBlog(data: any) {
        try {
            const Manager = this.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                console.log('data', data.body);
                const blog = await transactionalEntityManager.create(Blog, data.body);
                if (blog.active == 'true') {
                    blog.active = true;
                }
                console.log('blog', blog);

                // await validateOrReject(vault);
                // console.log('pathhs',data.file);
                if (data.file) {
                    const cs = new CloudinaryService();
                    const file = await cs.uploadfile(data.file.path);
                    blog.blog_image = { cloudinary_id: file.public_id, image_url: file.url, asset_id: file.asset_id };
                    await transactionalEntityManager.save(blog);
                    return blog;
                }
                await transactionalEntityManager.save(blog);
                return blog;
            })

        } catch (error) {
            return new Error(error.message);
        }
    }


    async updateBlog(data: any) {
        try {
            const Manager = Blog.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                const blog = this// await transactionalEntityManager.findOneBy(Service, { _id: _id });
                if (!blog) {
                    throw new Error("blog not found");
                }
                if (data.body.active == 'true') {
                    data.body.active = true;
                }
                // TODO remove empty fields
                if (data.file) {
                    const cs = new CloudinaryService();
                    const file = await cs.uploadfile(data.file.path);
                    data.body.blog_image = { cloudinary_id: file.public_id, image_url: file.url, asset_id: file.asset_id };
                    // await transactionalEntityManager.save(service);
                    await transactionalEntityManager.update(Blog, { _id: blog._id }, data.body);
                    return blog;
                }
                Object.assign(blog, data.body);
                // console.log('blog', blog);
                await transactionalEntityManager.save(blog);
                // await transactionalEntityManager.update(Service, { _id: service._id }, service);
                return blog;
            })
        } catch (error) {
            return new Error(error.message);
        }
    }

    async removeBlog(blog_id: string) {
        try {
            const Manager = Blog.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                const blog = await transactionalEntityManager.delete(Blog, { _id: blog_id });
                await transactionalEntityManager.save(blog);
                return blog;
            })
        } catch (error) {
            return new Error(error);
        }
    }

}

export default Blog;
