import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema({
  phoneNumber: {
    type: String,
    required: true,
  },
  countryCode: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  village: {
    type: String,
    required: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  creditCount: {
    type: Number,
    default: 0,
  },
});

const User = model("User", userSchema);

export default User;
