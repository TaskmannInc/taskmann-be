

// create IPatient Interface
interface ICustomer {
    [x: string]: any;
    fname: string,
    lname: string,
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
    resetlink: string,
}


export default ICustomer;