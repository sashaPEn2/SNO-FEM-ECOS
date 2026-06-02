const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Укажите название награды']
  },
  description: String,
  pointsCost: {
    type: Number,
    required: [true, 'Укажите стоимость в баллах']
  },
  rewardType: {
    type: String,
    enum: ['certificate', 'diploma', 'badge', 'priority', 'discount', 'other'],
    default: 'certificate'
  },
  icon: String,
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Reward', rewardSchema);
