import { Request, Response } from 'express';
import Task from '../entities/task';
import { ICustomerRequest } from '../interfaces/request';
import { IStaffRequest } from "../interfaces/request";




/**
 * @description - Create a new task
 * @param {Request} req - request object from the request body
 * @param {Response} res - response object to send a response back to the client
 * @example - localhost:3000/api/v1/createorder
 * @example - request body - {}
 * @returns {object} - returns an object with customer order details
 */
async function assignTask(req: IStaffRequest, res: Response): Promise<void> {
    try {
        const task = await Task.asignTaskToTasker(req.body.tasker, req.params.id);
        res.status(201).send({ code: 201, message: 'Task Assigned', data: task });
    } catch (err) {
        // if (err.code == 23505) {
        //     res.status(400).send({ code: 400, error: 'Order already exists' });
        // }
        res.status(400).send({ code: 400, error: err.message });
    }
}


async function getTask(req: IStaffRequest, res: Response): Promise<void> {
    try {
        //         req.roles = staff.roles;
        let task;
        if (req.roles.includes('TASKER')) {
            task = await Task.findOne({
                where: {
                    _id: req.params.id,
                    // status: task_status.ACCEPTED || task_status.INPROGRESS,
                    tasker: { _id: req.staff._id }
                },
                relations: ['order']
            });
            // task = await Task.findOne({ where: { _id: req.params.id, tasker: { _id: req.staff._id } } });
        }
        else {
            task = await Task.findOne({
                where: {
                    _id: req.params.id,
                    // status: task_status.ACCEPTED || task_status.INPROGRESS,
                    // tasker: { _id: req.staff._id }
                },
                relations: ['order']
            });
            // task = await Task.findOne({ where: { _id: req.params.id} });
        }
        res.status(200).send({ code: 200, message: 'Task', data: task });
    }
    catch (error) {
        res.status(400).send({ code: 400, error: (error as Error).message });
    }
}


async function getTasks(req: IStaffRequest, res: Response): Promise<void> {
    try {
        //         req.roles = staff.roles;
        let task;
        if (req.roles.includes('TASKER')) {
            task = await Task.find({
                where: {
                    // _id: req.params.id,
                    // status: task_status.ACCEPTED || task_status.INPROGRESS,
                    tasker: { _id: req.staff._id }
                },
                relations: ['order']
            });
            // task = await Task.find({ where: { tasker: { _id: req.staff._id } } });
        }
        else {
            task = await Task.find({
                where: {
                    // _id: req.params.id,
                    // status: task_status.ACCEPTED || task_status.INPROGRESS,
                    //tasker: { _id: req.staff._id }
                },
                relations: ['order']
            });
            // task = await Task.find();
        }
        res.status(200).send({ code: 200, message: 'Task', data: task });
    }
    catch (error) {
        res.status(400).send({ code: 400, error: (error as Error).message });
    }
}


async function acceptrejectTask(req: IStaffRequest, res: Response): Promise<void>{
    try{
        const task = await Task.acceptrejectTask(req.params.id, req.staff._id, req.body.action);
        res.status(200).send({ code: 200, message: 'Task Status succesfully applied', data: task });
    }
    catch(error){
        res.status(400).send({ code: 400, error: (error as Error).message });
    }
    
}

async function cancelinprogresscompletTask(req: IStaffRequest, res: Response){
    try{
        const task = await Task.cancelinprogresscompletTask(req.params._id, req.staff._id, req.body.action, req.body.code);
        res.status(200).send({ code: 200, message: 'Task Status succesfully applied', data: task });
    }
    catch(error){
        res.status(400).send({ code: 400, error: (error as Error).message });
    }   

}

export default { assignTask, getTask, getTasks, acceptrejectTask, cancelinprogresscompletTask };