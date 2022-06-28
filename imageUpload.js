// const AWS = require("aws-sdk");
// const Busboy = require("busboy");

// const URL_EXPIRATION_SECONDS = 300;

// const parse = (event) =>
//   new Promise((resolve, reject) => {
//     const busboy = new Busboy({
//       headers: {
//         "content-type":
//           event.headers["content-type"] || event.headers["Content-Type"],
//       },
//     });
//     const result = {
//       files: [],
//     };

//     busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
//       const uploadFile = {};

//       file.on("data", (data) => {
//         uploadFile.content = data;
//       });

//       file.on("end", () => {
//         if (uploadFile.content) {
//           uploadFile.filename = filename;
//           uploadFile.contentType = mimetype;
//           uploadFile.encoding = encoding;
//           uploadFile.fieldname = fieldname;
//           result.files.push(uploadFile);
//         }
//       });
//     });

//     busboy.on("field", (fieldname, value) => {
//       result[fieldname] = value;
//     });

//     busboy.on("error", (error) => {
//       reject(error);
//     });

//     busboy.on("finish", () => {
//       resolve(result);
//     });

//     const encoding =
//       event.encoding || (event.isBase64Encoded ? "base64" : "binary");

//     busboy.write(event.body, encoding);
//     busboy.end();
//   });

// // return signed url of s3
// module.exports.handler = async (event, context, callback) => {
//   const s3 = new AWS.S3();
//   try {
//     const files = await parse(event);
//     const randomID = parseInt(Math.random() * 10000000);
//     const Key = `${randomID}.jpg`;
//     // await s3.uploadfiles(key, files.content, files.contentType);
//     const s3Params = {
//       Bucket: "test-s3",
//       Key,
//       ContentType: files.contentType,
//       Expires: URL_EXPIRATION_SECONDS,
//     };

//     const uploadURL = await s3.getSignedUrl("putObject", s3Params);
//     const response = {
//       statusCode: 200,
//       headers: {
//         "Access-Control-Allow-Origin": "*",
//       },
//       body: JSON.stringify({
//         uploadURL,
//         Key,
//       }),
//     };
//     return response;
//   } catch (error) {
//     console.warn(error);
//     return "fail";
//   }
// };
