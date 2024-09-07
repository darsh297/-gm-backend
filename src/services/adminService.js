import { adminPhone, adminUser } from "../constant/constant.js";
import User from "../models/User.js";

export async function createAdminUser() {
  // Check if admin user already exists
  const existingAdminUser = await User.findOne({ phoneNumber: adminPhone });

  if (!existingAdminUser) {
    const adminUserData = adminUser;
    try {
      const user = new User(adminUserData);
      const createdAdminUser = await user.save();
      console.log("Admin User Created.", createdAdminUser);
    } catch (error) {
      console.error(error);
      console.log({ error: "Server error" });
    }
  } else {
    console.log("Admin User Already Created.");
  }
}
