const mongoose = require('mongoose');

const metadataSchema = new mongoose.Schema({
    pageUrl: String,
    windowTitle: String,
    screenResolution: String,
    browserInfo: String,
    osInfo: String,
    activityContext: mongoose.Schema.Types.Mixed,
    productivityScore: Number,
    isIdle: Boolean,
    idleDuration: Number,
    mousePosition: {
        x: Number,
        y: Number
    },
    activeApplications: [String],
    networkActivity: Boolean,
}, { _id: false });

const screenshotSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sessionId: {
    type: String,
    // required: true, // Session ID might not be available if not started via service
  },
  image: {
    type: String, // base64 encoded string
    required: true,
  },
  metadata: metadataSchema,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Screenshot', screenshotSchema); 