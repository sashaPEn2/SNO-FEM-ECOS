const express = require('express');
const commentController = require('../controllers/commentController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const validateSchema = require('../middleware/validation');
const Joi = require('joi');

const router = express.Router();

// Схемы валидации
const commentSchema = Joi.object({
  eventId: Joi.string().required(),
  text: Joi.string().max(1000).required(),
  rating: Joi.number().min(1).max(5)
});

const replySchema = Joi.object({
  commentId: Joi.string().required(),
  text: Joi.string().required()
});

// Маршруты
router.post('/', authMiddleware, validateSchema(commentSchema), commentController.addComment);
router.get('/event/:eventId', commentController.getEventComments);
router.post('/reply', authMiddleware, validateSchema(replySchema), commentController.replyToComment);
router.delete('/:commentId', authMiddleware, commentController.deleteComment);

module.exports = router;
