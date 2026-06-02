const Comment = require('../models/Comment');
const Event = require('../models/Event');

// Добавить комментарий
exports.addComment = async (req, res) => {
  try {
    const { eventId, text, rating } = req.body;

    // Проверка события
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Событие не найдено'
      });
    }

    const comment = new Comment({
      author: req.user.userId,
      event: eventId,
      text,
      rating
    });

    await comment.save();
    await comment.populate('author', 'firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Комментарий добавлен',
      comment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Получить комментарии события
exports.getEventComments = async (req, res) => {
  try {
    const { eventId } = req.params;

    const comments = await Comment.find({ event: eventId })
      .populate('author', 'firstName lastName avatar')
      .populate('replies.author', 'firstName lastName avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      comments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Добавить ответ на комментарий
exports.replyToComment = async (req, res) => {
  try {
    const { commentId, text } = req.body;

    const comment = await Comment.findByIdAndUpdate(
      commentId,
      {
        $push: {
          replies: {
            author: req.user.userId,
            text,
            createdAt: new Date()
          }
        }
      },
      { new: true }
    ).populate('author', 'firstName lastName avatar')
     .populate('replies.author', 'firstName lastName avatar');

    res.json({
      success: true,
      message: 'Ответ добавлен',
      comment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Удалить комментарий
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Комментарий не найден'
      });
    }

    if (comment.author.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Вы не имеете прав удалять этот комментарий'
      });
    }

    await Comment.findByIdAndDelete(commentId);

    res.json({
      success: true,
      message: 'Комментарий удален'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = exports;
