import mongoose from "mongoose";

const { Schema, model } = mongoose;

const creditSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Credit = model("Credit", creditSchema);

export default Credit;
