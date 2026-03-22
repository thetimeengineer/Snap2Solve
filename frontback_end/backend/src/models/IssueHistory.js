const mongoose = require('mongoose');
const { Schema } = mongoose;

const historySchema = new Schema({
  issueId: { type: Schema.Types.ObjectId, ref: 'Issue', required: true },
  changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  changeType: { type: String },
  oldValue: { type: Schema.Types.Mixed },
  newValue: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('IssueHistory', historySchema);





