const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html
    });
    console.log(`📧 Email отправлен: ${to}`);
    return true;
  } catch (error) {
    console.error('❌ Ошибка отправки email:', error);
    return false;
  }
};

const sendWelcomeEmail = async (email, firstName) => {
  const html = `
    <h2>Добро пожаловать в SNO FEM ECOS! 🎉</h2>
    <p>Привет, ${firstName}!</p>
    <p>Спасибо за регистрацию. Теперь вы можете:</p>
    <ul>
      <li>Посещать мероприятия факультета</li>
      <li>Накапливать баллы</li>
      <li>Обмениваться баллы на награды</li>
    </ul>
    <a href="${process.env.FRONTEND_URL}/login">Перейти на сайт</a>
  `;
  
  return sendEmail(email, 'Добро пожаловать в SNO FEM ECOS', html);
};

const sendEventCreatedEmail = async (email, eventTitle) => {
  const html = `
    <h2>Новое мероприятие! 📅</h2>
    <p>Было создано новое мероприятие: <strong>${eventTitle}</strong></p>
    <a href="${process.env.FRONTEND_URL}/events">Посмотреть мероприятие</a>
  `;
  
  return sendEmail(email, `Новое мероприятие: ${eventTitle}`, html);
};

const sendPointsAwardedEmail = async (email, points, eventTitle) => {
  const html = `
    <h2>Вам начислены баллы! 🌟</h2>
    <p>За участие в мероприятии "<strong>${eventTitle}</strong>" вам начислено <strong>${points}</strong> баллов.</p>
    <a href="${process.env.FRONTEND_URL}/profile">Посмотреть баланс</a>
  `;
  
  return sendEmail(email, 'Баллы начислены', html);
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendEventCreatedEmail,
  sendPointsAwardedEmail
};
