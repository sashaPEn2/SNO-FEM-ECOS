/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import { Student, Achievement, Notification, ApplicationStatus, ActivityCategory, Quiz, QuizAttempt, Souvenir, SouvenirOrder } from "../types";
import { 
  Award, Bell, CheckCircle, Clock, XCircle, FileText, Download, 
  ArrowUpRight, ShieldAlert, Check, Calendar, PlusCircle, 
  Gift, MessageSquare, Volume2, Video, HelpCircle, ShoppingBag, 
  ChevronRight, Sparkles, AlertCircle, ArrowLeft, RotateCcw, Camera
} from "lucide-react";
import QRCode from "qrcode";

interface StudentProfileProps {
  currentUser: Student;
  achievements: Achievement[];
  notifications: Notification[];
  students: Student[];
  quizzes: Quiz[];
  quizAttempts: QuizAttempt[];
  souvenirs: Souvenir[];
  souvenirOrders: SouvenirOrder[];
  onOpenCertificate: (achievement: Achievement, student: Student) => void;
  onMarkNotificationRead: (notificationId: string) => void;
  onAddNewClick: () => void;
  onAddNewScienceClick: () => void; // New
  onCompleteQuiz: (attempt: QuizAttempt) => void;
  onOrderSouvenir: (souvenirId: string, studentId: string) => void;
  onUpdateAvatar?: (userId: string, avatarUrl: string) => void;
}

export default function StudentProfile({
  currentUser,
  achievements,
  notifications,
  students,
  quizzes = [],
  quizAttempts = [],
  souvenirs = [],
  souvenirOrders = [],
  onOpenCertificate,
  onMarkNotificationRead,
  onAddNewClick,
  onAddNewScienceClick,
  onCompleteQuiz,
  onOrderSouvenir,
  onUpdateAvatar,
}: StudentProfileProps) {
  // Navigation tabs in profile
  const [profileTab, setProfileTab] = useState<"achievements" | "quizzes" | "souvenirs" | "notifications">("achievements");
  
  // File upload state for avatar
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Quick validation
    if (file.size > 2 * 1024 * 1024) {
      alert("Размер фото не должен превышать 2 МБ.");
      return;
    }
    
    setIsUploadingAvatar(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (typeof dataUrl === 'string' && onUpdateAvatar) {
        onUpdateAvatar(currentUser.id, dataUrl);
      }
      setIsUploadingAvatar(false);
    };
    reader.readAsDataURL(file);
  };

  
  // Sub-tabs inside Achievements history
  const [activeSubTab, setActiveSubTab] = useState<"approved" | "pending" | "rejected">("approved");

  // Active quiz playing state
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  const [portfolioQrCodeUrl, setPortfolioQrCodeUrl] = useState<string>("");

  useEffect(() => {
    const portfolioUrl = `${window.location.origin}${window.location.pathname}?verify_portfolio=${currentUser.id}`;
    QRCode.toDataURL(portfolioUrl, {
      width: 250,
      margin: 1,
      color: {
        dark: "#064e3b",
        light: "#ffffff"
      }
    })
      .then(url => {
        setPortfolioQrCodeUrl(url);
      })
      .catch(err => {
        console.error("QR Code generation error for portfolio:", err);
      });
  }, [currentUser.id]);

  // Filter achievements for this student
  const studentAchievements = useMemo(() => {
    return achievements.filter(a => a.studentId === currentUser.id);
  }, [achievements, currentUser.id]);

  const approved = studentAchievements.filter(a => a.status === ApplicationStatus.Approved);
  const pending = studentAchievements.filter(a => a.status === ApplicationStatus.Pending);
  const rejected = studentAchievements.filter(a => a.status === ApplicationStatus.Rejected);

  // Filter notifications for this student
  const studentNotifications = useMemo(() => {
    return notifications
      .filter(n => n.studentId === currentUser.id)
      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [notifications, currentUser.id]);

  const unreadNotifications = studentNotifications.filter(n => !n.isRead);

  // Filter orders for this student
  const studentOrders = useMemo(() => {
    return souvenirOrders.filter(o => o.studentId === currentUser.id);
  }, [souvenirOrders, currentUser.id]);

  // Aggregate points earned by achievements
  const totalApprovedScore = approved.reduce((sum, a) => sum + a.points, 0);

  // Dynamic Badge System Calculation
  const snoBadges = useMemo(() => {
    const totalApproved = approved.length;
    const completedQuizzesCount = quizAttempts.filter(at => at.studentId === currentUser.id).length;
    const completedOrdersCount = studentOrders.length;
    const hasHighValueAchievement = approved.some(a => a.points >= 30);

    return [
      {
        id: "sno_debut",
        name: "Дебютант СНО",
        description: "Одобрена первая научная заявка в системе СНО",
        icon: "🌱",
        unlocked: totalApproved >= 1,
        progress: Math.min(totalApproved, 1),
        target: 1,
        hint: "Одобрена 1 заявка",
        theme: { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" }
      },
      {
        id: "active_contributor",
        name: "Активный участник",
        description: "Одобрено 3 или более заявок на научные достижения",
        icon: "🔥",
        unlocked: totalApproved >= 3,
        progress: Math.min(totalApproved, 3),
        target: 3,
        hint: "Одобрено 3 заявки",
        theme: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" }
      },
      {
        id: "science_breakthrough",
        name: "Научный прорыв",
        description: "Получено достижение с оценкой не менее 30 баллов",
        icon: "⚡",
        unlocked: hasHighValueAchievement,
        progress: hasHighValueAchievement ? 1 : 0,
        target: 1,
        hint: "Достижение >= 30б",
        theme: { bg: "bg-teal-50", text: "text-teal-800", border: "border-teal-200" }
      },
      {
        id: "academic_titan",
        name: "Академический титан",
        description: "Одобрено 5 или более научных заявок",
        icon: "🏆",
        unlocked: totalApproved >= 5,
        progress: Math.min(totalApproved, 5),
        target: 5,
        hint: "Одобрено 5 заявок",
        theme: { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200" }
      },
      {
        id: "quiz_master",
        name: "Магистр викторин",
        description: "Успешно пройдена хотя бы одна викторина СНО",
        icon: "🧠",
        unlocked: completedQuizzesCount >= 1,
        progress: Math.min(completedQuizzesCount, 1),
        target: 1,
        hint: "Пройдена 1 викторина",
        theme: { bg: "bg-indigo-50", text: "text-indigo-800", border: "border-indigo-200" }
      },
      {
        id: "bseu_ambassador",
        name: "Посол бренда БГЭУ",
        description: "Приобретен корпоративный сувенир за набранные баллы",
        icon: "🛍️",
        unlocked: completedOrdersCount >= 1,
        progress: Math.min(completedOrdersCount, 1),
        target: 1,
        hint: "Заказан 1 сувенир",
        theme: { bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-200" }
      }
    ];
  }, [approved, quizAttempts, currentUser.id, studentOrders]);

  // Portfolio PDF export function representing official BSEU verification statement
  const handlePrintPortfolio = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Не удалось открыть окно печати. Пожалуйста, разрешите всплывающие окна для этого сайта.");
      return;
    }

    const achievementsRows = approved.map((ach, idx) => `
      <tr style="page-break-inside: avoid; border-bottom: 1px solid #1e293b;">
        <td style="padding: 9px; text-align: center; font-weight: bold; border: 1px solid #111827; font-size: 12px; font-family: 'Inter', sans-serif;">${idx + 1}</td>
        <td style="padding: 9px; text-align: left; font-weight: 700; border: 1px solid #111827; font-size: 12px; font-family: 'Inter', sans-serif; color: #0f172a;">${ach.title}</td>
        <td style="padding: 9px; text-align: left; border: 1px solid #111827; font-size: 11px; font-family: 'Inter', sans-serif;">${ach.category.split(" (")[0]}</td>
        <td style="padding: 9px; text-align: left; border: 1px solid #111827; font-size: 11px; font-family: 'Inter', sans-serif; font-style: italic;">${ach.supervisor || "Не указан"}</td>
        <td style="padding: 9px; text-align: center; border: 1px solid #111827; font-size: 11px; font-family: 'Inter', sans-serif;">${new Date(ach.date).toLocaleDateString("ru-RU")}</td>
        <td style="padding: 9px; text-align: center; font-weight: 800; border: 1px solid #111827; font-size: 12px; font-family: 'Inter', sans-serif; color: #047857;">+${ach.points} б.</td>
      </tr>
    `).join("");

    const totalPointsSum = approved.reduce((sum, a) => sum + a.points, 0);
    const verificationHashCode = `БГЭУ-ФЭМ-СВОД-${currentUser.id.toUpperCase().split("_")[1] || currentUser.id.toUpperCase()}-${approved.length}`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Справка-Выписка СНО БГЭУ - ${currentUser.fullName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap');
            
            body {
              font-family: 'Times New Roman', serif;
              padding: 40px 60px;
              color: #111111;
              line-height: 1.45;
              background-color: #ffffff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .header-block {
              text-align: center;
              font-family: 'Inter', sans-serif;
              text-transform: uppercase;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.3px;
              border-bottom: 2px solid #064e3b;
              padding-bottom: 10px;
              margin-bottom: 25px;
            }
            
            .header-block .title-main {
              font-size: 11px;
              margin-bottom: 2px;
            }
            
            .header-block .university {
              font-size: 13px;
              font-weight: 800;
              color: #064e3b;
              margin-bottom: 3px;
              letter-spacing: 0.5px;
            }
            
            .header-block .faculty {
              font-size: 11px;
              color: #374151;
              margin-bottom: 4px;
            }
            
            .header-block .contacts {
              font-size: 8.5px;
              font-weight: 400;
              text-transform: none;
              color: #4b5563;
            }
            
            .ref-meta-row {
              display: flex;
              justify-content: space-between;
              font-family: 'Inter', sans-serif;
              font-size: 11px;
              color: #374151;
              margin-bottom: 30px;
              padding: 0 5px;
            }
            
            .ref-meta-row .underline-box {
              border-bottom: 1px dashed #1f2937;
              padding: 0 8px;
              font-weight: 600;
              color: #000;
            }
            
            .doc-title {
              text-align: center;
              font-family: 'Inter', sans-serif;
              font-weight: 900;
              font-size: 17px;
              letter-spacing: 0.7px;
              color: #064e3b;
              margin: 25px 0 20px 0;
              text-transform: uppercase;
            }
            
            .doc-title .doc-subtitle {
              font-size: 10px;
              font-weight: 550;
              letter-spacing: 0;
              color: #4b5563;
              text-transform: none;
              margin-top: 4px;
            }
            
            .content-p {
              text-align: justify;
              text-indent: 1.25cm;
              font-size: 14px;
              margin-bottom: 10px;
              font-family: 'Times New Roman', serif;
            }
            
            .student-meta-summary {
              background-color: #f8fafc;
              border: 1.5px solid #064e3b;
              border-radius: 8px;
              padding: 15px 20px;
              margin: 15px 0 25px 0;
              font-size: 13.5px;
              font-family: 'Inter', sans-serif;
            }
            
            .student-meta-summary table {
              width: 100%;
              border-collapse: collapse;
            }
            
            .student-meta-summary td {
              padding: 3px 6px;
              border: none !important;
            }
            
            table.achievements-grid {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
              page-break-inside: auto;
            }
            
            table.achievements-grid th {
              background-color: #064e3b;
              color: white;
              padding: 10px;
              font-family: 'Inter', sans-serif;
              font-size: 11px;
              text-transform: uppercase;
              font-weight: 800;
              border: 1.5px solid #064e3b;
            }
            
            .signatures-block {
              margin-top: 40px;
              font-family: 'Inter', sans-serif;
              font-size: 12px;
            }
            
            .sig-line-row {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-bottom: 22px;
              position: relative;
            }
            
            .sig-line-row .label {
              width: 50%;
              line-height: 1.35;
            }
            
            .sig-line-row .label .sub-text {
              font-size: 9.5px;
              color: #4b5563;
              font-style: italic;
            }
            
            .sig-line-row .line-anchor {
              width: 25%;
              border-bottom: 1px solid #4b5563;
              text-align: center;
              font-size: 10.5px;
              color: #9ca3af;
              font-style: italic;
              padding-bottom: 2px;
              position: relative;
            }
            
            .sig-line-row .fullname {
              width: 25%;
              text-align: right;
              font-weight: 700;
              color: #111827;
            }
            
            .stamp-verify-container {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 35px;
              font-family: 'Inter', sans-serif;
              border-top: 1px solid #f3f4f6;
              padding-top: 20px;
              page-break-inside: avoid;
            }
            
            .round-stamp {
              width: 120px;
              height: 120px;
              transform: rotate(-3deg);
              opacity: 0.85;
            }
            
            .verification-box {
              text-align: right;
              font-size: 8.5px;
              font-family: 'JetBrains Mono', monospace;
              color: #4b5563;
              border-left: 2px solid #e5e7eb;
              padding-left: 15px;
            }
            
            .verification-box .code-title {
              font-weight: 700;
              color: #064e3b;
              font-size: 10px;
              margin-top: 2px;
            }
            
            .verification-box .tag {
              color: #047857;
              font-weight: 700;
              font-size: 9.5px;
              margin-top: 4px;
            }
            
            .vector-sig {
              position: absolute;
              left: 50%;
              bottom: -4px;
              transform: translateX(-50%);
              width: 85px;
              height: 38px;
              pointer-events: none;
            }
            
            @media print {
              body {
                padding: 0cm;
                margin: 0;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body onload="window.print()">
          <div class="header-block">
            <div class="title-main">Министерство образования Республики Беларусь</div>
            <div class="title-main">Учреждение образования</div>
            <div class="university">«Белорусский государственный экономический университет»</div>
            <div class="faculty">Факультет экономики и менеджмента</div>
            <div class="contacts">
              пр-т Партизанский, 26, г. Минск, 220070 | Тел: +375 (17) 209-80-00 | e-mail: fem@bseu.by
            </div>
          </div>

          <div class="ref-meta-row">
            <div>
              Исх. № <span class="underline-box">СНО-ФЭМ-СВОД/${currentUser.id.slice(-4).toUpperCase()}</span>
            </div>
            <div>
              «<span class="underline-box">&nbsp;&nbsp;${new Date().getDate()}&nbsp;&nbsp;</span>» 
              <span class="underline-box">&nbsp;&nbsp;${new Date().toLocaleString('ru-RU', { month: 'long' })}&nbsp;&nbsp;</span> 
              2026 г.
            </div>
          </div>

          <div class="doc-title">
            СПРАВКА-ВЫПИСКА ИЗ РЕЕСТРА ДОСТИЖЕНИЙ
            <div class="doc-subtitle">о результатах научно-исследовательской деятельности студента для представления в деканат</div>
          </div>

          <div class="content-p">
            Настоящая справка-выписка составлена на основании данных Единого верифицированного цифрового реестра достижений научно-активного студенчества Студенческого научного общества (СНО ФЭМ БГЭУ) и подтверждает научно-творческий статус обучающегося:
          </div>

          <div class="student-meta-summary">
            <table>
              <tr>
                <td style="font-weight: bold; width: 35%; color: #374151;">ФИО Обучающегося:</td>
                <td style="font-weight: 800; font-size: 15px; color: #0f172a;">${currentUser.fullName}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #374151;">Курс / Учебная группа:</td>
                <td><strong>${currentUser.course}</strong> учебный курс (академическая группа <strong>${currentUser.group}</strong>)</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #374151;">Специальность:</td>
                <td style="font-style: italic;">${currentUser.specialty}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #374151;">Суммарный рейтинг баллов:</td>
                <td><strong style="color: #047857; font-size: 15px;">+${totalPointsSum} баллов СНО (Наука)</strong></td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #374151;">Контактная почта:</td>
                <td>${currentUser.email}</td>
              </tr>
            </table>
          </div>

          <div class="content-p">
            За время обучения на факультете экономики и менеджмента УО «БГЭУ» студент продемонстрировал выраженный интерес к научно-исследовательской работе студентов (НИРС) и верифицировал в Совете СНО ФЭМ следующие индивидуальные результаты и достижения:
          </div>

          <table class="achievements-grid">
            <thead>
              <tr>
                <th style="width: 5%;">№</th>
                <th style="width: 45%; text-align: left;">Наименование научно-исследовательского достижения / работы</th>
                <th style="width: 20%; text-align: left;">Научное направление</th>
                <th style="width: 15%; text-align: left;">Науч. руководитель</th>
                <th style="width: 10%; text-align: center;">Дата</th>
                <th style="width: 5%; text-align: center;">Рейтинг</th>
              </tr>
            </thead>
            <tbody>
              ${approved.length > 0 ? achievementsRows : '<tr><td colspan="6" style="text-align: center; padding: 25px; color: #4b5563; font-style: italic; font-family: \'Inter\', sans-serif;">В Едином реестре достижений отсутствуют верифицированные записи для данного студента на текущий момент.</td></tr>'}
            </tbody>
          </table>

          <div class="content-p" style="margin-top: 15px;">
            Все перечисленные результаты соответствуют требованиям регламента СНО ФЭМ БГЭУ, прошли внутреннее рецензирование Совета молодых ученых, проверку на систему антиплагиата и полностью одобрены верификационной комиссией факультета.
          </div>

          <div class="content-p">
            Настоящая справка-выписка выдана для непосредственного предоставления администрации в <strong>Деканат факультета экономики и менеджмента БГЭУ</strong> для начисления поощрений, надбавок к академической стипендии за успехи в научно-исследовательской работе, согласования скидок на предстоящие семестры обучения или приоритетного учета при государственном распределении молодых специалистов.
          </div>

          <div class="signatures-block">
            
            <div class="sig-line-row">
              <div class="label">
                <strong>Председатель Совета СНО ФЭМ</strong><br/>
                <span class="sub-text">Совет молодых ученых, УО «БГЭУ»</span>
              </div>
              <div class="line-anchor">
                <!-- Vector handwriting signature snopova -->
                <svg class="vector-sig" viewBox="0 0 100 40" fill="none" stroke="#1d4ed8" stroke-width="1.8" stroke-linecap="round">
                  <path d="M12,24 C22,12 32,32 42,16 C48,12 60,4 72,22 C78,28 85,16 92,12" />
                  <path d="M28,21 C38,21 50,11 60,13" />
                </svg>
                подпись
              </div>
              <div class="fullname">К.Л. Снопова</div>
            </div>

            <div class="sig-line-row" style="margin-top: 20px;">
              <div class="label">
                <strong>Декан факультета экономики и менеджмента</strong><br/>
                <span class="sub-text">д.э.н., профессор, УО «БГЭУ»</span>
              </div>
              <div class="line-anchor">
                <!-- Vector handwriting signature petrovich -->
                <svg class="vector-sig" viewBox="0 0 100 40" fill="none" stroke="#2563eb" stroke-width="1.6" stroke-linecap="round">
                  <path d="M14,18 Q32,4 42,28 T70,8 T80,32 T90,14" />
                  <path d="M22,16 L75,16" />
                </svg>
                подпись
              </div>
              <div class="fullname">М.В. Петрович</div>
            </div>

          </div>

          <div class="stamp-verify-container">
            <!-- Round Blue Seal of BSEU -->
            <svg class="round-stamp" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#2563eb" stroke-width="1.6" stroke-dasharray="190 3" />
              <circle cx="60" cy="60" r="45" fill="none" stroke="#2563eb" stroke-width="0.9" />
              <circle cx="60" cy="60" r="30" fill="none" stroke="#2563eb" stroke-width="0.7" stroke-dasharray="2 2" />
              
              <path id="stampPath" d="M 60,60 m -41,0 a 41,41 0 1,1 82,0 a 41,41 0 1,1 -82,0" fill="none" />
              <text font-size="5" font-family="'Inter', sans-serif" font-weight="700" fill="#2563eb">
                <textPath href="#stampPath" startOffset="0%">
                  УО БЕЛОРУССКИЙ ГОСУДАРСТВЕННЫЙ ЭКОНОМИЧЕСКИЙ УНИВЕРСИТЕТ * ФЭМ *
                </textPath>
              </text>
              <path id="stampPathInner" d="M 60,60 m -24,0 a 24,24 0 1,1 48,0 a 24,24 0 1,1 -48,0" fill="none" />
              <text font-size="4.5" font-family="'Inter', sans-serif" fill="#2563eb">
                <textPath href="#stampPathInner" startOffset="0%">
                  * СТУДЕНЧЕСКОЕ НАУЧНОЕ ОБЩЕСТВО *
                </textPath>
              </text>
              
              <text x="60" y="56" text-anchor="middle" font-size="8" font-family="'Inter', sans-serif" font-weight="900" fill="#2563eb">СНО</text>
              <text x="60" y="65" text-anchor="middle" font-size="4.5" font-family="'Inter', sans-serif" font-weight="700" fill="#2563eb" letter-spacing="1">ФЭМ</text>
              <text x="60" y="71" text-anchor="middle" font-size="3.5" font-family="'Inter', sans-serif" fill="#2563eb">МИНСК</text>
            </svg>

            <div class="verification-box">
              <div style="display: flex; justify-content: flex-end; margin-bottom: 8px;">
                <!-- Real QR-Code pointing to Consolidated Verification Registry -->
                <img src="${portfolioQrCodeUrl}" width="65" height="65" style="border: 1px solid #cbd5e1; padding: 2px; background: white; border-radius: 4px;" alt="QR-код сводной сверки" />
              </div>
              <div>КОД ЭЛЕКТРОННОЙ ВЕРИФИКАЦИИ СНО:</div>
              <div class="code-title">
                ${verificationHashCode}
              </div>
              <div class="tag">✔ ЕДИНЫЙ ВЕРИФИКАЦИОННЫЙ РЕЕСТР</div>
              <div style="font-size: 8px; color: #6b7280; margin-top: 2px;">Единая база НИРС БГЭУ | СНО ФЭМ БГЭУ 2026</div>
            </div>
          </div>
          
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Interactive Quiz Start
  const startQuizGameplay = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIdx(0);
    setSelectedOptionIdx(null);
    setQuizScore(0);
    setQuizFinished(false);
  };

  const handleOptionSelect = (optionIdx: number) => {
    if (selectedOptionIdx !== null) return; // Prevent double answer
    setSelectedOptionIdx(optionIdx);
    
    const currentQuestion = activeQuiz?.questions[currentQuestionIdx];
    if (currentQuestion && optionIdx === currentQuestion.correctOptionIdx) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (!activeQuiz) return;
    
    if (currentQuestionIdx + 1 < activeQuiz.questions.length) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOptionIdx(null);
    } else {
      // Quiz finished
      setQuizFinished(true);
      
      const alreadyPassed = quizAttempts.some(
        at => at.quizId === activeQuiz.id && at.studentId === currentUser.id
      );

      // Award points only for the first completion
      const pointsToEarn = alreadyPassed ? 0 : activeQuiz.pointsAwarded;
      
      const newAttempt: QuizAttempt = {
        id: `attempt_${Date.now()}`,
        studentId: currentUser.id,
        studentName: currentUser.fullName,
        quizId: activeQuiz.id,
        quizTitle: activeQuiz.title,
        score: quizScore + (selectedOptionIdx === activeQuiz.questions[currentQuestionIdx].correctOptionIdx ? 1 : 0),
        totalQuestions: activeQuiz.questions.length,
        pointsEarned: pointsToEarn,
        date: new Date().toLocaleString("ru-RU", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })
      };
      
      onCompleteQuiz(newAttempt);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Styled Avatar Banner with Points Bank */}
      <div id="student-profile-banner" className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left min-w-0">
          
          <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={avatarInputRef} 
              onChange={handleAvatarSelect} 
            />
            <div className="relative">
              {currentUser.avatarUrl ? (
                <img 
                  src={currentUser.avatarUrl} 
                  alt="" 
                  referrerPolicy="no-referrer"
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border-4 border-white bg-slate-50 shrink-0 shadow-md transition-opacity ${isUploadingAvatar ? 'opacity-50' : 'group-hover:opacity-90'}`} 
                />
              ) : (
                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-slate-200 border-4 border-white flex items-center justify-center shrink-0 shadow-md ${isUploadingAvatar ? 'opacity-50' : ''}`}>
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.fullName)}&background=10b981&color=fff&size=128`} alt="Avatar" className="w-full h-full rounded-2xl object-cover" />
                </div>
              )}
              {/* Floating Camera Button */}
              <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-2 rounded-xl shadow-lg border-2 border-white transform transition-transform group-hover:scale-110 group-hover:bg-emerald-700">
                <Camera className="w-4 h-4" />
              </div>
            </div>
            
            <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center mb-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <span className="text-white text-[10px] font-bold text-center leading-tight px-1">Изменить<br/>фото</span>
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 id="user-display-name" className="text-xl font-black text-slate-900 leading-snug truncate max-w-sm">{currentUser.fullName}</h1>
              <span className="bg-emerald-100 text-emerald-850 border border-emerald-200 text-[10px] uppercase font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full whitespace-nowrap">
                {currentUser.course}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-sm sm:max-w-md truncate">
              {currentUser.specialty} | гр. <strong>{currentUser.group}</strong>
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Личный кабинет студента БГЭУ: {currentUser.email}</p>
          </div>
        </div>

        {/* Dynamic score summary blocks */}
        <div id="user-score-rank-summary" className="flex flex-wrap items-center gap-4 border-t border-slate-100 md:border-t-0 pt-4 md:pt-0 w-full md:w-auto justify-around md:justify-end shrink-0">
          {portfolioQrCodeUrl && (
            <div className="flex flex-col items-center bg-slate-50 border border-slate-150 rounded-2xl px-3 py-2 shrink-0">
              <img src={portfolioQrCodeUrl} className="w-14 h-14 border border-emerald-100 bg-white rounded-lg p-0.5 shadow-3xs" alt="QR-код сводного портфолио" />
              <span className="text-[7.5px] font-bold text-emerald-800 font-mono mt-1 tracking-wider uppercase">Портфолио QR</span>
            </div>
          )}

          <div className="text-center bg-slate-50 border border-slate-150 rounded-2xl px-5 py-3 min-w-[7.5rem] shadow-3xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Достижения</span>
            <div className="text-xl font-black text-slate-800 mt-0.5">{totalApprovedScore} б.</div>
            <span className="text-[9px] text-slate-400 mt-0.5 block">за статьи и гранты</span>
          </div>

          <div className="text-center bg-emerald-50 border border-emerald-150 rounded-2xl px-5 py-3 min-w-[8.5rem] shadow-xs ring-4 ring-emerald-50/40">
            <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">Свободный баланс</span>
            <div id="user-points-total" className="text-2.5xl font-black text-emerald-950 mt-0.5">{currentUser.totalPoints} б.</div>
            <span className="text-[9px] text-emerald-700/80 mt-0.5 block">для обмена на сувениры</span>
          </div>
        </div>
      </div>

      {/* SNO Achievements / Badges Panel */}
      <div id="student-sno-badges-panel" className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 shadow-3xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-0.5">
            <h2 className="text-sm font-black text-slate-850 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>Знаки отличия и СНО-бейджи</span>
            </h2>
            <p className="text-[11px] text-slate-500 ">
              Ваши автоматические академические награды за участие в жизни СНО БГЭУ. Одобрено достижений: <span className="font-bold text-emerald-800">{approved.length}</span>
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold bg-slate-100 px-2.5 py-1 rounded-lg text-slate-600 ">
            Очков по бейджам: {snoBadges.filter(b => b.unlocked).length} / {snoBadges.length}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {snoBadges.map((badge) => (
            <div 
              key={badge.id}
              className={`border rounded-xl p-3 flex flex-col items-center text-center justify-between transition-all duration-300 group relative overflow-hidden h-[155px] ${
                badge.unlocked 
                  ? `${badge.theme.bg} ${badge.theme.border} border-2 hover:scale-[1.03] shadow-3xs` 
                  : "bg-slate-50 border-slate-150 opacity-60"
              }`}
            >
              {/* Tooltip detail description on hover */}
              <div className="absolute inset-0 bg-slate-900/95 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-3 flex flex-col justify-center items-center text-[10px]">
                <span className="font-bold mb-1">{badge.name}</span>
                <span className="leading-tight text-center text-slate-300 mb-2">{badge.description}</span>
                <span className="bg-white/10 px-1.5 py-0.5 rounded text-[8px] font-mono">{badge.hint}</span>
              </div>

              <div className="space-y-2 w-full">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mx-auto shadow-inner transition duration-500 ${badge.unlocked ? "animate-bounce" : "bg-slate-200"}`}>
                    {badge.unlocked ? badge.icon : "🔒"}
                  </div>
                  {badge.unlocked && (
                    <span className="absolute top-0 right-1/4 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                </div>

                <div className="space-y-0.5">
                  <div className={`text-[11px] font-bold tracking-tight line-clamp-1 ${badge.unlocked ? badge.theme.text : "text-slate-500 "}`}>
                    {badge.name}
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono">
                    {badge.unlocked ? "Разблокировано" : "Заблокировано"}
                  </div>
                </div>
              </div>

              {/* Progress Bar inside individual badge */}
              <div className="w-full mt-2">
                <div className="flex justify-between items-center text-[8px] text-slate-400 mb-1">
                  <span>Прогресс:</span>
                  <span>{badge.progress}/{badge.target}</span>
                </div>
                <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${badge.unlocked ? "bg-emerald-600" : "bg-slate-400"}`}
                    style={{ width: `${(badge.progress / badge.target) * 100}%` }}
                  />
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* 2. Interactive Navigation Menu */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto no-scrollbar pb-px">
        <button
          onClick={() => { setProfileTab("achievements"); setActiveQuiz(null); }}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${profileTab === "achievements" ? "border-emerald-700 text-emerald-900" : "border-transparent text-slate-500 hover:text-slate-850"}`}
        >
          <Award className="w-4 h-4 text-emerald-600" />
          <span>Мои Достижения</span>
        </button>
        <button
          onClick={() => { setProfileTab("quizzes"); setActiveQuiz(null); }}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${profileTab === "quizzes" ? "border-emerald-700 text-emerald-900" : "border-transparent text-slate-500 hover:text-slate-850"}`}
        >
          <HelpCircle className="w-4 h-4 text-emerald-600" />
          <span>Викторины СНО</span>
          <span className="bg-amber-100 text-amber-900 text-[10px] px-1.5 py-0.2 rounded-full">New</span>
        </button>
        <button
          onClick={() => { setProfileTab("souvenirs"); setActiveQuiz(null); }}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${profileTab === "souvenirs" ? "border-emerald-700 text-emerald-900" : "border-transparent text-slate-500 hover:text-slate-850"}`}
        >
          <Gift className="w-4 h-4 text-emerald-600" />
          <span>Сувенирная Лавка</span>
          <span className="bg-emerald-100 text-emerald-900 text-[10px] px-1.5 py-0.2 rounded-full">Магазин</span>
        </button>
        <button
          onClick={() => { setProfileTab("notifications"); setActiveQuiz(null); }}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${profileTab === "notifications" ? "border-emerald-700 text-emerald-900" : "border-transparent text-slate-500 hover:text-slate-850"}`}
        >
          <Bell className="w-4 h-4 text-emerald-600" />
          <span>Уведомления</span>
          {unreadNotifications.length > 0 && (
            <span className="bg-red-500 text-white font-bold leading-none text-[9px] px-1.5 py-0.5 rounded-full">
              {unreadNotifications.length}
            </span>
          )}
        </button>
      </div>

      {/* 3. Render and process Current Tab View */}
      
      {/* Tab: Achievements */}
      {profileTab === "achievements" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-12 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h3 className="font-bold text-slate-805 text-base">История ваших заявок на достижения</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Мониторинг статуса одобрения Ваших поданных материалов и печать научно-творческого портфолио</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handlePrintPortfolio}
                    id="btn-print-portfolio"
                    className="flex items-center justify-center gap-1.5 flex-1 sm:flex-initial text-slate-800 border border-slate-200 hover:bg-slate-50 :bg-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition whitespace-nowrap shadow-3xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Справка для деканата (все достижения, PDF)</span>
                  </button>
                  <button
                    onClick={onAddNewScienceClick}
                    className="flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer transition whitespace-nowrap"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Подать научную работу</span>
                  </button>
                  <button
                    onClick={onAddNewClick}
                    className="flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer transition whitespace-nowrap"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Иное достижение</span>
                  </button>
                </div>
              </div>

              <div className="flex border-b border-slate-100 gap-2 mb-4">
                <button
                  onClick={() => setActiveSubTab("approved")}
                  className={`flex items-center gap-1.5 py-2 px-3 text-xs font-bold border-b-2 transition ${activeSubTab === "approved" ? "border-emerald-750 text-emerald-805" : "border-transparent text-slate-500 hover:text-slate-800 "}`}
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Верифицировано СНО ({approved.length})</span>
                </button>
                <button
                  onClick={() => setActiveSubTab("pending")}
                  className={`flex items-center gap-1.5 py-2 px-3 text-xs font-bold border-b-2 transition ${activeSubTab === "pending" ? "border-amber-600 text-amber-805" : "border-transparent text-slate-500 hover:text-slate-800 "}`}
                >
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>На модерации ({pending.length})</span>
                </button>
                <button
                  onClick={() => setActiveSubTab("rejected")}
                  className={`flex items-center gap-1.5 py-2 px-3 text-xs font-bold border-b-2 transition ${activeSubTab === "rejected" ? "border-red-600 text-red-805" : "border-transparent text-slate-500 hover:text-slate-800 "}`}
                >
                  <XCircle className="w-3.5 h-3.5 text-red-500" />
                  <span>Требует исправления ({rejected.length})</span>
                </button>
              </div>

              <div className="space-y-4">
                {activeSubTab === "approved" && (
                  approved.length === 0 ? (
                    <div className="text-center text-slate-400 text-xs py-10">Нет утвержденных достижений на данный момент. Вы можете поучаствовать в жизни СНО или опубликовать статью, баллы будут зачислены после модерации куратором.</div>
                  ) : (
                    approved.map((item) => (
                      <div key={item.id} className="p-4 border border-emerald-100/60 bg-emerald-50/20 rounded-2xl space-y-3 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600" />
                        <div className="flex justify-between items-start gap-2 border-b border-slate-100 pb-2.5 pl-1">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{item.category.split(" (")[0]}</span>
                            <h4 className="font-bold text-slate-805 text-sm mt-1">{item.title}</h4>
                          </div>
                          <span className="bg-emerald-100 text-emerald-800 font-black px-2.5 py-1 rounded-sm text-xs shrink-0 whitespace-nowrap">
                            +{item.points} б.
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed pl-1">{item.description}</p>
                        {item.supervisor && (
                          <p className="text-xs text-slate-650 pl-1"><strong>Научный руководитель:</strong> {item.supervisor}</p>
                        )}
                        <div className="flex items-center justify-between gap-4 pt-1.5 text-[10px] text-slate-400 font-mono pl-1">
                          <span>Дата: {new Date(item.date).toLocaleDateString("ru-RU")}</span>
                          {item.category === ActivityCategory.Science && (
                            <button
                              onClick={() => onOpenCertificate(item, currentUser)}
                              className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold px-3 py-1 rounded-lg transition uppercase tracking-wider text-[9px] cursor-pointer"
                            >
                              Сформировать справку СНО
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )
                )}

                {activeSubTab === "pending" && (
                  pending.length === 0 ? (
                    <div className="text-center text-slate-400 text-xs py-10">Нет находящихся на рассмотрении заявок у куратора. Все ваши заявки уже промодерированы адекватным активом Совета СНО ФЭМ.</div>
                  ) : (
                    pending.map((item) => (
                      <div key={item.id} className="p-4 border border-amber-100 bg-amber-50/15 rounded-2xl space-y-3 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400" />
                        <div className="flex justify-between items-start gap-2 border-b border-amber-100/40 pb-2.5 pl-1">
                          <div>
                            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">{item.category.split(" (")[0]}</span>
                            <h4 className="font-bold text-slate-805 text-sm mt-1">{item.title}</h4>
                          </div>
                          <span className="bg-amber-100 text-amber-805 font-bold px-2.5 py-1 rounded-sm text-xs shrink-0">
                            +{item.points} б.
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed pl-1">{item.description}</p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-dashed border-amber-100/40 pl-1">
                          <span className="flex items-center gap-1 text-amber-700 font-bold">
                            <Clock className="w-3.5 h-3.5 animate-spin" />
                            <span>На рассмотрении активом СНО БГЭУ</span>
                          </span>
                          <span>Подано: {new Date(item.date).toLocaleDateString("ru-RU")}</span>
                        </div>
                      </div>
                    ))
                  )
                )}

                {activeSubTab === "rejected" && (
                  rejected.length === 0 ? (
                    <div className="text-center text-slate-400 text-xs py-10">Нет отклоненных заявок. Ваши документы соответствуют требованиям оформления СНО! Поздравляем!</div>
                  ) : (
                    rejected.map((item) => (
                      <div key={item.id} className="p-4 border border-red-100 bg-red-50/15 rounded-2xl space-y-4 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
                        <div className="flex justify-between items-start gap-2 border-b border-red-100/35 pb-2.5 pl-1">
                          <div>
                            <span className="text-[10px] font-bold text-red-650 uppercase tracking-wide">{item.category.split(" (")[0]}</span>
                            <h4 className="font-bold text-slate-805 text-sm mt-1">{item.title}</h4>
                          </div>
                          <span className="bg-red-50 text-red-700 font-bold px-2.5 py-1 rounded-sm text-xs shrink-0">
                            {item.points} б.
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed line-through pl-1">{item.description}</p>
                        <div className="bg-red-50 border border-red-150 p-3 rounded-xl flex items-start gap-2.5 text-xs text-red-900 leading-relaxed font-sans">
                          <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="block text-[11px] text-red-800 font-bold uppercase tracking-wide mb-0.5">Требуется доработка (комментарий СНО):</strong>
                            <p className="font-medium italic">«{item.rejectReason || "Пожалуйста, сверьте соответствие указанного ФИО и названия статьи в предоставленном скрине."}»</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Quizzes */}
      {profileTab === "quizzes" && (
        <div className="space-y-6">
          {!activeQuiz ? (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
                <h3 className="font-bold text-slate-900 text-base">Интерактивные викторины СНО ФЭМ</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Активисты СНО регулярно составляют мини-квизы об истории БГЭУ, основах экономики, менеджмента и ВАК публикациях. Прохождение викторин позволяет быстро заработать дополнительные баллы СНО для обмена на фирменный мерч!
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-amber-800 bg-amber-50 rounded-xl p-3 text-[11px]">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span className="font-medium">
                    Внимание: баллы за каждую викторину начисляются только **один раз** (при первом прохождении). Вы можете проходить викторину повторно для самопроверки, но новые баллы начислены не будут.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quizzes.map((quiz) => {
                  const attempt = quizAttempts.find(
                    at => at.quizId === quiz.id && at.studentId === currentUser.id
                  );
                  return (
                    <div 
                      key={quiz.id}
                      className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-xs transition duration-200 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                            +{quiz.pointsAwarded} б. СНО
                          </span>
                          {attempt && (
                            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>Пройдено ({attempt.score}/{attempt.totalQuestions})</span>
                            </span>
                          )}
                        </div>
                        <h4 className="font-black text-slate-850 text-base leading-snug">{quiz.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{quiz.description}</p>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Количество вопросов: {quiz.questions.length} | Создано: {new Date(quiz.createdAt).toLocaleDateString("ru-RU")}
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                        {attempt ? (
                          <div className="text-[11px] text-slate-400 font-medium italic">
                            Баллы за викторину уже зачислены
                          </div>
                        ) : (
                          <div className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                            <span>Доступно новое прохождение</span>
                          </div>
                        )}
                        <button
                          onClick={() => startQuizGameplay(quiz)}
                          className="bg-slate-900 text-white hover:bg-emerald-850 hover:text-white text-xs font-black px-4 py-2 rounded-xl transition duration-150 flex items-center gap-1 cursor-pointer"
                        >
                          <span>{attempt ? "Повторить квиз" : "Начать"}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Active Quiz Gameplay Stage */
            <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-8 max-w-2xl mx-auto space-y-6 shadow-xs relative">
              
              {/* Back Button */}
              <button 
                onClick={() => setActiveQuiz(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition flex items-center gap-1 text-xs cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Выйти из режима викторины</span>
              </button>

              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block font-mono">Викторина от СНО</span>
                <h3 className="font-black text-slate-900 text-lg sm:text-xl mt-1 leading-snug">{activeQuiz.title}</h3>
              </div>

              {!quizFinished ? (
                /* Question screen */
                <div className="space-y-5">
                  {/* Progress Status Bar */}
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-450">
                    <span>Вопрос {currentQuestionIdx + 1} из {activeQuiz.questions.length}</span>
                    <span>Верных ответов: {quizScore}</span>
                  </div>
                  
                  {/* Visual Progress percentage */}
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full transition-all duration-300"
                      style={{ width: `${((currentQuestionIdx) / activeQuiz.questions.length) * 100}%` }}
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-850 text-base leading-relaxed">
                      {activeQuiz.questions[currentQuestionIdx].text}
                    </h4>

                    {/* Integrated Media Renderer */}
                    {activeQuiz.questions[currentQuestionIdx].mediaUrl && (
                      <div className="border border-slate-150 rounded-xl overflow-hidden max-h-60 bg-black flex items-center justify-center relative">
                        {activeQuiz.questions[currentQuestionIdx].mediaType === 'image' && (
                          <img 
                            src={activeQuiz.questions[currentQuestionIdx].mediaUrl} 
                            alt="Вопрос викторины" 
                            referrerPolicy="no-referrer"
                            className="max-h-60 max-w-full object-contain" 
                          />
                        )}
                        {activeQuiz.questions[currentQuestionIdx].mediaType === 'video' && (
                          <video 
                            controls 
                            src={activeQuiz.questions[currentQuestionIdx].mediaUrl} 
                            className="max-h-60 w-full object-contain"
                          />
                        )}
                        {activeQuiz.questions[currentQuestionIdx].mediaType === 'audio' && (
                          <div className="p-6 bg-slate-50 w-full flex flex-col items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                              <Volume2 className="w-4 h-4 text-emerald-700" />
                              <span>Аудиофайл викторины СНО БГЭУ</span>
                            </span>
                            <audio 
                              controls 
                              src={activeQuiz.questions[currentQuestionIdx].mediaUrl} 
                              className="w-full max-w-md"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Question Options List */}
                    <div className="space-y-2.5">
                      {activeQuiz.questions[currentQuestionIdx].options.map((opt, oIdx) => {
                        let btnStyle = "bg-slate-50 hover:bg-slate-100 :bg-slate-700 border-slate-200 text-slate-800 ";
                        let feedbackIcon = null;

                        if (selectedOptionIdx !== null) {
                          if (oIdx === activeQuiz.questions[currentQuestionIdx].correctOptionIdx) {
                            btnStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-900 font-bold";
                            feedbackIcon = <Check className="w-4 h-4 text-emerald-600 shrink-0" />;
                          } else if (oIdx === selectedOptionIdx) {
                            btnStyle = "bg-red-500/10 border-red-500 text-red-900 line-through";
                            feedbackIcon = <XCircle className="w-4 h-4 text-red-600 shrink-0" />;
                          } else {
                            btnStyle = "bg-slate-50 border-slate-100 text-slate-400 opacity-60";
                          }
                        }

                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleOptionSelect(oIdx)}
                            className={`w-full p-4.5 rounded-xl border text-left text-xs transition flex justify-between items-center cursor-pointer ${btnStyle}`}
                            disabled={selectedOptionIdx !== null}
                          >
                            <span>{opt}</span>
                            {feedbackIcon}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Core answer explanation feedback board */}
                  {selectedOptionIdx !== null && (
                    <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-2 animate-fadeIn">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-emerald-700" />
                        <span className="text-xs font-black uppercase text-slate-800 tracking-wide">
                          Разъяснение СНО ФЭМ
                        </span>
                      </div>
                      <p className="text-xs text-slate-650 leading-relaxed font-sans italic">
                        {activeQuiz.questions[currentQuestionIdx].explanation}
                      </p>
                    </div>
                  )}

                  {/* Footer Section */}
                  {selectedOptionIdx !== null && (
                    <button
                      onClick={handleNextQuestion}
                      className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold p-4 rounded-xl text-xs transition duration-150 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>
                        {currentQuestionIdx + 1 === activeQuiz.questions.length ? "Завершить викторину" : "Следующий вопрос"}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                /* Finished Screen */
                <div className="text-center space-y-6 py-4 animate-fadeIn">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500 flex items-center justify-center mx-auto text-emerald-600">
                    <Sparkles className="w-8 h-8 fill-emerald-550" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <h4 className="font-black text-slate-900 text-lg">Поздравляем! Вы завершили викторину!</h4>
                    <p className="text-xs text-slate-500 ">Ваш результирующий балл научно-исследовательского тестирования:</p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl border border-slate-150 p-6 max-w-sm mx-auto space-y-1.5">
                    <div className="text-3.5xl font-black text-emerald-950 font-mono">
                      {quizScore} из {activeQuiz.questions.length}
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 ">правильных ответов</p>
                    
                    <div className="border-t border-slate-150 mt-3 pt-3">
                      {quizAttempts.some(at => at.quizId === activeQuiz.id && at.studentId === currentUser.id) ? (
                        <span className="text-[10px] text-slate-400 italic block">
                          Вы уже проходили этот квиз ранее. Баллы зачислены один раз.
                        </span>
                      ) : (
                        <span className="text-xs font-black text-emerald-800 block">
                          Вам начислено +{activeQuiz.pointsAwarded} баллов СНО!
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-center max-w-md mx-auto pt-3">
                    <button
                      onClick={() => startQuizGameplay(activeQuiz)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Пройти заново</span>
                    </button>
                    <button
                      onClick={() => setActiveQuiz(null)}
                      className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-4 py-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Вернуться к списку</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab: Souvenir shop catalog */}
      {profileTab === "souvenirs" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col md:flex-row gap-5 items-center justify-between">
            <div className="space-y-1.5 text-center md:text-left">
              <h3 className="font-bold text-slate-900 text-base">Магазин обмена баллов на СНО-сувениры</h3>
              <p className="text-xs text-slate-500 ">
                За победы в конференциях, доклады, верифицированные публикации ВАК и прохождение викторин вы копите баллы. На этой витрине вы можете моментально обменять свои баллы СНО на полезные сувениры от Совета СНО ФЭМ БГЭУ.
              </p>
            </div>
            
            <div className="bg-emerald-50 text-emerald-950 px-5 py-3.5 rounded-2xl border border-emerald-150 text-center shrink-0 w-full md:w-auto">
              <span className="text-[9px] text-emerald-850 uppercase tracking-widest font-black block">Доступно баллов</span>
              <div className="text-2.5xl font-mono font-black mt-0.5">{currentUser.totalPoints} б.</div>
            </div>
          </div>

          {/* Informative instructions banner on where and how to pick up materials */}
          <div className="bg-amber-50/75 border border-amber-200/80 rounded-2xl p-4.5 flex gap-3 text-amber-900 text-xs">
            <span className="text-xl">📍</span>
            <div className="space-y-1">
              <span className="font-extrabold block text-amber-950">Где и как забрать ваш сувенир:</span>
              <p className="leading-relaxed">
                После успешного обмена баллов на подарок обратитесь в <strong className="font-bold text-slate-900 bg-amber-100 px-1.5 py-0.5 rounded">кабинет активистов СНО ФЭМ (ауд. 320, корпус 4)</strong>. Назовите куратору СНО ФЭМ ваше ФИО и сообщите <strong className="font-black text-emerald-950 underline decoration-emerald-800">Код операции</strong>, который отображается в вашей истории заказов внизу. Куратор проверит код и с радостью выдаст сувенир!
              </p>
            </div>
          </div>

          {/* Grid Layout for souvenirs list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {souvenirs.map((item) => {
              const isPurchasable = currentUser.totalPoints >= item.cost;
              return (
                <div 
                  key={item.id}
                  className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:border-emerald-500/30 hover:shadow-xs transition duration-200 flex flex-col justify-between"
                  id={`souvenir-item-card-${item.id}`}
                >
                  <div className="p-4.5 space-y-3.5">
                    {/* Item Image */}
                    {item.imageUrl ? (
                      <div className="h-44 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center border border-slate-100 relative">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover" 
                        />
                        <span className="absolute bottom-2 right-2 bg-emerald-800 text-white font-mono font-black rounded-lg px-2.5 py-1 text-xs shadow-sm">
                          {item.cost} б.
                        </span>
                      </div>
                    ) : (
                      <div className="h-44 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-150 relative">
                        <ShoppingBag className="w-10 h-10 text-slate-400" />
                        <span className="absolute bottom-2 right-2 bg-emerald-800 text-white font-mono font-black rounded-lg px-2.5 py-1 text-xs">
                          {item.cost} б.
                        </span>
                      </div>
                    )}

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-900 text-sm leading-tight">{item.name}</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3">{item.description}</p>
                    </div>
                  </div>

                  <div className="p-4 border-t border-slate-50 bg-slate-50/50">
                    <button
                      onClick={() => onOrderSouvenir(item.id, currentUser.id)}
                      disabled={!isPurchasable}
                      className={`w-full py-2 px-3 rounded-xl text-[11px] font-black transition duration-150 cursor-pointer ${
                        isPurchasable 
                          ? "bg-slate-900 hover:bg-emerald-850 text-white" 
                          : "bg-slate-150 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      {isPurchasable ? "Обменять баллы" : `Необходимо еще ${item.cost - currentUser.totalPoints} б.`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Orders History Grid */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs pb-6">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-800" />
              <span>Ваша история заказов сувениров</span>
            </h3>

            {studentOrders.length === 0 ? (
              <div className="text-center text-slate-400 text-xs py-10">Истории заказов пока нет. Приобретите фирменную ручку СНО ФЭМ за баллы, чтобы начать!</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-650 min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Наименование сувенира</th>
                      <th className="py-2.5 px-3">Код операции</th>
                      <th className="py-2.5 px-3">Стоимость</th>
                      <th className="py-2.5 px-3">Дата заказа</th>
                      <th className="py-2.5 px-3 text-right">Статус СНО</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentOrders.map((ord) => {
                      let statusBadge = null;
                      if (ord.status === 'pending') {
                        statusBadge = <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-md text-[10px] font-bold">⌛ Оформлен (ауд. 320)</span>;
                      } else if (ord.status === 'completed') {
                        statusBadge = <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md text-[10px] font-bold">✅ Получено</span>;
                      } else if (ord.status === 'cancelled') {
                        statusBadge = <span className="bg-red-50 text-red-700 border border-red-150 px-2.5 py-1 rounded-md text-[10px] font-bold line-through">❌ Отменен (возврат)</span>;
                      }

                      return (
                        <tr key={ord.id} className="border-b border-slate-100/50 hover:bg-slate-50/55 transition">
                          <td className="py-3 px-3 font-semibold text-slate-800 ">{ord.souvenirName}</td>
                          <td className="py-3 px-3">
                            <span 
                              className="font-mono text-emerald-900 font-extrabold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 rounded-lg px-2 py-0.5 text-[10px] uppercase tracking-wider select-all cursor-copy"
                              title="Нажмите трижды, чтобы скопировать код"
                            >
                              {ord.id}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-bold text-emerald-800">{ord.cost} баллов</td>
                          <td className="py-3 px-3 text-slate-400">{ord.date}</td>
                          <td className="py-3 px-3 text-right">{statusBadge}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {studentOrders.some(o => o.status === 'pending') && (
              <div className="mt-4 bg-amber-50/50 border border-dashed border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 flex items-start gap-2.5">
                <span className="text-sm">🎫</span>
                <p className="leading-relaxed">
                  У вас есть активные (невыданные) подарки в корзине. Пожалуйста, покажите СНО-куратору в <strong className="font-bold">ауд. 320, корпус 4</strong> соответствующий зеленый <strong className="font-extrabold">Код операции</strong> для получения сувениров.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Inbox Notifications center */}
      {profileTab === "notifications" && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs max-w-2xl mx-auto pb-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bell className="w-5 h-5 text-emerald-800" />
                {unreadNotifications.length > 0 && (
                  <span id="unread-dot" className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full ring-2 ring-white" />
                )}
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Информационный ящик СНО ФЭМ БГЭУ</h3>
            </div>
            
            {unreadNotifications.length > 0 && (
              <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-100">
                {unreadNotifications.length} новых сообщений
              </span>
            )}
          </div>

          <div className="space-y-3" id="profile-notifications-feed">
            {studentNotifications.length === 0 ? (
              <div className="text-center text-slate-400 text-xs py-12">
                Ваша история уведомлений пуста. Вы будете мгновенно получать статусы одобрения ваших научных статей, кураторские начисления за конференции БГЭУ, а также объявления о новых квизах сюда!
              </div>
            ) : (
              studentNotifications.map((not) => {
                let badgeColors = "bg-slate-50 border-slate-100 text-slate-600 ";
                if (not.status === "success") badgeColors = "bg-emerald-50 border-emerald-100 text-emerald-800";
                if (not.status === "error") badgeColors = "bg-red-50 border-red-100 text-red-700";

                return (
                  <div 
                    key={not.id} 
                    className={`p-4 rounded-2xl border relative transition ${not.isRead ? "bg-white border-slate-100 opacity-75" : "bg-slate-50 border-slate-150 shadow-2xs font-medium"}`}
                  >
                    {!not.isRead && (
                      <button
                        onClick={() => onMarkNotificationRead(not.id)}
                        className="absolute right-3 top-3 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 :bg-slate-700 rounded-lg transition"
                        title="Прочитано"
                      >
                        <Check className="w-4 h-4 text-emerald-700" />
                      </button>
                    )}

                    <div className="space-y-1.5 pr-8">
                      <span className={`inline-block text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md border ${badgeColors}`}>
                        {not.title}
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed font-sans">{not.message}</p>
                      <div className="text-[9px] font-mono text-slate-400 italic flex items-center gap-1 pt-1.5">
                        <Calendar className="w-2.5 h-2.5" />
                        <span>{not.date}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

    </div>
  );
}
