import { Repository, BaseEntity, Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, OneToOne, JoinColumn } from "typeorm";
import Staff from "./staff";
import Customer from "./customer";
import Service from "./service";
import { order_status, task_status } from "../enums/enum";
// import orderCode from "../utils/orderCode";
import UtilSever from "../utils/util";
import Cart from "./cart";
import Payment from "./payment";
import Task from "./task";
// import Payment from "../payments/payment";



/**
 * @description Order schema            
 */
@Entity('orders')
class Order extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    _id!: string;

    @Column({
        type: "enum",
        enum: order_status,
        default: order_status.PENDING
    })
    status!: order_status;

    @Column({
        type: 'varchar',
        nullable: true
    })
    cancellation_code!: string;

    @Column({
        type: 'varchar',
        nullable: true
    })
    inprogress_code!: string;

    @Column({
        type: 'varchar',
        nullable: true
    })
    completed_code!: string;

    @OneToOne(() => Task, (task) => task.order, {
        nullable: true,
        onUpdate: 'CASCADE',
        
        eager: true,
        cascade: false
        // onDelete: 'CASCADE'
    })
    task: Task;

    @OneToOne(() => Payment, (payment) => payment.order, {
        nullable: true,
        onUpdate: 'CASCADE',
        eager: true
    })
    @JoinColumn({ name: 'payment' })
    payment!: Payment;

    @OneToOne(() => Cart, (cart) => cart.order, {
        nullable: true,
        onUpdate: 'CASCADE',
        eager: true
        // onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'cart' })
    cart!: Cart;

    @ManyToOne(() => Customer, (customer) => customer.orders, {
        nullable: false,
        onUpdate: 'CASCADE',
        eager: true
        // onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'customer' })
    customer!: Customer;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    
    /**
     * 
     * @param cart_id id of the cart to be used to create the order
     * @returns 
     */
    static async createOrder(cart_id: string, customer_id: string): Promise<any> {
        try {

            const Manager = this.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                const cart_item = await transactionalEntityManager.findOneBy(Cart, { _id: cart_id });
                if (!cart_item) {
                    throw new Error("Cart item could not be added to order, cart_id provided might be wrong");
                }
                console.log('order creating and saving');

                const order = transactionalEntityManager.create(Order, { cart: cart_item, customer: {_id: customer_id}});//.save();
                console.log('order saved', order);
                order.cancellation_code = new UtilSever().generateOrderCode();
                order.inprogress_code = new UtilSever().generateOrderCode();
                order.completed_code = new UtilSever().generateOrderCode();
                await transactionalEntityManager.save(order);
                return order;
            })
        }
        catch (err) {
            throw new Error((err as Error).message);
        }
    }



    /**
    * 
    * @param cart_id id of the cart to be used to create the order
    * @returns 
    */
    async cancelOrder(cancellation_code: string): Promise<any> {
        try {

            const Manager = Order.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                let order = this;
                if (order.cancellation_code !== cancellation_code) {
                    throw new Error("Cancellation code provided is wrong");
                }
                order.status = order_status.CANCELLED;
                const task = await transactionalEntityManager.findOneBy(Task, { order: { _id: order._id } });
                if (task) {
                    task.status = task_status.CANCELLED;
                }
                await transactionalEntityManager.save(task);
                await transactionalEntityManager.save(order);
                return order;
            })
        }
        catch (err) {
            throw new Error((err as Error).message);
        }
    }






    // async cancelOrder(): Promise<void> {
    //     //TODO check if the order is still active
    //     //TODO check if the user have the right checked in or checked out
    //     try {
    //         const order = this;
    //         if (order.status === orderStatus.PENDING || order.status === orderStatus.APPROVED) {
    //             order.status = orderStatus.CANCELLED;
    //             await Order.save(order);
    //         }
    //     }
    //     catch (error) {
    //         throw new Error((error as Error).message);
    //     }
    // }

    // async checkIn(): Promise<void> {
    //     //ALGORITHM check if the order is still active
    //     //ALGORITHM check if the order isnt already checked in or checked out
    //     //ALGORITHM check the user into the property
    //     //ALGO set the check in date, boolen and order status to active and save

    //     //TODO perform this operation inside a transaction
    //     try {
    //         const order = this;
    //         if (order.status === orderStatus.PENDING || order.status === orderStatus.APPROVED) {
    //             order.check_ins = new Date();
    //             order.checkedIn = true;
    //             order.status = orderStatus.APPROVED;
    //             await Order.save(order);
    //         }
    //     }
    //     catch (error) {
    //         throw new Error((error as Error).message);
    //     }
    // }

    // async checkOut(): Promise<void> {
    //     //ALGORITHM check if the order is still active
    //     //ALGORITHM check if the order isnt already checked in or checked out
    //     //ALGORITHM check the user into the property
    //     //ALGO set the check in date, boolen and order status to active and save

    //     //TODO perform this operation inside a transaction
    //     try {
    //         const order = this;
    //         if (order.status === orderStatus.APPROVED && order.checkedIn) {
    //             order.check_outs = new Date();
    //             order.checkedOut = true;
    //             order.status = orderStatus.CLOSED;
    //             await Order.save(order);
    //         }
    //     }
    //     catch (error) {
    //         throw new Error((error as Error).message);
    //     }
    // }

    // async makeReservation(): Promise<void> {

    // }

    // async getOrder(): Promise<void> {

    // }

    // async getOrders(): Promise<void> {

    // }


}
export default Order