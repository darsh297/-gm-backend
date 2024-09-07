import mongoose from "mongoose";

const { Schema, model } = mongoose;

const pdfPageSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  pdf: {
    type: Schema.Types.ObjectId,
    ref: "PDF",
    required: true,
  },
  page: {
    type: Number,
    required: true,
  },
});

const PdfPage = model("PdfPage", pdfPageSchema);

export default PdfPage;
