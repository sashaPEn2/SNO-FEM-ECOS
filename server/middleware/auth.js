const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Токен не предоставлен'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Некорректный токен'
    });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Доступ запрещен. Требуются права администратора'
    });
  }
  next();
};

const organizerMiddleware = (req, res, next) => {
  if (!['admin', 'organizer'].includes(req.user?.role)) {
    return res.status(403).json({
      success: false,
      message: 'Доступ запрещен. Требуются права организатора'
    });
  }
  next();
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  organizerMiddleware
};
