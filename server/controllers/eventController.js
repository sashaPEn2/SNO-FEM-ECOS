const Event = require('../models/Event');
const User = require('../models/User');
const { sendEventCreatedEmail } = require('../utils/email');

// Создание события
exports.createEvent = async (req, res) => {
  try {
    const { title, description, startDate, endDate, location, capacity, category, tags } = req.body;

    const event = new Event({
      title,
      description,
      startDate,
      endDate,
      location,
      capacity,
      category,
      tags,
      organizer: req.user.userId,
      status: 'published'
    });

    await event.save();

    // Отправка email всем пользователям
    const users = await User.find({});
    users.forEach(user => {
      if (user._id.toString() !== req.user.userId) {
        sendEventCreatedEmail(user.email, title);
      }
    });

    res.status(201).json({
      success: true,
      message: 'Событие создано',
      event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Получение всех событий
exports.getAllEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status } = req.query;

    let filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    const events = await Event.find(filter)
      .populate('organizer', 'firstName lastName email')
      .populate('registrations')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ startDate: 1 });

    const total = await Event.countDocuments(filter);

    res.json({
      success: true,
      events,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Получение события по ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'firstName lastName email')
      .populate('registrations');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Событие не найдено'
      });
    }

    res.json({
      success: true,
      event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Обновление события
exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Событие не найдено'
      });
    }

    // Проверка прав
    if (event.organizer.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Вы не имеете прав редактировать это событие'
      });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.json({
      success: true,
      message: 'Событие обновлено',
      event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Удаление события
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Событие не найдено'
      });
    }

    if (event.organizer.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Вы не имеете прав удалять это событие'
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Событие удалено'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = exports;
