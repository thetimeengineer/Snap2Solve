const mongoose = require('mongoose');
const { Schema } = mongoose;

const attachmentSchema = new Schema({
  issueId: { type: Schema.Types.ObjectId, ref: 'Issue', required: true },
  filename: { type: String, required: true },
  url: { type: String, required: true },
  s3Key: { type: String },
  mimeType: { type: String },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attachment', attachmentSchema);


