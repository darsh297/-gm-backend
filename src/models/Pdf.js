import mongoose from "mongoose";

const { Schema, model } = mongoose;

const pdfSchema = new Schema({
  fileName: {
    type: String,
    required: true,
  },
  contents: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    required: false,
  },
  language: {
    type: String,
    enum: ["English", "Gujarati"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PDF = model("PDF", pdfSchema);

export default PDF;
