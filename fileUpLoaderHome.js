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

const getErrorMessage = (message) => ({
  statusCode: 500,
  body: JSON.stringify(message),
});

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

module.exports.handler = async (event) => {
  try {
    const formData = await formParser.parser(event, MAX_SIZE);
    const file = formData.files[0];
    const randomID = parseInt(Math.random() * 10000000);
    const uid = { randomID };
    const originalKey = `${uid}_original_${file.filename}`;

    const originalFile = await Promise.all([
      uploadToS3(bucket, originalKey, file.content, file.contentType),
    ]);

    const signedOriginalUrl = s3.getSignedUrl("getObject", {
      Bucket: bucket,
      Key: originalKey,
      Expires: 60000,
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        mimeType: file.contentType,
        Key: originalKey,
        bucket: bucket,
        originalUrl: signedOriginalUrl,
      }),
    };
  } catch (e) {
    return getErrorMessage(e.message);
  }
};
