import { validationResult } from "express-validator";
import { ApiError } from "../utils/api-error.js";

export const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ApiError(400, errors.array().map(error => error.msg).join(', '));
    }
    next();
}
