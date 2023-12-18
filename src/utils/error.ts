import { error_type } from "../enums/enum";
import { DatabaseError } from 'pg-protocol';
import { ValidationError } from 'class-validator';
import { EntityNotFoundError, QueryFailedError } from "typeorm";

export type ErrorType = {
    message: string | error_type
    resolution?: string | undefined;
}

export const isTypeOrmQueryFailedError = (
    err: unknown,
): err is QueryFailedError & DatabaseError => err instanceof QueryFailedError;

export const isQueryFailedError = (err: unknown): err is QueryFailedError & DatabaseError =>
    err instanceof QueryFailedError;

export function throwTypeOrmQueryFailedErrorMessage(error: NodeJS.ErrnoException) {
    if (error instanceof QueryFailedError) {
        
        switch (error.driverError['code'] || error['code']) {
            case '23502':
                return `${error.driverError['column']} can not be null`;
            case '23505':
                return 'already exists'
            case '23503':
                return 'foreign key constraint might have failed'
            //return `${error.driverError['detail'].replace(/ *\([^)=]*\) */g, "") }`;
            case '22P02':
                return 'invalid operation check the data passed'
            default:
                return 'Unknown error occured while processing your request';
        }
    }
    return 'Unknown server error occured please try again';
}


export function throwTypeOrmEntityNotFoundErrorMessage(error: NodeJS.ErrnoException) {
    if (error instanceof EntityNotFoundError) {
        switch (error.message.includes('Could not find any entity of type')) {
            default:
                return 'valid request made but invalid data provided, please try again';
        }
    }
    return 'Unknown server error occured please try again';
}

export function throwTypeOrmEntityFieldError(error: ValidationError) {
    if (error[0] instanceof ValidationError) {
        switch (error[0].property) {
            case 'first_name':
                return 'Please enter your first name';
            case 'last_name':
                return 'Please enter your last name'
            case 'password':
                return 'password must be more than 8 characters'
            case 'description':
                return 'Please enter your description'
            case 'amount':
                return 'Please enter amount as a number'
            case 'event':
                return 'Please event must be string'
            case 'comment':
                return 'Please comment must be a string'
            case 'location':
                return 'Please enter location as a string'
            case 'value':
                return 'Please enter value as a number'
            case 'interpretation':
                return 'Please enter interpretation as a string'
            case 'description':
                return 'description must be string'
            default:
                return 'unknow error while trying to process data';
        }
    }
    return 'Unknown server error occured please try again';
}


export function throwTwilioAndGenericErrorMessage(error: NodeJS.ErrnoException) {
    if (error) {
        switch (parseInt(error['code']) || error['message']) {
            case 60200:
                return 'phone number format or phone number is invalid';
            case 'Error: 404':
                return 'token expired, invalid code or phone or already approved/used';
            case 'Error: 400':
                return 'provide a valid code and phone number';
            case 'Error':
                return 'provide a valid code and phone number';
            case '22P02':
                return 'invalid data provided, please try again';
            default:
                return 'TUnknown error occured while processing your request';
        }
    }
    return 'TUnknown server error occured please try again';
}


