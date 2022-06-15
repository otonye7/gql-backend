module.exports.validateLoginInput = (email, password) => {
    const errors = {};
    if(email.trim() === ""){
        errors.email = "Email cannot be empty"
    }
    if(password.trim() === ""){
        errors.password = "Password cannot be empty"
    }
    return {
        errors,
        valid: Object.keys(errors) < 1
    }
}

module.exports.validateRegisterInput = (username, email, password, confirmPassword) => {
    const errors = {};
    if(username.trim() === ""){
        errors.username = "Username cannot be empty"
    }
    if(email.trim() === ""){
        errors.email = "Email cannot be empty"
    } else {
        const regEx =  /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
        if(!email.match(regEx)){
            errors.email = "Email must be a valid mail"
        }
    }
    if(password.trim() === ""){
        errors.password = "Password cannot be empty"
    } else if(confirmPassword !== password){
        errors.password = "Password must match"
    }
    return {
        errors,
        valid: Object.keys(errors) < 1
    }
}