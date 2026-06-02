const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Point = require('../models/Point');
const { sendPointsAwardedEmail } = require('../utils/email');

// Регистрация на событие
exports.registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.body;

    // Проверка события
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Событие не найдено'
      });
    }

    // Проверка наличия места
    if (event.registrations.length >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Нет свободных мест'
      });
    }

    // Проверка дублирования
    const existing = await Registration.findOne({
      user: req.user.userId,
      event: eventId
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Вы уже зарегистрированы на это событие'
      });
    }

    // Создание регистрации
    const registration = new Registration({
      user: req.user.userId,
      event: eventId,
      status: 'registered'
    });

    await registration.save();

    // Добавление регистрации к событию
    event.registrations.push(registration._id);
    await event.save();

    res.status(201).json({
      success: true,
      message: 'Вы успешно зарегистрированы',
      registration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Отмена регистрации
exports.cancelRegistration = async (req, res) => {
  try {
    const { eventId } = req.params;

    const registration = await Registration.findOneAndDelete({
      user: req.user.userId,
      event: eventId
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Регистрация не найдена'
      });
    }

    // Удаление регистрации из события
    await Event.findByIdAndUpdate(
      eventId,
      { $pull: { registrations: registration._id } }
    );

    res.json({
      success: true,
      message: 'Регистрация отменена'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Подтверждение посещения
exports.confirmAttendance = async (req, res) => {
  try {
    const { registrationId, pointsType } = req.body;

    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Регистрация не найдена'
      });
    }

    const event = await Event.findById(registration.event);
    let points = 0;

    switch(pointsType) {
      case 'attendance':
        points = event.pointsPerAttendance;
        registration.status = 'attended';
        break;
      case 'speaker':
        points = event.pointsPerSpeaker;
        registration.status = 'speaker';
        break;
      default:
        points = event.pointsPerAttendance;
        registration.status = 'attended';
    }

    registration.pointsAwarded = points;
    registration.attendanceConfirmed = true;

    await registration.save();

    // Запись о начислении баллов
    const point = new Point({
      user: registration.user,
      amount: points,
      reason: pointsType,
      event: event._id,
      addedBy: req.user.userId
    });

    await point.save();

    // Обновление общего количества баллов
    const user = await User.findById(registration.user);
    user.totalPoints += points;
    await user.save();

    // Отправка email
    const userEmail = await User.findById(registration.user);
    await sendPointsAwardedEmail(userEmail.email, points, event.title);

    res.json({
      success: true,
      message: 'Посещение подтверждено, баллы начислены',
      registration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Получение регистраций пользователя
exports.getUserRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user.userId })
      .populate('event');

    res.json({
      success: true,
      registrations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const User = require('../models/User');

module.exports = exports;
