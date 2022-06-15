module.exports.validatePost = (body) => {
    const errors = {};
    if(body.trim() === ""){
        errors.body = "Your post cannot be blank"
    }
    return {
        errors,
        valid: Object.keys(errors) < 1
    }
}