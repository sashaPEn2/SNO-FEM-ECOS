const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateCertificate = async (userFirstName, userLastName, eventTitle, certificateNumber) => {
  return new Promise((resolve, reject) => {
    try {
      const fileName = `certificate_${certificateNumber}.pdf`;
      const filePath = path.join(__dirname, '../generated-certificates', fileName);
      
      // Создать папку если её нет
      if (!fs.existsSync(path.join(__dirname, '../generated-certificates'))) {
        fs.mkdirSync(path.join(__dirname, '../generated-certificates'), { recursive: true });
      }

      const doc = new PDFDocument({
        size: [1000, 600],
        margin: 50
      });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Фон
      doc.fillColor('#f0f0f0')
        .rect(50, 50, 900, 500)
        .fill();

      // Рамка
      doc.strokeColor('#333')
        .lineWidth(3)
        .rect(75, 75, 850, 450)
        .stroke();

      // Заголовок
      doc.fillColor('#333')
        .fontSize(40)
        .font('Helvetica-Bold')
        .text('СЕРТИФИКАТ', 100, 120, { align: 'center' });

      // Подтекст
      doc.fontSize(16)
        .font('Helvetica')
        .fillColor('#666')
        .text('об участии в мероприятии', 100, 180, { align: 'center' });

      // Название события
      doc.fontSize(24)
        .font('Helvetica-Bold')
        .fillColor('#000')
        .text(`"${eventTitle}"`, 100, 240, { align: 'center' });

      // ФИО участника
      doc.fontSize(18)
        .font('Helvetica')
        .text(`${userFirstName} ${userLastName}`, 100, 320, { align: 'center' });

      // Номер сертификата
      doc.fontSize(12)
        .fillColor('#999')
        .text(`Номер сертификата: ${certificateNumber}`, 100, 420, { align: 'center' });

      // Дата
      const date = new Date().toLocaleDateString('ru-RU');
      doc.text(`Дата: ${date}`, 100, 450, { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve(filePath);
      });

      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateCertificate
};
