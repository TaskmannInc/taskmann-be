import { staff_roles, staff_type } from "../enums/enum";


// create IPatient Interface
interface IStaff {
    [x: string]: any;
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    tokens: Array<Object>,
    profile_pic: string,
    dob: Date,
    phone_number: string,
    language: string,
    city: string,
    country: string,
    postalcode: string,
    address: string,
    verify_phone: boolean,
    verify_email: boolean,
    is_verified: boolean,
    verified: boolean,
    type: staff_type,
    role: staff_type,
    resetlink: string,
}


export default IStaff;