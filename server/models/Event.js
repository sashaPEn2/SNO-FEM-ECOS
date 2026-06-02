const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Укажите название события'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Укажите описание события']
  },
  startDate: {
    type: Date,
    required: [true, 'Укажите дату начала']
  },
  endDate: {
    type: Date,
    required: [true, 'Укажите дату окончания']
  },
  location: {
    type: String,
    required: true
  },
  image: String,
  category: {
    type: String,
    enum: ['conference', 'workshop', 'seminar', 'competition', 'other'],
    default: 'other'
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  registrations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration'
  }],
  pointsPerAttendance: {
    type: Number,
    default: 10 // базовые баллы за посещение
  },
  pointsPerSpeaker: {
    type: Number,
    default: 20 // баллы за выступление
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
    default: 'draft'
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
