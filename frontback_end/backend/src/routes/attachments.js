const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AWS = require('aws-sdk');

const Attachment = require('../models/Attachment');
const Issue = require('../models/Issue');
const auth = require('../middleware/auth');

const router = express.Router();

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const useS3 = process.env.USE_S3 === 'true';
let upload;

if (useS3) {
  // memory storage for S3 upload
  const storage = multer.memoryStorage();
  upload = multer({ storage });
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  });
  var s3 = new AWS.S3();
} else {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
      cb(null, safeName);
    }
  });
  upload = multer({ storage });
}

// POST /api/issues/:id/attachments
router.post('/:id/attachments', auth, upload.single('file'), async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    let url;
    if (useS3) {
      const key = `${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`;
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        ACL: process.env.AWS_S3_ACL || 'private'
      };
      await s3.putObject(params).promise();
      // generate a signed url for immediate use (expires in 1 hour by default)
      const expires = parseInt(process.env.SIGNED_URL_EXPIRES || '3600', 10);
      const signedUrl = await s3.getSignedUrlPromise('getObject', {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Expires: expires
      });
      url = signedUrl;
      // store s3Key for later signed url refreshes
      req._s3Key = key;
    } else {
      url = `/uploads/${req.file.filename}`;
    }

    const attachment = new Attachment({
      issueId: issue._id,
      filename: req.file.originalname,
      url,
      s3Key: req._s3Key,
      mimeType: req.file.mimetype,
      uploadedBy: req.user._id
    });
    await attachment.save();
    issue.attachments = issue.attachments || [];
    issue.attachments.push(attachment._id);
    await issue.save();
    res.status(201).json(attachment);
  } catch (err) {
    next(err);
  }
});

// GET /api/attachments/:id/signed-url
router.get('/:id/signed-url', auth, async (req, res, next) => {
  try {
    const attachment = await Attachment.findById(req.params.id);
    if (!attachment) return res.status(404).json({ message: 'Not found' });
    if (useS3) {
      if (!attachment.s3Key) return res.status(400).json({ message: 's3Key missing' });
      const expires = parseInt(process.env.SIGNED_URL_EXPIRES || '3600', 10);
      const signedUrl = await s3.getSignedUrlPromise('getObject', {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: attachment.s3Key,
        Expires: expires
      });
      return res.json({ url: signedUrl });
    } else {
      return res.json({ url: `/uploads/${attachment.filename}` });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;


