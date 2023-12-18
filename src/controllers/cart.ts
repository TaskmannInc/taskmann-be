import { Request, Response } from 'express';
import Service from '../entities/service';
import Cart from '../entities/cart';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import { throwTwilioAndGenericErrorMessage, throwTypeOrmEntityFieldError, throwTypeOrmEntityNotFoundErrorMessage, throwTypeOrmQueryFailedErrorMessage } from '../utils/error';
import { ValidationError } from 'class-validator';
import { ICustomerRequest } from '../interfaces/request';






/**
 * @description - Add a new service
 * @param {Request} req - request object from the request body
 * @param {Response} res - response object to send a response back to the client
 * @example - localhost:3000/api/v1/addservice
 * @example - request body - {}
 * }
 * @returns {object} - returns an object with customer verification details
 */
async function addCart(req: ICustomerRequest, res: Response): Promise<void> {
    try {
        const cart = await Cart.addtocart(req.body, req.customer._id);
        res.status(201).send({ code: 201, message: 'Cart added', data: cart });
    } catch (err) {
        res.status(400).send({ code: 400, error: err.message });
    }
}


async function getCart(req: ICustomerRequest, res: Response): Promise<void> {
    try {
        let cart = await Cart.findOne({ where: { customer: { _id: req.customer._id }, closed: false, active: true } });
        // const cart = await Cart.findOneBy({ customer: { _id: req.customer._id } });
        res.status(200).send({ code: 200, message: 'Cart fetched', data: cart });
    } catch (err) {
        res.status(400).send({ code: 400, error: err.message });
    }
}


async function updateCart(req: ICustomerRequest, res: Response): Promise<void> {
    try {
        let cart = await Cart.findOne({ where: { customer: { _id: req.customer._id }, closed: false, active: true } });
        //let cart = await Cart.findOneBy({ customer: { _id: req.customer._id } });
        if (!cart) {
            throw new Error("Cart not found");
        }
        const cart_object = await cart.updatecart(req.body);
        res.status(200).send({ code: 200, message: 'Cart updated', data: cart_object });
    }
    catch (err) {
        res.status(400).send({ code: 400, error: (err as Error).message });
    }
}

async function deleteCart(req: ICustomerRequest, res: Response): Promise<void> {
    try {
        let cart = await Cart.findOne({ where: { customer: { _id: req.customer._id }, closed: false, active: true } });
        if (!cart) {
            throw new Error("Cart not found");
        }
        await cart.deletecart(req.params.id);
        res.status(200).send({ code: 200, message: 'Cart deleted' });
    }
    catch (err) {
        res.status(400).send({ code: 400, error: (err as Error).message });
    }
}



export default { addCart, getCart, updateCart, deleteCart };
