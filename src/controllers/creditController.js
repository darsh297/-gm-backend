// Import necessary modules
import User from "../models/User.js";
import Credit from "../models/Credit.js";
import { parseJwt } from "../services/authService.js";

// Function to add credits to user's account
export async function addCredit(req, res) {
  try {
    // Get the JWT token from the request headers
    const token = req.headers["authorization"];

    // Decode the JWT token to extract the user ID
    const decodedToken = parseJwt(token);
    const userId = decodedToken._id;

    // Update the user's credit count
    await User.findByIdAndUpdate(userId, { $inc: { creditCount: 1 } });

    // Create a new Credit document to record the credit transaction
    const generatedCredit = await Credit.create({ user: userId });

    // Send success response
    res.json({
      status: 200,
      message: "Credit added successfully.",
      data: generatedCredit,
    });
  } catch (error) {
    res.json({
      status: 500,
      message: "Something went wrong while adding credit please try again",
      data: error,
    });
  }
}

export async function getCredit(req, res) {
  try {
    // Get the JWT token from the request headers
    const token = req.headers["authorization"];

    // Decode the JWT token to extract the user ID
    const decodedToken = parseJwt(token);
    const userId = decodedToken._id;

    const todate = new Date();
    todate.setHours(0, 0, 0, 0);

    const toEdate = new Date();
    toEdate.setHours(23, 59, 59, 999);

    // Create a new Credit document to record the credit transaction
    const generatedCredit = await Credit.find({
      user: userId,
      createdAt: {
        $gte: todate,
        $lt: toEdate,
      },
    });

    // Send success response
    res.json({
      status: 200,
      message: "Get Credit for today successfully.",
      data: { count: generatedCredit.length },
    });
  } catch (error) {
    res.json({
      status: 500,
      message:
        "Something went wrong while getting credit for today please try again",
      data: error,
    });
  }
}
