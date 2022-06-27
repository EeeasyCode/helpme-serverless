const AWS = require("aws-sdk");
const Busboy = require("busboy");
const uuid = require("uuid");

const parse = (event) =>
  new Promise((resolve, reject) => {
    const busboy = new Busboy({
      headers: {
        "content-type":
          event.headers["content-type"] || event.headers["Content-Type"],
      },
    });
    const result = {
      files: [],
    };

    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
      const uploadFile = {};

      file.on("data", (data) => {
        uploadFile.content = data;
      });

      file.on("end", () => {
        if (uploadFile.content) {
          uploadFile.filename = filename;
          uploadFile.contentType = mimetype;
          uploadFile.encoding = encoding;
          uploadFile.fieldname = fieldname;
          result.files.push(uploadFile);
        }
      });
    });

    busboy.on("field", (fieldname, value) => {
      result[fieldname] = value;
    });

    busboy.on("error", (error) => {
      reject(error);
    });

    busboy.on("finish", () => {
      resolve(result);
    });

    const encoding =
      event.encoding || (event.isBase64Encoded ? "base64" : "binary");

    busboy.write(event.body, encoding);
    busboy.end();
  });

// return signed url of s3
module.exports.handler = async (event, context, callback) => {
  const s3 = new AWS.S3();
  try {
    const files = await parse(event);

    for (const file of files.files) {
      const id = uuid();
      const key = `${id}+${file.fieldname}`;
      await s3.uploadFile(key, file.content, file.contentType);
    }

    return "success";
  } catch (error) {
    console.warn(error);
    return "fail";
  }
};
