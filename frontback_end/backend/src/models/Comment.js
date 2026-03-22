const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema({
  issueId: { type: Schema.Types.ObjectId, ref: 'Issue', required: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  body: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);





