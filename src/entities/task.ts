import { Repository, BaseEntity, Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, OneToOne, JoinColumn, In, Any } from "typeorm";
import Subservice from "./subservice";
import CloudinaryService from '../services/cloudinary';
import { IsBoolean } from "class-validator";
import { Transform } from "class-transformer";
import { task_status, order_status, staff_roles } from "../enums/enum";
import Customer from "./customer";
import Staff from "./staff";
import Order from "./order";




/**
 * @description Task schema            
 */
@Entity('tasks')
class Task extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    _id!: string;

    @Column({
        type: "enum",
        enum: task_status,
        default: task_status.PENDING
    })
    status!: task_status;

    @ManyToOne(() => Staff, (staff) => staff.task, {
        nullable: true,
        onUpdate: 'CASCADE',
        eager: true
        // onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'tasker' })
    tasker!: Staff;

    @OneToOne(() => Order, (order) => order.task, {
        nullable: true,
        onUpdate: 'CASCADE',
        cascade: true,

    })
    @JoinColumn({ name: 'order' })
    order: Order;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    //TODO: admin assign order as tasks to taskers ✅
    //TODO: taskers accept task, reject task or complete task
    //TODO: admin can see all taskers task and their status ✅
    //TODO: admin can reassign task to another tasker
    //TODO: taskers can see all their task and their status ✅

    static async asignTaskToTasker(taskerId: string, orderId: any) {
        // check if the order exist and has not been assigned to a tasker
        // check if the tasker exist and has not been assigned a task
        // asign task to tasker
        try {
            const Manager = this.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                // find order by id
                const order = await transactionalEntityManager.findOneBy(Order, { _id: orderId, status: order_status.PENDING || order_status.REJECTED });
                console.log('order data', order);
                if (!order) throw new Error('This order is not available to be assigned to a tasker');
                //const tasker = await transactionalEntityManager.findOneBy(Staff, { _id: taskerId, roles: staff_roles.TASKER  }); 
                const tasker = await transactionalEntityManager.createQueryBuilder(Staff, 'staff')
                    .where('_id = :taskerId', { taskerId })
                    // .andWhere(`:taskerRole = ANY (staff.roles)`, { taskerRole: staff_roles.TASKER })
                    .getOne();
                // if (order.task) throw new Error('Order has already been assigned to a tasker');
                if (!tasker) throw new Error('Tasker does not exist');
                let tasks = await transactionalEntityManager.findBy(Task, { status: task_status.PENDING, tasker: { _id: taskerId } });
                if (tasks.length > 3) throw new Error('Tasker has already been assigned 3 tasks and can not be assigned more tasks');
                let task = new Task();
                task.order = order;
                task.tasker = tasker;
                task.status = task_status.PENDING;
                order.status = order_status.ASSIGNED;
                // order.task = task;
                // await transactionalEntityManager.save(task);
                console.log('task data', task);
                // await transactionalEntityManager.save(order);
                await transactionalEntityManager.save(task);
                return task;
            });
        }
        catch (err) {
            throw new Error((err as Error).message);
        }
    }



    static async acceptrejectTask(taskId: string, taskerId: string, action: string) {
        try {
            const Manager = this.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                // const task = await transactionalEntityManager.findOneBy(Task, { _id: taskId, status: task_status.PENDING });
                // console.log('task data', task.tasker._id, taskerId);
                const task = await transactionalEntityManager.findOneBy(Task, { _id: taskId, status: task_status.PENDING, tasker: { _id: taskerId } });
                console.log('task data1', taskId, taskerId);
                // const task = await transactionalEntityManager.findOne(Task, {
                //     where: {
                //         _id: taskId,
                //         status: task_status.INPROGRESS,
                //         tasker: { _id: taskerId }
                //     },
                //     relations: ['order']
                // });
                console.log('task data', task);
                if (!task) throw new Error('Task does not exist');
                // if (task) throw new Error('Task does not exist');
                if (action.toUpperCase() !== task_status.ACCEPTED && action.toUpperCase() !== task_status.REJECTED) throw new Error('Invalid action , action should be ACCEPTED or REJECTED');
                task.status = action.toUpperCase() as task_status;
                // search for the order and change the status to cancelled
                // const order = await transactionalEntityManager.findOne(Order, {
                //     where: {
                //         // _id: taskId,
                //         // status: task_status.ACCEPTED || task_status.INPROGRESS,
                //         task: { _id: taskId }
                //     },
                //     relations: ['task']
                // });
                const order = await transactionalEntityManager.findOneBy(Order, { task: { _id: taskId } });
                console.log('order data', order);
                if (!order) throw new Error('Order does not exist');
                order.status = action.toUpperCase() as order_status;
                await transactionalEntityManager.save(task);
                await transactionalEntityManager.save(order);
                return task;
            });
        }
        catch (err) {
            throw new Error((err as Error).message);
        }
    }

    static async cancelinprogresscompletTask(taskId: string, taskerId: string, action: string, code: string) {
        try {
            const Manager = this.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                // const task = await transactionalEntityManager.findOneBy(Task, { _id: taskId, status: task_status.ACCEPTED || task_status.INPROGRESS, tasker: { _id: taskerId }});
                // let task = await transactionalEntityManager.find(Task, {
                //     where: {
                //         _id: taskId,
                //         status: task_status.ACCEPTED || task_status.INPROGRESS,
                //         tasker: { _id: taskerId }
                //     },
                //     relations: ['order']
                // });
                // task = task.length > 0 ? task[0] : null;
                console.log('task data', taskId, taskerId);
                const task = await transactionalEntityManager.findOne(Task, {
                    where: {
                        _id: taskId,
                        status: In([task_status.ACCEPTED, task_status.INPROGRESS]),
                        tasker: { _id: taskerId },
                    },
                    relations: ['order'],
                });

                if (!task) throw new Error('Can not perfrom this action on this task');
                if (action.toUpperCase() !== task_status.CANCELLED && action.toUpperCase() !== task_status.INPROGRESS && action.toUpperCase() !== task_status.COMPLETED) throw new Error('Invalid action, action should be CANCELLED, INPROGRESS or COMPLETED');
                task.status = action.toUpperCase() as task_status;
                // search for the order and change the status to cancelled
                const order = await transactionalEntityManager.findOneBy(Order, { _id: task.order._id, task: { _id: taskId } });
                console.log('order data', order, task.order._id);
                if (!order) throw new Error('Order does not exist');
                switch (action.toUpperCase()) {
                    case task_status.CANCELLED:
                        if (order.cancellation_code !== code) throw new Error('Invalid code');
                        else {
                            order.status = order_status.PENDING;
                        }
                        break;
                    case task_status.INPROGRESS:
                        if (order.inprogress_code !== code) throw new Error('Invalid code');
                        else {
                            order.status = order_status.INPROGRESS;
                        }
                        break;
                    case task_status.COMPLETED:
                        if (order.completed_code !== code) throw new Error('Invalid code');
                        else {
                            order.status = order_status.COMPLETED;
                        }
                        break;
                    default:
                        // order.status = action.toUpperCase() as order_status;
                        break;
                }
                await transactionalEntityManager.save(task);
                await transactionalEntityManager.save(order);
                return task;
            });
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
    async cancelTask(): Promise<any> {
        try {

            const Manager = Task.getRepository().manager;
            return Manager.transaction(async transactionalEntityManager => {
                let task = this;
                task.status = task_status.CANCELLED;
                await transactionalEntityManager.save(task);
                return task;
            })
        }
        catch (err) {
            throw new Error((err as Error).message);
        }
    }


}

export default Task;

