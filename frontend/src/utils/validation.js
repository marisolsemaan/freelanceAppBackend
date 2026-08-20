// check if the phone number is a valid lebanese number
export const isValidLebanesePhone = (phone) => {

    // remove spaces from the number
    const cleanedPhone = phone.replace(/\s/g, "");

    // phone is optional
    if (cleanedPhone === "") {
        return true;
    }

    // accept common lebanese prefixes with 8 digits
    return /^(03|70|71|76|78|79|81)\d{6}$/.test(cleanedPhone);
};