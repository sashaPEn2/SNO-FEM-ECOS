const Joi = require('joi');

const validateSchema = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const messages = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Ошибка валидации',
        errors: messages
      });
    }

    req.validated = value;
    next();
  };
};

module.exports = validateSchema;
