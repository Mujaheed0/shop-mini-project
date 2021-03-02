const AWS = require("aws-sdk");
const { adminMiddleware } = require("../middlewares/middleware");
const { v4: uuidv4 } = require("uuid");

const s3 = new AWS.S3({
  signatureVersion: "v4",

  region: "ap-south-1",
});

module.exports = (app) => {
  app.get("/api/upload", adminMiddleware, (req, res) => {
    const key = req.query.image;

    s3.getSignedUrl(
      "putObject",
      {
        Bucket: "miniproject-feb",
        ContentType: "image/png",

        Key: key,
      },
      (err, url) => {
        if (err) {
          res.send(err);
        } else res.send({ key, url });
      }
    );
  });
};
