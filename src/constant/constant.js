// Mongo Db Url
export const mongoURI =
  process.env.MONGO_URI ||
  "mongodb+srv://RuchitK:simple@cluster.pzkafwo.mongodb.net/gmBackend";

// JWT secret token
export const jwtSecret = process.env.JWT_SECRET || "your_jwt_secret";

// Constant Admin user
export const adminPhone = "1234567890";
export const adminUser = {
  fullName: "Admin User",
  phoneNumber: adminPhone, // Phone number without country code
  countryCode: "+91", // Country code
  isAdmin: true,
};
