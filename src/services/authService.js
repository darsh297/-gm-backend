import jwt from "jsonwebtoken";
import { jwtSecret } from "../constant/constant.js";

export const generateToken = (user) => {
  return jwt.sign(user.toJSON(), jwtSecret, { expiresIn: "365d" });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    throw new Error("Invalid token");
  }
};

export function parseJwt(token) {
  return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
}
