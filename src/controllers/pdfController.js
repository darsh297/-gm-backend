import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import PDF from "../models/Pdf.js";
import PdfPage from "../models/pdfPage.js";
import { parseJwt } from "../services/authService.js";

const s3Client = new S3Client({
  endpoint: "https://blr1.digitaloceanspaces.com",
  region: "blr1",
  credentials: {
    accessKeyId: "DO00AE8PWNZ8AZAG3G4U",
    secretAccessKey: "Pmr5h8QksQt7mUjAHrohO+R0Cz2BcTD14oBJZ7fBtgY",
  },
});

export const uploadPDF = async (req, res) => {
  // Define a function that uploads your object using SDK's PutObjectCommand object and catches any errors.
  try {
    let hasError = false;
    const language = req.body.lang;
    const description = req.body.desc;
    // let fileName = "";
    let image = "";
    let fileName = req.body.fileName;
    let contents = req.body.contents;

    if (req.files.length > 0) {
      await Promise.all(
        req.files.map(async (file) => {
          const fileParams = {
            Bucket: "gm-files", // The path to the directory you want to upload the object to, starting with your Space name.
            Key: `${
              file.mimetype.split("/").includes("pdf") ? "pdfs/" : "images/"
            }${Buffer.from(file.originalname, "latin1").toString("utf8")}`, // Object key, referenced whenever you want to access this file later.
            Body: file.buffer, // The object's contents. This variable is an object, not a string.
            ACL: "public-read", // Defines ACL permissions, such as private or public.
            ContentType: file.mimetype,
            // Metadata: {
            //   // Defines metadata tags.
            //   "x-amz-meta-my-key": "my-value",
            // },
            // ContentDisposition: "attachment",
          };
          const data = await s3Client.send(new PutObjectCommand(fileParams));
          if (!(data.$metadata.httpStatusCode === 200)) {
            hasError = true;
          } else {
            if (file.mimetype.split("/").includes("pdf")) {
              fileName = Buffer.from(file.originalname, "latin1").toString(
                "utf8"
              );
            } else {
              image = Buffer.from(file.originalname, "latin1").toString("utf8");
            }
          }
        })
      );
    } else {
      hasError = true;
    }

    if (hasError) {
      res.json({
        status: 500,
        message: "Somthing is wrong in uploading pdf. Please try again",
      });
    }

    const pdf = await PDF.create({
      fileName,
      language,
      description,
      contents,
      image,
    });

    res.json({
      status: 200,
      message: "Pdf uploaded Succesfully.",
      data: pdf,
    });
  } catch (error) {
    res.json({
      status: 500,
      message: "Somthing went wrong while uploading pdf. Please try again",
      data: error,
    });
  }
};

export async function getPdfList(req, res) {
  try {
    // Retrieve query parameters for language and file name
    let { language, fileName, page } = req.query;

    // Convert page to numbers (default values if not provided)
    page = parseInt(page) || 1;

    // Calculate the number of documents to skip based on the page number
    const skip = (page - 1) * 12;

    // Construct query conditions based on provided parameters
    const query = {};
    if (language) {
      query.language = language;
    }
    if (fileName) {
      query.fileName = { $regex: fileName, $options: "i" }; // Case-insensitive regex match
    }

    // // Get the JWT token from the request headers
    // const token = req.headers["authorization"];

    // // Decode the JWT token to extract the user ID
    // const decodedToken = parseJwt(token);
    // const userId = decodedToken._id;

    // Retrieve PDFs from database
    const pdfList = await PDF.find(query).skip(skip).limit(12);

    // const pdfLastPage = await PdfPage.find({ user: userId });

    // const pdfListWithLastpage = [];

    // pdfList.map(async (pdf) => {
    //   const lastPageObject = pdfLastPage.find((lastPage) => {
    //     return lastPage.pdf.equals(pdf._id);
    //   });

    //   pdfListWithLastpage.push({
    //     ...pdf.toObject(),
    //     lastPage: lastPageObject ? lastPageObject.page : 0,
    //   });
    // });

    // Send PDF list as response
    res.json({
      status: 200,
      message: "PDF list got successfully.",
      data: pdfList,
    });
  } catch (error) {
    res.json({
      status: 500,
      message: "Something went wrong while getting pdf list, please try again",
      data: error,
    });
  }
}

// export async function lastPage(req, res) {
//   try {
//     let { page, pdfId } = req.params;

//     page = Number(page);

//     // Get the JWT token from the request headers
//     const token = req.headers["authorization"];

//     // Decode the JWT token to extract the user ID
//     const decodedToken = parseJwt(token);
//     const userId = decodedToken._id;

//     // Check if a record exists for the given userId and pdfId
//     const existingPdfPage = await PdfPage.findOne({ user: userId, pdf: pdfId });

//     let pdfPageAdded;
//     if (existingPdfPage) {
//       if (existingPdfPage.page === page) {
//         pdfPageAdded = existingPdfPage;
//       } else {
//         // If a record exists, update the page field
//         existingPdfPage.page = page;
//         pdfPageAdded = await existingPdfPage.save();
//       }
//     } else {
//       pdfPageAdded = await PdfPage.create({
//         user: userId,
//         pdf: pdfId,
//         page,
//       });
//     }

//     // Send PDF page as response
//     res.json({
//       status: 200,
//       message: "PDF last page added successfully.",
//       data: pdfPageAdded,
//     });
//   } catch (error) {
//     res.json({
//       status: 500,
//       message: "Something went wrong while adding pdf page, please try again",
//       data: error,
//     });
//   }
// }

export async function deletePDF(req, res) {
  try {
    const { id } = req.params;

    // find file in database
    const pdf = await PDF.findById(id);

    // delete it by its name
    // const command = new DeleteObjectCommand({
    //   Bucket: "gm-files",
    //   Key: `pdfs/${pdf.fileName}`,
    // });

    // delete its image by its name
    const command2 = new DeleteObjectCommand({
      Bucket: "gm-files",
      Key: `images/${pdf.image}`,
    });

    // await s3Client.send(command);
    await s3Client.send(command2);

    const deletedPdf = await PDF.findByIdAndDelete(pdf._id);

    // // find PDF Pages and delete it
    // const data = await PdfPage.find({ pdf: pdf._id });

    // data.map(async (item) => {
    //   await PdfPage.findByIdAndDelete(item._id);
    // });

    res.json({
      status: 200,
      message: "PDF deleted successfully.",
      data: deletedPdf,
    });
  } catch (error) {
    res.json({
      status: 500,
      message: "Something went wrong while deleting pdf, please try again",
      data: error,
    });
  }
}
