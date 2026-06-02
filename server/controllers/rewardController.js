const Reward = require('../models/Reward');
const UserReward = require('../models/UserReward');
const User = require('../models/User');
const Point = require('../models/Point');
const { generateCertificate } = require('../utils/pdf');
const { v4: uuidv4 } = require('uuid');

// Получить все награды
exports.getAllRewards = async (req, res) => {
  try {
    const rewards = await Reward.find({ isActive: true }).sort({ pointsCost: 1 });

    res.json({
      success: true,
      rewards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Обменять баллы на награду
exports.redeemReward = async (req, res) => {
  try {
    const { rewardId } = req.body;

    const reward = await Reward.findById(rewardId);
    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Награда не найдена'
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    if (user.totalPoints < reward.pointsCost) {
      return res.status(400).json({
        success: false,
        message: `У вас недостаточно баллов. Нужно: ${reward.pointsCost}, у вас: ${user.totalPoints}`
      });
    }

    // Уменьшение баллов
    user.totalPoints -= reward.pointsCost;
    await user.save();

    // Запись о расходовании баллов
    const point = new Point({
      user: req.user.userId,
      amount: -reward.pointsCost,
      reason: 'reward_redeemed',
      description: `Обмен на ${reward.name}`
    });
    await point.save();

    // Создание награды для пользователя
    const certificateNumber = uuidv4().substring(0, 12).toUpperCase();
    let certificateFile = null;

    if (reward.rewardType === 'certificate' || reward.rewardType === 'diploma') {
      try {
        const filePath = await generateCertificate(
          user.firstName,
          user.lastName,
          reward.name,
          certificateNumber
        );
        certificateFile = filePath;
      } catch (error) {
        console.error('Ошибка генерации сертификата:', error);
      }
    }

    const userReward = new UserReward({
      user: req.user.userId,
      reward: rewardId,
      certificateNumber,
      certificateFile
    });

    await userReward.save();

    res.json({
      success: true,
      message: 'Награда получена',
      userReward,
      remainingPoints: user.totalPoints
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Получить награды пользователя
exports.getUserRewards = async (req, res) => {
  try {
    const rewards = await UserReward.find({ user: req.user.userId })
      .populate('reward');

    res.json({
      success: true,
      rewards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Создать новую награду (админ)
exports.createReward = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Только администратор может создавать награды'
      });
    }

    const { name, description, pointsCost, rewardType } = req.body;

    const reward = new Reward({
      name,
      description,
      pointsCost,
      rewardType
    });

    await reward.save();

    res.status(201).json({
      success: true,
      message: 'Награда создана',
      reward
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = exports;
