import { Request, Response } from 'express';
import Order from '../entities/order';
import Task from '../entities/task';
import { ICustomerRequest } from '../interfaces/request';




/**
 * @description - Create a new order
 * @param {Request} req - request object from the request body
 * @param {Response} res - response object to send a response back to the client
 * @example - localhost:3000/api/v1/createorder
 * @example - request body - {}
 * @returns {object} - returns an object with customer order details
 */
async function createOrder(req: ICustomerRequest, res: Response): Promise<void> {
    try {
        const order = await Order.createOrder(req.params.cart_id, req.customer._id);
        res.status(201).send({ code: 201, message: 'Order Created', data: order });
    } catch (err) {
        if (err.code == 23505) {
            res.status(400).send({ code: 400, error: 'Order already exists' });
        }
        else(res.status(400).send({ code: 400, error: err.message }));
    }
}

async function getOrder(req: ICustomerRequest, res: Response): Promise<void> {
    try {
        let order;
        console.log('reg', req.customer, req.params.id);
        if (req.customer){
            order = await Order.findOne({ where: {_id: req.params.order_id, customer: { _id: req.customer._id }}}); 
        }
        else{
            // order = await Order.findOneById(req.params.id);
            order = await Order.findOne({
                where: {
                    _id: req.params.id,
                    // status: task_status.ACCEPTED || task_status.INPROGRESS,
                    // tasker: { _id: req.staff._id }
                },
                relations: ['task']
            });
            // order = await Order.findOneBy({ _id: req.params.id })
            //order = await Order.findOne({ where: {_id: req.params.order_id }}); 
        }
        // const order = await Order.findOne({ where: {_id: req.params.order_id, customer: { _id: req.customer._id }}});
        // const role = await Order.findOne({
        //     where: {
        //         _id: req.params.order_id,
        //         customer: req.customer._id
        //     }
        // });
        if (!order) throw new Error('Order not found');
        res.status(200).send({ code: 200, message: 'Order', data: order });
    } 
    catch (error) {
        res.status(400).send({ code: 400, error: (error as Error).message });
    }
}

async function getOrders(req: ICustomerRequest, res: Response): Promise<void> {
    try {
        let orders;
        if (req.customer){
            orders = await Order.find({ where: { customer: { _id: req.customer._id } } });
        }
        else{
            orders = await Order.find();
        }
        // const orders = await Order.find();
        if (!orders) throw new Error('Orders not found');
        res.status(200).send({ code: 200, message: 'Orders', data: orders });
    } 
    catch (error) {
        res.status(400).send({ code: 400, error: (error as Error).message });
    }
}




async function cancelOrder(req: ICustomerRequest, res: Response): Promise<void> {
    try {
        let order, task;
        console.log('reg', req.customer, req.params.id);
        if (req.customer) {
            order = await Order.findOne({ where: { _id: req.params.order_id, cancellation_code: req.body.code, customer: { _id: req.customer._id } } });
            if (!order) throw new Error('Order not found');
            // task = await Task.findOne({ where: { order: { _id: req.params.order_id } } });
            // if (!task) throw new Error('Task not found');
            order = await order.cancelOrder(req.params.code);
            // task = await task.cancelTask(req.params.code);
        }
        // else {
        //     // order = await Order.findOneById(req.params.id);
        //     order = await Order.findOne({
        //         where: {
        //             _id: req.params.id,
        //             // status: task_status.ACCEPTED || task_status.INPROGRESS,
        //             // tasker: { _id: req.staff._id }
        //         },
        //         relations: ['task']
        //     });
        //     // order = await Order.findOneBy({ _id: req.params.id })
        //     //order = await Order.findOne({ where: {_id: req.params.order_id }}); 
        // }
        // // const order = await Order.findOne({ where: {_id: req.params.order_id, customer: { _id: req.customer._id }}});
        // // const role = await Order.findOne({
        // //     where: {
        // //         _id: req.params.order_id,
        // //         customer: req.customer._id
        // //     }
        // // });
        // if (!order) throw new Error('Order not found');
        res.status(200).send({ code: 200, message: 'Order', data: order });
    }
    catch (error) {
        res.status(400).send({ code: 400, error: (error as Error).message });
    }
}




export default { createOrder, getOrder, getOrders, cancelOrder };