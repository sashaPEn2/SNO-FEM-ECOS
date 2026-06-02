const express = require('express');
const pointController = require('../controllers/pointController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const validateSchema = require('../middleware/validation');
const Joi = require('joi');

const router = express.Router();

// Схемы валидации
const addPointsSchema = Joi.object({
  userId: Joi.string().required(),
  amount: Joi.number().required(),
  reason: Joi.string().valid('attendance', 'speaker', 'organizer', 'reward_redeemed', 'manual_add', 'manual_remove'),
  description: Joi.string(),
  eventId: Joi.string()
});

// Маршруты
router.get('/leaderboard', pointController.getLeaderboard);
router.get('/:userId', authMiddleware, pointController.getUserPoints);
router.post('/add', authMiddleware, adminMiddleware, validateSchema(addPointsSchema), pointController.addPoints);

module.exports = router;
