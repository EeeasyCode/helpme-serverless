// const AWS = require("aws-sdk");
// const S3 = new AWS.S3();
// const URL_EXPIRATION_SECONDS = 300;

// module.exports.handler = async (event) => {
//   return await getUploadURL(event);
// };

// const getUploadURL = async function (event) {
//   const randomID = parseInt(Math.random() * 10000000);
//   const Key = `${randomID}.jpg`;

//   const s3Params = {
//     Bucket: "sls-upload-s3",
//     Key,
//     Expires: URL_EXPIRATION_SECONDS,
//     ContentType: "image/jpeg",
//   };
//   const uploadURL = await S3.getSignedUrlPromise("putObject", s3Params);

//   return (response = {
//     statusCode: 200,
//     headers: {
//       "Access-Control-Allow-Origin": "*",
//     },
//     body: JSON.stringify({
//       uploadURL: uploadURL,
//       Key,
//     }),
//   });
// };
