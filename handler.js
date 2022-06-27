const AWS = require("aws-sdk");
const multipart = require("parse-multipart");
const s3 = new AWS.S3();
const bluebird = require("bluebird");

module.exports.handle = function (event, context) {
  const result = [];

  const bodyBuffer = Buffer.from(event["body-json"].toString(), "base64");

  const boundary = multipart.getBoundary(event.params.header["Content-Type"]);

  const parts = multipart.Parse(bodyBuffer, boundary);

  const files = getFiles(parts);

  return bluebird
    .map(files, (file) => {
      console.log(`uploadCall!!!`);
      return upload(file).then(
        (data) => {
          result.push({ data, file_url: file.uploadFile.full_path });
          console.log(`data=> ${JSON.stringify(data, null, 2)}`);
        },
        (err) => {
          console.log(`s3 upload err => ${err}`);
        }
      );
    })
    .then((_) => {
      return context.succeed(result);
    });
};

const upload = function (file) {
  console.log(`putObject call!!!!`);
  return s3.upload(file.params).promise();
};

const getFiles = function (parts) {
  const files = [];
  parts.forEach((part) => {
    const buffer = part.data;
    const fileFullName = part.filename;

    const filefullPath = "" + fileFullName;

    const params = {
      Bucket: "sls-upload-s3",
      Key: fileFullName,
      Body: buffer,
    };

    const uploadFile = {
      size: buffer.toString("ascii").length,
      type: part.type,
      name: fileFullName,
      full_path: filefullPath,
    };

    files.push({ params, uploadFile });
  });
  return files;
};
