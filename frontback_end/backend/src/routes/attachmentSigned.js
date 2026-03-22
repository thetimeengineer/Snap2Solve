const express = require('express');
const AWS = require('aws-sdk');
const Attachment = require('../models/Attachment');
const auth = require('../middleware/auth');

const router = express.Router();

const useS3 = process.env.USE_S3 === 'true';
let s3;
if (useS3) {
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  });
  s3 = new AWS.S3();
}

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





