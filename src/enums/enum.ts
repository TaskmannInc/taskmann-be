export enum error_type {
    ER_BAD_NULL_ERROR = 'Field cannot be null',
    ER_DUP_ENTRY = 'Duplicate entry %s for key %s',
    ER_EMPTY_QUERY = 'Query was empty',
    ER_ALTER_INFO = 'Records %id Duplicate entry %s for key %s',
    ER_UNKNOWN_ERROR = 'Unknown error occured'

}

export enum staff_roles {
    MANAGER = "MANAGER",
    ADMIN = "ADMIN",
    TASKER = "TASKER"
}

export enum services {
    CLEANING = 'CLEANING',
    MOVING = 'MOVING',
    CARWASH = 'CARWASH',
    PAINTING = 'PAINTING',
    FURNITURE = 'FURNITURE',
    PET = 'PET',
    HANDYMAN = 'HANDYMAN',
    SPECIALEVENT = 'SPECIALEVENT'
}

export enum paymentStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED'
}

export enum cost_parameters {
    name = 'name',
    unitPrice = 'unitPrice',
    unitType = 'unitType',
    min = 'min',
    max = 'max'
}

export enum genders {
    male = 'male',
    female = 'female',
    other = 'other'
}

export enum order_status {
    PENDING = 'PENDING',
    ASSIGNED = 'ASSIGNED',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED',
    INPROGRESS = 'INPROGRESS',
    COMPLETED = 'COMPLETED'
}

export enum payment_status {
    PENDING = 'PENDING',
    PAID = 'PAID',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED'
}

export enum task_status {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED',
    INPROGRESS = 'INPROGRESS',
    COMPLETED = 'COMPLETED'
}



