import express, { json } from "express";
import cors from "cors";
const app = express();
import { connect } from "mongoose";
import { mongoURI } from "./constant/constant.js";
import userRoutes from "./routes/userRoutes.js";
import { createAdminUser } from "./services/adminService.js";
import pdfRoutes from "./routes/pdfRoutes.js";
import creditRoutes from "./routes/creditRoutes.js";

// Connect to MongoDB
connect(mongoURI)
  .then(() => {
    console.log("MongoDB connected", mongoURI);
    createAdminUser();
  })
  .catch((err) => console.log(err, mongoURI));

// Allow all origins for development purposes
app.use(cors());

// Middleware
app.use(json());

// Routes
app.use("/api/user", userRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api/credit", creditRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
