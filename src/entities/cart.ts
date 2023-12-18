import { Repository, BaseEntity, Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, OneToOne, JoinColumn, Unique } from "typeorm";
import Customer from "./customer";
import Payment from "./payment";
import line_item_object from "../interfaces/utils";
import { v4 as uuid } from 'uuid';
import { Transform } from 'class-transformer';
import Decimal from 'decimal.js';
import { DecimalToString, DecimalTransformer, ColumnNumericTransformer } from '../utils/util';
import Order from "./order";


/**
 * @description cart schema
 * @table cart 
 */
@Entity('carts')
class Cart extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    _id!: string;

    @Column({
        nullable: true,
        unique: false,
        type: 'decimal',
        //precision: 2, 
        scale: 2,
        default: 0.0,
        transformer: new ColumnNumericTransformer()
        //type: 'numeric', // Change the data type to numeric
    })
    // @Transform(DecimalToString(), { toPlainOnly: true })
    total_items!: Decimal;

    @Column({
        nullable: true,
        unique: false,
        type: 'decimal',
        //precision: 2,
        scale: 2,
        default: 0.0,
        transformer: new ColumnNumericTransformer()
        //type: 'numeric', // Change the data type to numeric
    })
    // @Transform(DecimalToString(), { toPlainOnly: true })
    total_price!: Decimal;

    //     export class AccountEntity {
    //     @Column({ 
    //         name: 'balance', type: 'decimal', precision: 10, scale: 2, default: 0.0, transformer: new DecimalTransformer() })
    //     @Transform(DecimalToString(), { toPlainOnly: true })
    //     public balance: Decimal;
    // }

    // @Column({
    //     nullable: true,
    //     unique: false,
    // })
    // description!: string;

    @Column({
        nullable: false,
        default: true
    })
    active!: boolean;

    @Column({
        nullable: false,
        default: false
    })
    closed!: boolean;


    @Column({
        nullable: false,
        unique: false,
        type: "jsonb"
    })
    line_items!: line_item_object[];

    @ManyToOne(() => Customer, (customer) => customer.cart, {
        nullable: false,
        onUpdate: 'CASCADE',
        eager: true
        // onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'customer' })
    // @Unique("customer_constraint", ["customer"]) // Define a unique constraint
    customer!: Customer;

    @OneToOne(() => Payment, (payment) => payment.cart, {
        // nullable: true,
        // onUpdate: 'CASCADE',
        cascade: true
        // eager: true
        // onDelete: 'CASCADE'
    })
    @JoinColumn()
    //@JoinColumn({ name: 'payment' })
    payment!: Payment;


    @OneToOne(() => Order, (order) => order.cart, {
        // nullable: true,
        // onUpdate: 'CASCADE',
        // eager: false
        // onDelete: 'CASCADE'
    })
    // @JoinColumn({ name: 'order' })
    order!: Order;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    static async addtocart(cart_object: line_item_object[], customer_id: string): Promise<any> {
        try {
            const Manager = this.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                let total_quantity = 0;
                let total_cost = 0;
                for (let i = 0; i < cart_object.length; i++) {
                    cart_object[i]['id'] = uuid();
                    for (let j = 0; j < cart_object[i].packageDetails.length; j++) {
                        total_quantity += Number(cart_object[i].packageDetails[j].quantity) as number;
                        cart_object[i].packageDetails[j].unitCost = Number(cart_object[i].packageDetails[j].unitCost);
                        cart_object[i].packageDetails[j].totalCost = Number(cart_object[i].packageDetails[j].quantity) * Number(cart_object[i].packageDetails[j].unitCost);
                        total_cost += Number(cart_object[i].packageDetails[j].totalCost);
                    }
                }
                // console.log('total cost', total_cost, total_quantity, cart_object, typeof total_cost);
                // let myuuid = uuid();

                let cart = await transactionalEntityManager.findOne(Cart, { where: { customer: { _id: customer_id }, closed: false, active: true } });
                console.log('cart.............', cart);
                if (cart) {
                    cart.line_items['service_date'] = new Date(cart_object['service_date']);
                    cart.line_items['service_name'] = cart_object['service_name'];
                    cart.line_items = cart.line_items.concat(cart_object)  //;.push(cart_object);
                    cart.total_items = total_quantity + Number(cart.total_items);
                    cart.total_price = total_cost + Number(cart.total_price);
                    await transactionalEntityManager.save(cart);
                }
                else {
                    cart = new Cart();
                    cart.line_items = cart_object;
                    cart.total_items = Number(total_quantity);
                    cart.total_price = Number(total_cost);
                    cart.customer = customer_id as any;
                    cart.active = true;
                    cart.closed = false;
                    await transactionalEntityManager.save(cart);
                }
                // await transactionalEntityManager
                //     .createQueryBuilder()
                //     .insert()
                //     .into(Cart)
                //     .values([cart])
                //     .orUpdate(['total_price', 'total_items', 'line_items'], ['customer'])
                //     //.orUpdate({ conflict_target: ['customer'], overwrite: ['total_price', 'total_items', 'line_items'] })
                //     .setParameters({
                //         total_price: Number(cart.total_price),
                //         total_items: Number(cart.total_items)
                //     })
                //     .execute();
                return cart;
            });
        }
        catch (error) {
            throw new Error('Error adding to cart');
        }
    }

    async updatecart(cart_object: line_item_object): Promise<any> {
        try {
            const Manager = Cart.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                //const cart = await transactionalEntityManager.findOneBy(Cart, { customer: { _id: customer_id }, closed: false, active: true });
                const cart = this// await transactionalEntityManager.findOneBy(Service, { _id: _id });
                if (!cart) {
                    throw new Error("Cart not found or cart is closed");
                }
                let total_quantity = 0;
                let total_cost = 0;
                let line_items = cart.line_items;
                let index = line_items.findIndex(obj => obj.id === cart_object.id);
                // cart_object.packageDetails.forEach((element: any) => {
                //     element.totalCost = element.quantity * element.unitCost;
                // });
                cart.line_items[index] = cart_object;
                console.log('updated cart', cart);
                for (let i = 0; i < cart.line_items.length; i++) {
                    for (let j = 0; j < cart.line_items[i].packageDetails.length; j++) {
                        total_quantity += Number(cart.line_items[i].packageDetails[j].quantity);
                        cart.line_items[i].packageDetails[j].totalCost = Number(cart.line_items[i].packageDetails[j].quantity) * Number(cart.line_items[i].packageDetails[j].unitCost);
                        total_cost += Number(cart.line_items[i].packageDetails[j].totalCost);
                    }
                    cart.total_items = Number(total_quantity);
                    cart.total_price = Number(total_cost);
                    // if ()
                }
                await transactionalEntityManager.save(cart);
                //Object.assign(cart, cart_object);
                //await transactionalEntityManager.save(cart);
                // await transactionalEntityManager.update(Subservice, { _id: subservice._id }, data.body);
                return cart;
            });
        }
        catch (error) {
            throw new Error('Error updating cart');
        }
    }

    async deletecart(cart_object_id: string): Promise<any> {
        try {
            const Manager = Cart.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                const cart = this// await transactionalEntityManager.findOneBy(Service, { _id: _id });
                if (!cart) {
                    throw new Error("Cart not found");
                }
                let line_items = cart.line_items;
                let index = line_items.findIndex(obj => obj.id === cart_object_id);
                console.log('index', index);
                if (index === -1) {
                    throw new Error("Cart object not found");
                }
                cart.line_items.splice(index, 1);
                let total_quantity = 0;
                let total_cost = 0;
                console.log('updated cart', cart.line_items.length);
                for (let i = 0; i < cart.line_items.length; i++) {
                    for (let j = 0; j < cart.line_items[i].packageDetails.length; j++) {
                        total_quantity += cart.line_items[i].packageDetails[j].quantity;
                        cart.line_items[i].packageDetails[j].totalCost = cart.line_items[i].packageDetails[j].quantity * cart.line_items[i].packageDetails[j].unitCost;
                        total_cost += cart.line_items[i].packageDetails[j].totalCost;
                    }
                }
                cart.total_items = total_quantity;
                cart.total_price = total_cost;
                await transactionalEntityManager.save(cart);
                return cart;
            });
        }
        catch (error) {
            throw new Error('Error deleting from cart');
        }
    }

    // checkout cart
    static async checkout(cart_id: string): Promise<any> {
    }

}

export default Cart;