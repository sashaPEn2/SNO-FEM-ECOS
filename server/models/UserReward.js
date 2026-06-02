const mongoose = require('mongoose');

const userRewardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reward: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reward',
    required: true
  },
  earnedAt: {
    type: Date,
    default: Date.now
  },
  certificateNumber: String,
  certificateFile: String
}, { timestamps: true });

module.exports = mongoose.model('UserReward', userRewardSchema);
