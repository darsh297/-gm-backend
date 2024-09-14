import Credit from "../models/Credit.js";
import User from "../models/User.js";
import { generateToken } from "../services/authService.js";
import {
  isValidCountryCode,
  isValidPhoneNumber,
} from "../utils/validations.js";
import ExcelJS from "exceljs";

export const checkPhoneNumber = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    // Check if the phone number exists in the database
    const existingUser = await User.findOne({ phoneNumber });

    if (existingUser) {
      // Phone number exists in the database
      res.json({
        status: 200,
        message: "User Alredy Exists.",
        data: { exists: true },
      });
    } else {
      // Phone number does not exist in the database
      res.json({
        status: 200,
        message: "User not Exists.",
        data: { exists: false },
      });
    }
  } catch (error) {
    res.json({
      status: 500,
      message: "Something went wrong during checking number, please try again.",
      data: error,
    });
  }
};

export async function register(req, res) {
  try {
    const { fullName, phoneNumber, village, countryCode } = req.body;

    // Validate phone number format
    if (phoneNumber) {
      if (!isValidPhoneNumber(phoneNumber))
        return res.json({
          status: 400,
          message: "Invalid phone number format.",
          data: {
            error: "Error occures While Register.",
          },
        });
    } else {
      return res.json({
        status: 400,
        message: "Phone number is required.",
        data: {
          error: "Error occures While Register.",
        },
      });
    }

    // Validate country Code format
    if (countryCode) {
      if (!isValidCountryCode(countryCode))
        return res.json({
          status: 400,
          message: "Invalid country code format.",
          data: {
            error: "Error occures While Register.",
          },
        });
    } else {
      return res.json({
        status: 400,
        message: "Country code  is required.",
        data: {
          error: "Error occures While Register.",
        },
      });
    }

    // Check if phone number already exists
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.json({
        status: 400,
        message: "Phone number already exists. Please login",
        data: {
          error: "Error occures While Register.",
        },
      });
    }

    // Create the user
    const user = new User({
      fullName,
      phoneNumber,
      village,
      countryCode,
    });

    // Save the user to the database
    await user.save();

    const token = generateToken(user);

    const createdUser = {
      _id: user._id,
      phoneNumber: user.phoneNumber,
      countryCode: user.countryCode,
      fullName: user.fullName,
      createdAt: user.createdAt,
      isAdmin: user.isAdmin,
      creditCount: user.creditCount,
      token,
    };

    if (user?.village) createdUser.village = user.village;

    // Return success response
    res.json({
      status: 200,
      message: "User registered successfully.",
      data: createdUser,
    });
  } catch (error) {
    res.json({
      status: 500,
      message: "Something went wrong while register, please try again.",
      data: error,
    });
  }
}

export async function login(req, res) {
  try {
    const { countryCode, phoneNumber } = req.body;

    // Validate phone number format
    if (phoneNumber) {
      if (!isValidPhoneNumber(phoneNumber))
        return res.json({
          status: 400,
          message: "Invalid phone number format.",
          data: {
            error: "Error occures While Login.",
          },
        });
    } else {
      return res.json({
        status: 400,
        message: "Phone number is required.",
        data: {
          error: "Error occures While Login.",
        },
      });
    }

    // Validate country Code format
    if (countryCode) {
      if (!isValidCountryCode(countryCode))
        return res.json({
          status: 400,
          message: "Invalid country code format.",
          data: {
            error: "Error occures While Login.",
          },
        });
    } else {
      return res.json({
        status: 400,
        message: "Country code  is required.",
        data: {
          error: "Error occures While Login.",
        },
      });
    }

    // Find the user by phone number
    const user = await User.findOne({ phoneNumber, countryCode });
    if (!user) {
      return res.json({
        status: 400,
        message: "User not found, please register.",
        data: {
          error: "Error occures While Login.",
        },
      });
    }

    // generate token
    const token = generateToken(user);

    // return success response
    res.json({
      status: 200,
      message: "Login successful",
      data: {
        _id: user._id,
        phoneNumber: user.phoneNumber,
        countryCode: user.countryCode,
        fullName: user.fullName,
        createdAt: user.createdAt,
        isAdmin: user.isAdmin,
        creditCount: user.creditCount,
        village: user.village,
        token,
      },
    });
  } catch (error) {
    res.json({
      status: 500,
      error: "Something went wrong while login, please try again",
      data: error,
    });
  }
}

export async function getAllUsers(req, res) {
  try {
    // Retrieve query parameter for date filter (e.g., 'lastWeek', 'lastMonth', 'all')
    let { filter } = req.query;

    // Convert page to numbers (default values if not provided)
    // page = parseInt(page) || 1;

    // Calculate the number of documents to skip based on the page number
    // const skip = (page - 1) * 12;

    // Construct date range based on filter
    let startDate;
    switch (filter) {
      case "lastWeek":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7); // Subtract 7 days
        break;
      case "lastMonth":
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1); // Subtract 1 month
        break;
      // 'all' case will retrieve all users without any date filter
      // You can add additional cases for other date ranges if needed
      default:
        break;
    }

    // Construct query conditions based on the date range
    const query = {};
    if (startDate) {
      query.createdAt = { $gte: startDate };
    }

    // Retrieve users from the database based on query conditions
    // const userList = await User.find(query).skip(skip).limit(12);
    const userList = await User.find(query);

    // Array to store the credit list for all users
    const userListWithcredits = [];

    // Iterate through each user
    for (const user of userList) {
      // Retrieve credits for the current user
      const credits = await Credit.aggregate([
        {
          $match: { user: user._id },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%d-%m-%Y", date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            Date: "$_id",
            Count: "$count",
          },
        },
        {
          $sort: { Date: 1 } // 1 for ascending order, -1 for descending order
        }
      ]);

      // Add the credit list to the current user data
      const userData = {
        _id: user._id,
        fullName: user.fullName,
        countryCode: user.countryCode,
        phoneNumber: user.phoneNumber,
        creditCount: user.creditCount,
        createdAt: formatDate(user.createdAt),
        creditList: credits,
      };

      if (user?.village) userData.village = user.village;

      // Add the user data with credit list to the array
      userListWithcredits.push(userData);
    }

    // Send user list as response
    res.json({
      status: 200,
      message: "User list retrieved successfully",
      data: userListWithcredits,
    });
  } catch (error) {
    console.log("ERORROR", error);
    res.json({
      status: 500,
      message: "Something went wrong while get user data",
      data: error,
    });
  }
}

// ToDO need to test and revisit/UPDATE the logic
export async function exportAllUsers(req, res) {
  try {
    // Retrieve users from the databas
    const userList = await User.find();

    // Array to store the credit list for all users
    const userListWithcredits = [];

    // Iterate through each user
    for (const user of userList) {
      // Retrieve credits for the current user
      const credits = await Credit.aggregate([
        {
          $match: { user: user._id },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%d-%m-%Y", date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            Date: "$_id",
            Count: "$count",
          },
        },
      ]);

      // Add the credit list to the current user data
      const userData = {
        _id: user._id,
        fullName: user.fullName,
        countryCode: user.countryCode,
        phoneNumber: user.phoneNumber,
        creditCount: user.creditCount,
        createdAt: formatDate(user.createdAt),
        creditList: credits,
      };

      if (user?.village) userData.village = user.village;

      // Add the user data with credit list to the array
      userListWithcredits.push(userData);
    }

    // Create a new Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("User Data");

    // Define headers for the Excel file
    worksheet.columns = [
      { header: "Serial Number", key: "serialNumber", width: 15 },
      { header: "ID", key: "_id", width: 10 },
      { header: "Full Name", key: "fullName", width: 30 },
      { header: "Country Code", key: "countryCode", width: 15 },
      { header: "Phone Number", key: "phoneNumber", width: 20 },
      { header: "Mala", key: "creditCount", width: 15 },
      { header: "Village", key: "village", width: 20 }, // If village is present in some users
      { header: "Joining Date", key: "createdAt", width: 20 },
    ];

    // Populate rows with user data
    userListWithcredits.forEach((user, index) => {
      worksheet.addRow({ serialNumber: index + 1, ...user });

      // Add credit list day-wise report
      if (user.creditList && user.creditList.length > 0) {
        const creditSheet = workbook.addWorksheet(
          `${user.fullName}'s mala jap count`
        );
        creditSheet.columns = [
          { header: "Date", key: "Date", width: 20 },
          { header: "Count", key: "Count", width: 10 },
        ];
        user.creditList.forEach((credit) => {
          creditSheet.addRow(credit);
        });
      }
    });

    // Generate a buffer containing the Excel file
    const buffer = await workbook.xlsx.writeBuffer();

    // Set response headers for Excel file download
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=users.xlsx");

    res.send(buffer);

    // Send user list as response
    // res.json({
    //   status: 200,
    //   message: "User list retrieved successfully",
    //   data: buffer,
    // });
  } catch (error) {
    console.log("ERORROR", error);
    res.json({
      status: 500,
      message: "Something went wrong while get user data",
      data: error,
    });
  }
}

export async function getTopFifty(req, res) {
  try {

    const topUsers = await User.find().sort({ creditCount: -1 }).limit(50);

    res.json({
      status: 200,
      message: "Top 50 User list retrieved successfully",
      data: topUsers,
    });
  } catch (error) {
    console.log("Error", error);
    res.json({
      status: 500,
      message: "Something went wrong while get user data",
      data: error,
    });
  }
}

export async function getTotalJap(req, res) {
  try {
    let id = req.query.id;
    console.log("id:----> ", id);

    const now = new Date();
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOf7DaysAgo = new Date();
    startOf7DaysAgo.setDate(now.getDate() - 7);
    const startOf30DaysAgo = new Date();
    startOf30DaysAgo.setDate(now.getDate() - 30);



    const today = await Credit.countDocuments({ user: id, createdAt: { $gte: todayDate } }).exec();
    const week = await Credit.countDocuments({ user: id, createdAt: { $gte: startOf7DaysAgo, $lt: now } }).exec();
    const month = await Credit.countDocuments({ user: id, createdAt: { $gte: startOf30DaysAgo, $lt: now } }).exec();
    const total = await User.findById({ _id: id }).exec();
    const totalUser = await User.countDocuments().exec();
    const myRank = await User.countDocuments({ creditCount: { $gt: total.creditCount } }).exec();
    const totalMantrajap = await User.aggregate([
      { $group: { _id: null, totalCreditCount: { $sum: '$creditCount' } } }
    ]).exec();
    console.log("data:--->", month);

    const data = {
      today: today,
      week: week,
      month:month,
      total: total.creditCount,
      totalUser: totalUser,
      myRank: (myRank + 1),
      totalMantrajap: totalMantrajap.length > 0 ? totalMantrajap[0].totalCreditCount : 0
    };

    res.json({
      status: 200,
      message: "Total jap count retrieved successfully",
      data: data,
    });
  } catch (error) {
    console.log("ERORROR", error);
    res.json({
      status: 500,
      message: "Something went wrong while get user data",
      data: error,
    });
  }
}

export async function deleteUser(req, res) {
  try {
    let id = req.query.id;
    console.log("id:----> ", id);
    const deleteUsers = await User.deleteOne({_id:req.query.id}).exec();
    if(deleteUsers){
      res.json({
        status: 200,
        message: "User deleted successfully",
        data: deleteUsers,
      });
    }else{
      return res.json({
        status: 400,
        message: "Invalid User.",
        data: {
          error: "This user is not find in database.",
        },
      });
    }
  } catch (error) {
    console.log("ERORROR", error);
    res.json({
      status: 500,
      message: "Something went wrong while get user data",
      data: error,
    });
  }
}

// Function to format date as "DD-MM-YYYY"
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}
