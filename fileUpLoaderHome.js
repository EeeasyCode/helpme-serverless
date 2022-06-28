//fileUploaderHome.js
"use strict";
const AWS = require("aws-sdk");
// const uuid = require("uuid");
const Jimp = require("jimp");
const s3 = new AWS.S3();
const formParser = require("./formParser");

const bucket = "test-s3-v";
const MAX_SIZE = 4000000; // 4MB
const PNG_MIME_TYPE = "image/png";
const JPEG_MIME_TYPE = "image/jpeg";
const JPG_MIME_TYPE = "image/jpg";
const MIME_TYPES = [PNG_MIME_TYPE, JPEG_MIME_TYPE, JPG_MIME_TYPE];

const getErrorMessage = (message) => ({
  statusCode: 500,
  body: JSON.stringify(message),
});

// const isAllowedFile = (size, mimeType) => {
//   // some validation code
// };

const uploadToS3 = (bucket, key, buffer, mimeType) =>
  new Promise((resolve, reject) => {
    s3.upload(
      { Bucket: bucket, Key: key, Body: buffer, ContentType: mimeType },
      function (err, data) {
        if (err) reject(err);
        resolve(data);
      }
    );
  });

// const resize = (buffer, mimeType, width) =>
//   new Promise((resolve, reject) => {
//     Jimp.read(buffer)
//       .then((image) =>
//         image.resize(width, Jimp.AUTO).quality(70).getBufferAsync(mimeType)
//       )
//       .then((resizedBuffer) => resolve(resizedBuffer))
//       .catch((error) => reject(error));
//   });

module.exports.handler = async (event) => {
  try {
    const formData = await formParser.parser(event, MAX_SIZE);
    const file = formData.files[0];

    // if (!isAllowedFile(file.content.byteLength, file.contentType))
    //   getErrorMessage("File size or type not allowed");
    const randomID = parseInt(Math.random() * 10000000);
    const uid = { randomID };
    const originalKey = `${uid}_original_${file.filename}`;
    const thumbnailKey = `${uid}_thumbnail_${file.filename}`;

    // const fileResizedBuffer = await resize(file.content, file.contentType, 460);
    const [originalFile, thumbnailFile] = await Promise.all([
      uploadToS3(bucket, originalKey, file.content, file.contentType),
      // uploadToS3(bucket, thumbnailKey, fileResizedBuffer, file.contentType),
    ]);

    const signedOriginalUrl = s3.getSignedUrl("getObject", {
      Bucket: originalFile.Bucket,
      Key: originalKey,
      Expires: 60000,
    });
    const signedThumbnailUrl = s3.getSignedUrl("getObject", {
      Bucket: thumbnailFile.Bucket,
      Key: thumbnailKey,
      Expires: 60000,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        id: uid,
        mimeType: file.contentType,
        originalKey: originalFile.key,
        thumbnailKey: thumbnailFile.key,
        bucket: originalFile.Bucket,
        fileName: file.filename,
        originalUrl: signedOriginalUrl,
        thumbnailUrl: signedThumbnailUrl,
        originalSize: file.content.byteLength,
      }),
    };
  } catch (e) {
    return getErrorMessage(e.message);
  }
};