const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },

  status: {
    type: String,
    enum: ["active", "suspended", "inactive"],
    default: "active"
  },

  department: {
    type: String
  },

  employeeId: {
    type: String
  },

  phone: {
    type: String
  },

  avatarUrl: {
    type: String
  },
  points: {
    type: Number,
    default: 0
  }
},
{
  timestamps: true
}
);

module.exports = mongoose.model('User', userSchema);





