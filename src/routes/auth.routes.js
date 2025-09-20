import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/auth.controller.js";
import { userLoginValidator, userRegisterValidator } from "../validators/index.js";
import { validateRequest } from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";



const router = Router();

router.post("/register", userRegisterValidator(), validateRequest, registerUser);

router.post("/login", userLoginValidator(), validateRequest, loginUser);

router.post("/logout", verifyJWT, logoutUser)

export default router;
