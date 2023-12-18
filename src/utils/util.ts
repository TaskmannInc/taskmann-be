import Decimal from 'decimal.js';
import { ValueTransformer } from 'typeorm';

/**
 * @description - a class to house all small utility functions that are not worth staying on their own!
 */
class UtilSever {

    constructor() { }

    /**
     * @description - generate random code for patient to reset password
     * @param length - length of the generated code
     * @returns
     */
    public generateToken(length: number): number {
        var add = 1, max = 12 - add;   // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.
        if (length > max) {
            return this.generateToken(max) + this.generateToken(length - max);
        }
        max = Math.pow(10, length + add);
        var min = max / 10; // Math.pow(10, n) basically
        var number = Math.floor(Math.random() * (max - min + 1)) + min;
        return Number(("" + number).substring(add));
    }

    /**
     * @description - generate random code for customer ordering flow verification
     * @param length - length of the generated code
     * @returns - generated code
     */
    public generateOrderCode(): string {
        return `${~~(Math.random() * 10e3)}`.padStart(4, '0');
    }


}

export default UtilSever;




export class DecimalTransformer implements ValueTransformer {
    /**
     * Used to marshal Decimal when writing to the database.
     */
    to(decimal?: Decimal): string | null {
        return decimal;
    }
    /**
     * Used to unmarshal Decimal when reading from the database.
     */
    from(decimal?: any): Decimal | null {
        return decimal ? new Decimal(decimal) : null;
    }
}

export const DecimalToString = (decimals: number = 2) => (decimal?: Decimal) => decimal?.toFixed?.(decimals) || decimal;



// function shuffle(code: any | string): any {
//     for (
//         var j, x, i = code.length;
//         i;
//         j = Math.floor(Math.random() * i), x = code[--i], code[i] = code[j], code[j] = x
//     );
//     return code;
// }

// function bookingCode(): string {
//     var numbers = "0123456789";

//     var chars = "ZAaDcJdSeOBfIhPiXkHKlQmCLWnToqMrREsNtuGvYwFUxyzV";

//     var string_length = 4;
//     var randomstring = "";
//     var randomstring2 = "";
//     for (var x = 0; x < string_length; x++) {
//         var letterOrNumber = Math.floor(Math.random() * 2);

//         var rnum = Math.floor(Math.random() * chars.length);
//         randomstring += chars.substring(rnum, rnum + 1);
//     }
//     for (var y = 0; y < string_length; y++) {
//         var letterOrNumber2 = Math.floor(Math.random() * 2);

//         var rnum2 = Math.floor(Math.random() * numbers.length);
//         randomstring2 += numbers.substring(rnum2, rnum2 + 1);
//     }

//     return shuffle((randomstring + randomstring2).split("")).join("");
// }

// export default bookingCode;



/// ColumnNumericTransformer
export class ColumnNumericTransformer {
    to(data: number): number {
        return data;
    }
    from(data: string): number {
        return parseFloat(data);
    }
}