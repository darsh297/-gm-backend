import { Router } from "express";
import { deleteUser, register, login, checkPhoneNumber, getAllUsers, exportAllUsers, getTopFifty, getTotalJap } from "../controllers/userController.js";
import { isAdmin } from "../middlewares/authMiddleware.js";
import { isAuthorized } from "../middlewares/authMiddleware.js";

const userRoutes = Router();

// Route to check if a phone number exists in the database
userRoutes.delete("/", deleteUser);
userRoutes.post("/checkPhoneNumber", checkPhoneNumber);
userRoutes.post("/register", register);
userRoutes.post("/login", login);
userRoutes.get('/getAllUsers', isAdmin, getAllUsers);
userRoutes.get('/exportAllUsers', isAdmin, exportAllUsers);
userRoutes.get('/getTop50', isAuthorized , getTopFifty);
userRoutes.get('/getTotalJap', isAuthorized , getTotalJap);
export default userRoutes;
