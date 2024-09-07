import { Router } from "express";
import { isAdmin, isAuthorized } from "../middlewares/authMiddleware.js";
import {
  uploadPDF,
  getPdfList,
  // lastPage,
  deletePDF,
} from "../controllers/pdfController.js";
import multer from "multer";
const pdfRoutes = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

pdfRoutes.post("/upload", isAdmin, upload.array("file"), uploadPDF);
pdfRoutes.get("/list", isAuthorized, getPdfList);
// pdfRoutes.get("/lastPage/:pdfId/:page", isAuthorized, lastPage);

pdfRoutes.delete("/:id", isAdmin, deletePDF);

export default pdfRoutes;
