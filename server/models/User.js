const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Укажите имя'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Укажите фамилию'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Укажите email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Некорректный email']
  },
  password: {
    type: String,
    required: [true, 'Укажите пароль'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'organizer', 'admin'],
    default: 'user'
  },
  department: String,
  phone: String,
  bio: String,
  avatar: String,
  totalPoints: {
    type: Number,
    default: 0
  },
  eventsCreated: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  eventsAttended: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
