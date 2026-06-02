const User = require('../models/User');
const Point = require('../models/Point');

// Получить рейтинг всех пользователей
exports.getLeaderboard = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const users = await User.find({})
      .select('firstName lastName totalPoints')
      .sort({ totalPoints: -1 })
      .limit(limit);

    res.json({
      success: true,
      leaderboard: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Получить баллы пользователя
exports.getUserPoints = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    const points = await Point.find({ user: userId })
      .populate('event', 'title')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      totalPoints: user.totalPoints,
      history: points
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Добавить баллы (только администратор)
exports.addPoints = async (req, res) => {
  try {
    const { userId, amount, reason, description } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Только администратор может добавлять баллы'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    user.totalPoints += amount;
    await user.save();

    const point = new Point({
      user: userId,
      amount,
      reason: reason || 'manual_add',
      description,
      addedBy: req.user.userId
    });

    await point.save();

    res.json({
      success: true,
      message: 'Баллы добавлены',
      totalPoints: user.totalPoints
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = exports;
