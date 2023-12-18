import { Repository, BaseEntity, Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, OneToOne, JoinColumn } from "typeorm";
import Staff from "./staff";
import Customer from "./customer";
import Service from "./service";
import { payment_status } from "../enums/enum";
// import orderCode from "../utils/orderCode";
import UtilSever from "../utils/util";
import Order from "./order";
import Stripe from 'stripe';
import Cart from "./cart";


const stripe = new Stripe(process.env.STRIPE_KEY!, {
    apiVersion: '2023-08-16',
});



/**
 * @description payment schema            
 */
@Entity('payments')
class Payment extends BaseEntity {

    @PrimaryGeneratedColumn('uuid')
    _id!: string;

    @Column({
        type: "enum",
        enum: payment_status,
        nullable: false,
        unique: false,
        default: payment_status.PENDING
    })
    status!: payment_status;

    @Column({
        nullable: true,
        unique: false,
        type: "simple-json"
    })
    payment_details!: object;

    @OneToOne(() => Cart, (cart) => cart.payment, {
        nullable: false,
        //onUpdate: 'CASCADE',
        eager: true,
        // cascade: true
        // onDelete: 'CASCADE'
    })
    // @JoinColumn({ name: 'cart' })
    // @JoinColumn()
    cart!: Cart;

    @OneToOne(() => Order, (order) => order.payment, {
        nullable: true,
        onUpdate: 'CASCADE',
        // eager: true
        // onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'order' })
    order!: Order;

    @Column({
        nullable: true,
        unique: true
    })
    checkoutsession_id!: string;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;


    static async createPayment(cart_id: string, customer_id: string): Promise<any> {
        try {
            const Manager = this.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                const payment = new Payment();
                // const order = await transactionalEntityManager.findOneBy(Order, { _id: order_id });
                const cart = await transactionalEntityManager.findOne(Cart, { where: { _id: cart_id, customer: { _id: customer_id }, active: true, closed: false } });
                if (!cart) {
                    throw new Error("Cart not found, please add items to cart and try again");
                }
                payment.status = payment_status.PENDING;
                let payment_details = await stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    line_items: [
                        {
                            price_data: {
                                currency: 'cad',
                                product_data: {
                                    name: cart.line_items[0].service_name,
                                },
                                unit_amount: Number(cart.total_price) * 100,
                            },
                            quantity: 1 //Number(order.cart.total_items),
                        },
                    ],
                    mode: 'payment',
                    after_expiration: {
                        recovery: {
                            enabled: true,
                        },
                    },
                    success_url: process.env.PAYMENT_SUCCESS_URL,   //'https://example.com/success',
                    cancel_url: process.env.PAYMENT_CANCEL_URL //https://example.com/cancel',
                });
                payment.payment_details = payment_details;
                payment.checkoutsession_id = payment_details.id;
                // payment.cart = cart;
                cart.payment = payment;
                // await transactionalEntityManager.save(cart);
                await transactionalEntityManager.save(cart);
                return payment;
            });
        }
        catch (error) {
            throw new Error(error.message);
        }
    }


    static async paymentEvent(event: any): Promise<any> {
        // Handle the event
        console.log('event data in payment event');
        switch (event.type) {
            case 'checkout.session.completed':
                const checkoutSessionCompleted = event.data.object;
                //const payment_details_id = checkoutSessionCompleted.id;
                const payment_details = await Payment.findOne({ where: { checkoutsession_id: checkoutSessionCompleted.id } });
                if (!payment_details) {
                    throw new Error("Payment not found");
                }
                payment_details.status = payment_status.PAID;
                await payment_details.save();
                // update cart status to closed
                console.log('payment details', payment_details);
                console.log('payment details cart', payment_details.cart);
                console.log('payment details cart payment', payment_details.cart.payment);

                const cart = await Cart.findOne({ where: { _id: payment_details.cart._id } });
                if (!cart) {
                    console.log("Cart not found");
                    throw new Error("Cart not found");
                }
                console.log('passed the potential cart error');
                cart.closed = true;
                cart.active = false;
                await cart.save();
                // create order
                const order = new Order();
                order.cart = cart;
                order.payment = payment_details;
                order.customer = cart.customer;
                order.cancellation_code = new UtilSever().generateOrderCode();
                order.inprogress_code = new UtilSever().generateOrderCode();
                order.completed_code = new UtilSever().generateOrderCode();
                payment_details.order = order;
                await payment_details.save();
                await order.save();
                console.log('checkout completed', checkoutSessionCompleted);
                // Then define and call a function to handle the event checkout.session.completed
                break;
            case 'checkout.session.expired':
                const checkoutSessionExpired = event.data.object;
                const payment_details_expired = await Payment.findOne({ where: { checkoutsession_id: checkoutSessionExpired.id, status: payment_status.PENDING } });
                if (payment_details_expired) {
                    let payment_details = await stripe.checkout.sessions.create({
                        payment_method_types: ['card'],
                        line_items: [
                            {
                                price_data: {
                                    currency: 'usd',
                                    product_data: {
                                        name: payment_details_expired.cart.line_items[0].service_name,
                                    },
                                    unit_amount: Number(payment_details_expired.cart.total_price) * 100,
                                },
                                quantity: 1 //Number(order.cart.total_items),
                            },
                        ],
                        mode: 'payment',
                        after_expiration: {
                            recovery: {
                                enabled: true,
                            },
                        },
                        success_url: process.env.PAYMENT_SUCCESS_URL,   //'https://example.com/success',
                        cancel_url: process.env.PAYMENT_CANCEL_URL //https://example.com/cancel',
                    });
                    payment_details_expired.payment_details = payment_details;
                    payment_details_expired.checkoutsession_id = payment_details.id;
                }
                await payment_details_expired.save();

                console.log('checkout expired', checkoutSessionExpired);
                // Then define and call a function to handle the event checkout.session.expired
                break;
            // ... handle other event types
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    }

}
export default Payment;


