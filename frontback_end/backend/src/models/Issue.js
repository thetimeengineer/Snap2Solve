const mongoose = require("mongoose");
const { Schema } = mongoose;

const issueSchema = new Schema(
{
  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    trim: true
  },

  reporterId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  status: {
    type: String,
    enum: ["reported", "acknowledged", "in-progress", "resolved", "escalated", "closed", "open"],
    default: "reported"
  },

  category: {
    type: String
  },

  department: {
    type: String,
    default: "unassigned"
  },

  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent", "Low", "Medium", "High", "Urgent"],
    default: "medium"
  },

  // Image uploaded by user
  image: {
    type: String
  },

  // AI detected issue type
  issueType: {
    type: String,
    enum: ["pothole", "garbage", "unknown"],
    default: "unknown"
  },

  // GeoJSON location for maps
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },

    coordinates: {
      type: [Number],
      required: true,
      default: [0, 0] // [lng, lat]
    }
  },

  // Attachments (extra images/files)
  attachments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Attachment"
    }
  ],

  // YOLO detected object labels
  labels: [
    {
      type: String
    }
  ],

  // Votes from community
  votes: {
    type: Number,
    default: 0
  }

},
{
  timestamps: true
}
);

// Enable geospatial queries
issueSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Issue", issueSchema);