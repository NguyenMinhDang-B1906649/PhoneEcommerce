export const checkPhoneNumber = (number: string): boolean => {
    return /^0[0-9]{9}$/g.test(number);
}

export const checkEmail = (email: string): boolean => {
    return /^(([\w]+)(\.*))+@((\w+)(\.)){1,}(com|net|co|vn|edu|gov|biz|org|uk)$/g.test(email);
}

