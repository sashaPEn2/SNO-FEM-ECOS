const express = require('express');
const rewardController = require('../controllers/rewardController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const validateSchema = require('../middleware/validation');
const Joi = require('joi');

const router = express.Router();

// Схемы валидации
const redeemSchema = Joi.object({
  rewardId: Joi.string().required()
});

const createRewardSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
  pointsCost: Joi.number().min(1).required(),
  rewardType: Joi.string().valid('certificate', 'diploma', 'badge', 'priority', 'discount', 'other').default('certificate')
});

// Маршруты
router.get('/', rewardController.getAllRewards);
router.post('/redeem', authMiddleware, validateSchema(redeemSchema), rewardController.redeemReward);
router.get('/my', authMiddleware, rewardController.getUserRewards);
router.post('/', authMiddleware, adminMiddleware, validateSchema(createRewardSchema), rewardController.createReward);

module.exports = router;
