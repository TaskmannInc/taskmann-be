import e, { Request, Response } from 'express';
import Payment from '../entities/payment';
import { ICustomerRequest } from '../interfaces/request';
import Stripe from 'stripe';






/**
 * @description - Create a new payment link
 * @param {Request} req - request object from the request body
 * @param {Response} res - response object to send a response back to the client
 * @example - localhost:3000/api/v1/createorder
 * @example - request body - {}
 * }
 * @returns {object} - returns an object with customer order details
 */
async function createPayment(req: ICustomerRequest, res: Response): Promise<void> {
    try {
        const payment = await Payment.createPayment(req.params.cart_id, req.customer._id);
        res.status(201).send({ code: 201, message: 'Payment link Created', data: payment });
    } catch (err) {
        if (err.code == 23505) {
            res.status(400).send({ code: 400, error: 'Payment already exists' });
        }
        else (res.status(400).send({ code: 400, error: err.message }));
    }
}

async function paymentEvent(req: Request, res: Response): Promise<void> {
    try {
        // console.log('event data', req.body);
        const stripe = new Stripe(process.env.STRIPE_KEY!, {
            apiVersion: '2023-08-16',
        });
        // process.env.NODE_ENV == "development" ? process.env.WEBHOOK_KEY! : process.env.LOCAL_WEBHOOK_KEY!;
        console.log('webhook key', process.env.NODE_ENV == "development" ? process.env.WEBHOOK_KEY! : process.env.LOCAL_WEBHOOK_KEY!);
        const webhookSecret = process.env.NODE_ENV == "development" ? process.env.WEBHOOK_KEY! : process.env.LOCAL_WEBHOOK_KEY!;
        const sig = req.headers['stripe-signature'];
        const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        // console.log('event dataaaa---------', event);
        const event_status = await Payment.paymentEvent(event);
        res.status(200).send({ code: 201, message: 'Payment Event handled successfully', data: event_status });
    } catch (err) {

        res.status(400).send({ code: 400, error: err.message });
    }
}

export default { createPayment, paymentEvent };