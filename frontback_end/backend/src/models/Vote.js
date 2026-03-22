const mongoose = require('mongoose');
const { Schema } = mongoose;

const voteSchema = new Schema({
  issueId: { type: Schema.Types.ObjectId, ref: 'Issue', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

// Ensure a user can only vote once per issue
voteSchema.index({ issueId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
