import { body } from "express-validator";

const userRegisterValidator = () => {
    return [
        body("email").trim().notEmpty().isEmail().withMessage("Email is not valid"),
        body("username").trim().notEmpty().isString().withMessage("Username is not valid"),
        body("fullName").trim().notEmpty().isString().withMessage("Full name is not valid"),
        body("password").trim().notEmpty().isString().withMessage("Password is not valid"),
    ]
}

const userLoginValidator = () => {
    return [
        body("email").trim().notEmpty().isEmail().withMessage("Email is not valid"),
        body("password").trim().notEmpty().isString().withMessage("Password is not valid"),
    ]
}


export { userRegisterValidator, userLoginValidator }