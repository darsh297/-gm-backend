import { Router } from "express";
import { isAuthorized } from "../middlewares/authMiddleware.js";
import { addCredit, getCredit } from "../controllers/creditController.js";

const creditRoutes = Router();

creditRoutes.get("/add", isAuthorized, addCredit);
creditRoutes.get("/get", isAuthorized, getCredit);

export default creditRoutes;
