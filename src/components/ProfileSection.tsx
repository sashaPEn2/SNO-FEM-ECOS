import React, { useState } from 'react';
import { useFirebase } from '../context/FirebaseContext';
import { Achievement, StudentProfile, ExemptionCertificate } from '../types';
import { jsPDF } from 'jspdf';
import { 
  User, Mail, Phone, Hash, Award, Trophy, BookOpen, GraduationCap, 
  Sparkles, Calendar, BookCheck, ClipboardList, PenTool, Edit3, 
  CheckCircle, ArrowUpRight, TrendingUp, HelpCircle, FileSpreadsheet,
  AlertCircle, ShoppingBag, Gift, Briefcase, Loader2
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line 
} from 'recharts';

export default function ProfileSection() {
  const { 
    profile, 
    timelineItems, 
    registrations, 
    completedQuizzes, 
    certificates,
    updateStudentProfileFromAdmin,
    isSandboxActive,
    purchaseExemption
  } = useFirebase();

  // Exemption Certificates States
  const [downloadingCertId, setDownloadingCertId] = useState<string | null>(null);
  const [isDownloadingAny, setIsDownloadingAny] = useState(false);

  // Helper function to fetch font as base64 with mirrors/fallbacks
  const getFontBase64WithFallbacks = async (urls: string[]): Promise<string> => {
    let lastError: Error | null = null;
    for (const url of urls) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP status ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        
        // Convert arrayBuffer to base64
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
      } catch (err) {
        console.warn(`Font fetch failed for ${url}. Trying next available fallback...`, err);
        lastError = err as Error;
      }
    }
    throw lastError || new Error('No URLs provided');
  };

  // Generate highly polished landscape A4 PDF Certificate
  const handleDownloadCertificatePDF = async (cert: ExemptionCertificate) => {
    setDownloadingCertId(cert.id);
    setIsDownloadingAny(true);
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // High-availability mirrors to load Roboto with Cyrillic support
      const REGULAR_FONT_URLS = [
        'https://cdn.jsdelivr.net/npm/roboto-fontface@0.10.0/fonts/roboto/Roboto-Regular.ttf',
        'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
        'https://unpkg.com/pdfmake@0.1.66/build/fonts/Roboto/Roboto-Regular.ttf'
      ];

      const BOLD_FONT_URLS = [
        'https://cdn.jsdelivr.net/npm/roboto-fontface@0.10.0/fonts/roboto/Roboto-Bold.ttf',
        'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
        'https://unpkg.com/pdfmake@0.1.66/build/fonts/Roboto/Roboto-Medium.ttf'
      ];

      try {
        const [reg64, bold64] = await Promise.all([
          getFontBase64WithFallbacks(REGULAR_FONT_URLS),
          getFontBase64WithFallbacks(BOLD_FONT_URLS)
        ]);

        doc.addFileToVFS('Roboto-Regular.ttf', reg64);
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');

        doc.addFileToVFS('Roboto-Bold.ttf', bold64);
        doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');

        doc.setFont('Roboto', 'normal');
      } catch (fontErr) {
        console.error('Could not load Cyrillic fonts from any online CDN', fontErr);
        console.warn('Внимание: Не удалось подключиться к серверам шрифтов. Текст может отображаться некорректно.');
      }

      // Border & Frame (Landscape size is 297mm x 210mm)
      doc.setDrawColor(30, 41, 59); // slate-800
      doc.setLineWidth(1.5);
      doc.rect(10, 10, 277, 190, 'S');

      doc.setDrawColor(234, 179, 8); // Gold/amber-500
      doc.setLineWidth(0.5);
      doc.rect(14, 14, 269, 182, 'S');

      const cornerSize = 8;
      doc.setFillColor(30, 41, 59);
      doc.rect(14, 14, cornerSize, cornerSize, 'F');
      doc.rect(283 - cornerSize, 14, cornerSize, cornerSize, 'F');
      doc.rect(14, 196 - cornerSize, cornerSize, cornerSize, 'F');
      doc.rect(283 - cornerSize, 196 - cornerSize, cornerSize, cornerSize, 'F');

      let y = 28;
      doc.setFontSize(8.5);
      doc.setFont('Roboto', 'normal');
      doc.setTextColor(100, 110, 120);
      doc.text('МИНИСТЕРСТВО ОБРАЗОВАНИЯ РЕСПУБЛИКИ БЕЛАРУСЬ', 148.5, y, { align: 'center' });
      
      y += 4.5;
      doc.text('УО «БЕЛОРУССКИЙ ГОСУДАРСТВЕННЫЙ ЭКОНОМИЧЕСКИЙ УНИВЕРСИТЕТ»', 148.5, y, { align: 'center' });
      
      y += 4.5;
      doc.setFont('Roboto', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('ФАКУЛЬТЕТ ЭКОНОМИКИ И МЕНЕДЖМЕНТА • СТУДЕНЧЕСКОЕ НАУЧНОЕ ОБЩЕСТВО', 148.5, y, { align: 'center' });

      y += 6;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(30, y, 267, y);

      y += 18;
      doc.setFontSize(24);
      doc.setFont('Roboto', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('СЕРТИФИКАТ УЧАСТНИКА', 148.5, y, { align: 'center' });

      y += 6;
      doc.setFontSize(10);
      doc.setFont('Roboto', 'normal');
      doc.setTextColor(234, 179, 8);
      doc.text('ВЕРИФИЦИРОВАНО В РЕЕСТРЕ НАУЧНОЙ АКТИВНОСТИ СНО БГЭУ', 148.5, y, { align: 'center', charSpace: 1.5 });

      y += 16;
      doc.setFontSize(12);
      doc.setFont('Roboto', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text('Настоящим свидетельством подтверждается, что студент-исследователь', 148.5, y, { align: 'center' });

      y += 12;
      doc.setFontSize(18);
      doc.setFont('Roboto', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(cert.studentName, 148.5, y, { align: 'center' });

      y += 8;
      doc.setFontSize(11);
      doc.setFont('Roboto', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`Обучающийся ${cert.course || profile?.course || 3}-го курса группы ${cert.studentGroup || profile?.group} факультета экономики и менеджмента`, 148.5, y, { align: 'center' });

      y += 14;
      doc.setFontSize(11);
      doc.text('успешно проявил(а) научно-исследовательскую активность по теме / направлению:', 148.5, y, { align: 'center' });

      y += 8;
      doc.setFontSize(13);
      doc.setFont('Roboto', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(`«${cert.reason}»`, 148.5, y, { align: 'center', maxWidth: 210 });

      y += 14;
      doc.setFontSize(10.5);
      doc.setFont('Roboto', 'normal');
      doc.setTextColor(71, 85, 105);
      const exemptionPeriod = cert.endDate && cert.endDate !== cert.targetExemptionDate
        ? `с ${cert.targetExemptionDate} по ${cert.endDate}`
        : `${cert.targetExemptionDate} г.`;
      
      doc.text(`За научную деятельность начислено и зачтено ${cert.pointsDeducted} баллов СНО БГЭУ.`, 148.5, y, { align: 'center' });
      y += 5.5;

      const reasonLower = cert.reason ? cert.reason.toLowerCase() : '';
      if (reasonLower.includes('мерч') || reasonLower.includes('худи') || reasonLower.includes('значок') || reasonLower.includes('толстовка')) {
        doc.text('Данный купон-сертификат является официальным основанием для получения фирменного мерча', 148.5, y, { align: 'center' });
        y += 5;
        doc.text('научного общества в кабинете СНО ФЭМ БГЭУ при предъявлении QR-кода/Проверочного хэша.', 148.5, y, { align: 'center' });
      } else if (reasonLower.includes('ринц') || reasonLower.includes('публикац') || reasonLower.includes('стать')) {
        doc.text('Данный документ подтверждает право на приоритетную публикацию научной работы', 148.5, y, { align: 'center' });
        y += 5;
        doc.text('в ежегодном сборнике научных материалов СНО ФЭМ с занесением в базу цитирования РИНЦ.', 148.5, y, { align: 'center' });
      } else if (reasonLower.includes('библиот') || reasonLower.includes('абонемент') || reasonLower.includes('баз')) {
        doc.text('Данное свидетельство предоставляет право на VIP-пользование научным залом', 148.5, y, { align: 'center' });
        y += 5;
        doc.text(`и приоритетный доступ к исследовательским базам аналитических материалов на период: ${exemptionPeriod}`, 148.5, y, { align: 'center' });
      } else if (reasonLower.includes('коучинг') || reasonLower.includes('письмо') || reasonLower.includes('рекомендател')) {
        doc.text('Свидетельство подтверждает прохождение карьерной сессии с предоставлением официального', 148.5, y, { align: 'center' });
        y += 5;
        doc.text('рекомендательного письма от лица деканата факультета экономики и менеджмента БГЭУ.', 148.5, y, { align: 'center' });
      } else {
        doc.text(`Данная работа является официальным основанием для освобождения от занятий на период: ${exemptionPeriod}`, 148.5, y, { align: 'center' });
      }

      y = 158;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.rect(25, y, 110, 26, 'F');
      doc.rect(25, y, 110, 26, 'S');

      doc.setFontSize(7.5);
      doc.setFont('Roboto', 'bold');
      doc.setTextColor(100, 110, 120);
      doc.text('СИСТЕМА БЕЗОПАСНОСТИ СНО RESTR', 30, y + 5);
      
      doc.setFont('Roboto', 'normal');
      doc.setFontSize(8);
      doc.text(`Уникальный ID: ${cert.id}`, 30, y + 11);
      doc.text(`Дата выдачи: ${cert.dateRequested || new Date().toLocaleDateString('ru-RU')}`, 30, y + 16);
      
      doc.setFont('Roboto', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(`Проверочный хэш: ${cert.verificationCode}`, 30, y + 21);

      doc.setFontSize(9);
      doc.setFont('Roboto', 'bold');
      doc.setTextColor(51, 65, 85);
      doc.text('Председатель СНО ФЭМ БГЭУ:', 155, y + 6);
      doc.line(205, y + 6, 255, y + 6);
      doc.setFont('Roboto', 'normal');
      doc.setFontSize(8.5);
      doc.text('(Терро А.В.)', 215, y + 10);

      doc.setFont('Roboto', 'bold');
      doc.setFontSize(9);
      doc.text('Декан факультета ФЭМ (М.П.):', 155, y + 18);
      doc.line(205, y + 18, 255, y + 18);
      doc.setFont('Roboto', 'normal');
      doc.setFontSize(8.5);
      doc.text('(СНО ФЭМ БГЭУ)', 215, y + 22);

      const fileName = `sno_certificate_${cert.id}_${cert.studentName.replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error('Error generating PDF Certificate: ', err);
    } finally {
      setDownloadingCertId(null);
      setIsDownloadingAny(false);
    }
  };

  // Shop declarations and states
  const SHOP_ITEMS = [
    {
      id: 'exemption',
      title: 'Освобождение от учебных занятий',
      description: 'Официальная справка-обоснование СНО ФЭМ БГЭУ для деканата об уважительной причине пропуска.',
      cost: 100,
      iconName: 'exemption',
      longDescription: 'Официальный бланк-сертификат СНО ФЭМ БГЭУ, согласованный с председателем СНО и деканатом факультета экономики и менеджмента. Позволяет официально обосновать отсутствие на аудиторных занятиях на выбранный период за счет высокой научной активности.'
    },
    {
      id: 'merch',
      title: 'Фирменный научный мерч СНО БГЭУ',
      description: 'Качественное трикотажное оверсайз-худи СНО ФЭМ или набор металлических значков исследователя БГЭУ.',
      cost: 185,
      iconName: 'merch',
      longDescription: 'Премиальное брендированное лимитированное худи SNO Economics (оверсайз) или набор из 3 стильных металлических пинов и блокнота исследователя БГЭУ. Подарок выдается в кабинете СНО ФЭМ при предъявлении QR-кода верифицированного купона.'
    },
    {
      id: 'publication',
      title: 'Ускоренная публикация в РИНЦ',
      description: 'Гарантированное продвинутое рецензирование и публикация статьи в сборнике научных трудов FEM Research.',
      cost: 250,
      iconName: 'publication',
      longDescription: 'Внеочередное двойное слепое рецензирование оргкомитетом СНО ФЭМ БГЭУ и гарантированное включение вашей научной работы в ежегодный сборник научных материалов с индексацией в базе РИНЦ (Российский индекс научного цитирования), минуя общий рейтинг конкурса.'
    },
    {
      id: 'library',
      title: 'VIP-абонемент научной библиотеки БГЭУ',
      description: 'Приоритетный доступ к бронированию коворкинг-комнат и закрытым подпискам финансовой аналитики.',
      cost: 75,
      iconName: 'library',
      longDescription: 'Индивидуальный читательский пропуск повышенного уровня. Дает возможность優先-резервации уединенных комнат научной библиотеки для групповых экономических исследований и бесплатный доступ к закрытым базам данных аналитических материалов.'
    },
    {
      id: 'coach',
      title: 'Рекомендательное письмо & Коучинг',
      description: 'Официальное письмо-согласие от руководства факультета для работодателя и 2 часа личного карьерного менторинга.',
      cost: 150,
      iconName: 'coach',
      longDescription: 'Индивидуальное рекомендательное письмо с печатью деканата и подписью декана ФЭМ для соискания стипендий, грантов или престижного трудоустройства, а также двухчасовая сессия по личному карьерному треку от ведущего профессора.'
    }
  ];

  const [selectedShopItem, setSelectedShopItem] = useState<any | null>(null);
  const [purchaseDetails, setPurchaseDetails] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [purchaseEndDate, setPurchaseEndDate] = useState('');
  const [exchangeError, setExchangeError] = useState('');
  const [exchangeSuccess, setExchangeSuccess] = useState(false);
  const [isExchangeLoading, setIsExchangeLoading] = useState(false);

  const handleExchangePoints = async (e: React.FormEvent) => {
    e.preventDefault();
    setExchangeError('');
    setExchangeSuccess(false);

    if (!selectedShopItem) return;

    if (profile.points < selectedShopItem.cost) {
      setExchangeError(`Недостаточно баллов на вашем балансе. Требуется: ${selectedShopItem.cost}, у вас: ${profile.points}`);
      return;
    }

    setIsExchangeLoading(true);
    try {
      // Create a nice detail string representing their selection/dates
      let finalReason = selectedShopItem.title;
      if (purchaseDetails.trim()) {
        finalReason += ` (${purchaseDetails.trim()})`;
      }

      await purchaseExemption({
        studentName: profile.name,
        studentGroup: profile.group,
        targetExemptionDate: purchaseDate,
        endDate: purchaseEndDate || purchaseDate,
        reason: finalReason,
        pointsDeducted: selectedShopItem.cost,
        course: profile.course,
        isBudget: profile.isBudget !== false,
        phone: profile.phone || '',
      });

      setExchangeSuccess(true);
      setPurchaseDetails('');
      setPurchaseEndDate('');
      setTimeout(() => {
        setSelectedShopItem(null);
        setExchangeSuccess(false);
      }, 2500);
    } catch (err: any) {
      setExchangeError('Ошибка при проведении обмена: ' + err.message);
    } finally {
      setIsExchangeLoading(false);
    }
  };

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile?.name || '');
  const [editCourse, setEditCourse] = useState(profile?.course || 3);
  const [editGroup, setEditGroup] = useState(profile?.group || '');
  const [editEmail, setEditEmail] = useState(profile?.email || '');
  const [editPhone, setEditPhone] = useState(profile?.phone || '');
  const [editIsBudget, setEditIsBudget] = useState(profile?.isBudget !== false);
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  if (!profile) {
    return (
      <div className="py-12 text-center text-slate-500 font-sans">
        <AlertCircle className="h-10 w-10 mx-auto text-slate-300 mb-2" />
        <p className="font-semibold text-sm">Вам необходимо войти в систему для просмотра профиля</p>
      </div>
    );
  }

  // Handle profile edit submission
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess(false);

    if (!editName.trim()) {
      setSaveError('Пожалуйста, введите ФИО.');
      return;
    }
    if (!editGroup.trim()) {
      setSaveError('Пожалуйста, введите учебную группу.');
      return;
    }

    try {
      const updatedFields: Partial<StudentProfile> = {
        name: editName.trim(),
        course: Number(editCourse),
        group: editGroup.trim().toUpperCase(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
        isBudget: editIsBudget
      };

      await updateStudentProfileFromAdmin(profile.studentId, updatedFields);
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError('Не удалось обновить профиль: ' + err.message);
    }
  };

  // Compile achievements dynamically from user data
  const dynamicAchievements: Achievement[] = [
    {
      id: 'badge-welcome',
      title: 'Первый шаг в СНО',
      description: 'Приветственный грант научных баллов СНО за авторизацию личного кабинета.',
      iconName: 'Sparkles',
      color: 'indigo',
      requirement: 'Активация учетной записи в системе',
      isUnlocked: true,
      unlockedAt: '01.06.2026'
    },
    {
      id: 'badge-reg',
      title: 'Юный Исследователь',
      description: 'Успешно подана первая заявка на участие в научном событии.',
      iconName: 'Calendar',
      color: 'emerald',
      requirement: 'Зарегистрироваться на 1 научное мероприятие',
      isUnlocked: registrations.length >= 1,
      progress: { current: registrations.length, target: 1 }
    },
    {
      id: 'badge-speaker',
      title: 'Академический Оратор',
      description: 'Ваша роль докладчика подтверждена на кафедре ФЭМ в рамках одной из конференций.',
      iconName: 'GraduationCap',
      color: 'amber',
      requirement: 'Записаться на конференцию в роли Докладчика',
      isUnlocked: registrations.some(r => r.role === 'speaker')
    },
    {
      id: 'badge-quiz',
      title: 'Эрудит Экономики',
      description: 'Блестяще пройдена научная quiz-викторина на полярном СНО.',
      iconName: 'BookCheck',
      color: 'blue',
      requirement: 'Пройти хотя бы 1 викторину',
      isUnlocked: Object.keys(completedQuizzes).length >= 1,
      progress: { current: Object.keys(completedQuizzes).length, target: 1 }
    },
    {
      id: 'badge-points',
      title: 'Научный Гроссмейстер',
      description: 'Накоплено солидное количество баллов научного рейтинга СНО.',
      iconName: 'Trophy',
      color: 'rose',
      requirement: 'Набрать 150 или более баллов',
      isUnlocked: profile.points >= 150,
      progress: { current: profile.points, target: 150 }
    },
    {
      id: 'badge-exempt',
      title: 'Освобожденный Разум',
      description: 'Вы разменяли научные баллы в магазине на справку-освобождение от занятий.',
      iconName: 'BookOpen',
      color: 'purple',
      requirement: 'Произвести обмен на 1 справку в магазине СНО',
      isUnlocked: profile.exemptionCount > 0,
      progress: { current: profile.exemptionCount, target: 1 }
    }
  ];

  // Resolve Badge Icons dynamically
  const getBadgeIcon = (iconName: string, unlocked: boolean) => {
    const props = { className: `h-6 w-6 ${unlocked ? 'opacity-100 animate-pulse' : 'opacity-40'}` };
    switch (iconName) {
      case 'Sparkles': return <Sparkles {...props} />;
      case 'Calendar': return <Calendar {...props} />;
      case 'GraduationCap': return <GraduationCap {...props} />;
      case 'BookCheck': return <BookCheck {...props} />;
      case 'Trophy': return <Trophy {...props} />;
      case 'BookOpen': return <BookOpen {...props} />;
      default: return <Award {...props} />;
    }
  };

  // Compile Recharts Progress graph data historically from chronological timelines
  const buildProgressChartData = () => {
    const initialPoints = profile.role === 'sno_activist' ? 100 : 50;
    const sortedItems = [...timelineItems].sort((a, b) => a.date.localeCompare(b.date));
    
    const chartData = [
      { name: 'Регистрация', points: initialPoints, date: '01.06.2026' }
    ];

    let runningPoints = initialPoints;
    sortedItems.forEach((item) => {
      runningPoints += item.pointsChange;
      // Map nice human names
      let name = 'Событие';
      if (item.type === 'quiz') name = 'Викторина';
      else if (item.type === 'event_registration') name = 'Регистрация';
      else if (item.type === 'exemption_purchase') name = 'Обмен';
      else if (item.type === 'academic_award') name = 'Бонус';

      chartData.push({
        name,
        points: Math.max(0, runningPoints),
        date: item.date
      });
    });

    return chartData;
  };

  const cData = buildProgressChartData();

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-1 sm:px-4 font-sans animate-fade-in">
      {/* Welcome & Profile Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-48 w-48 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-bold text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-400/20 uppercase tracking-widest">
                Студенческий профиль СНО ФЭМ
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              {profile.name}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              Зачетная книжка: <b className="font-mono text-indigo-200">{profile.studentId}</b> • Курс: <b className="text-white">{profile.course}</b> • Учебная группа: <b className="text-white">{profile.group}</b>
            </p>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 shrink-0">
            <div className="text-center px-4">
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Баланс баллов</span>
              <span className="text-2xl sm:text-3xl font-mono font-extrabold text-amber-400 flex items-center justify-center gap-1 mt-1">
                <Sparkles className="h-5 w-5 animate-pulse text-amber-400" />
                {profile.points}
              </span>
            </div>
            <div className="h-10 w-px bg-white/10"></div>
            <div className="text-center px-4">
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Освобождений</span>
              <span className="text-2xl sm:text-3xl font-mono font-extrabold text-purple-400 flex items-center justify-center gap-1 mt-1">
                <BookOpen className="h-5 w-5 text-purple-400" />
                {profile.exemptionCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-2xl flex items-center gap-2 max-w-xl animate-fade-in">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">Даные личного кабинета успешно обновлены и синхронизированы!</span>
        </div>
      )}

      {/* Grid Content: Profile settings / Form VS. Progress Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Hand: Profile Card & Edit Forms */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
              <User className="h-5 w-5 text-blue-900" />
              <span>Личная информация</span>
            </h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs font-bold text-blue-900 hover:text-blue-950 flex items-center gap-1 bg-blue-50 py-1.5 px-3 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors shrink-0 cursor-pointer"
            >
              <Edit3 className="h-3.5 w-3.5" />
              {isEditing ? 'Отмена' : 'Изменить'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {saveError && (
                <div className="p-3 bg-red-50 text-red-800 text-xs rounded-xl flex items-center gap-1.5 border border-red-150">
                  <AlertCircle className="h-4 w-4 text-red-650 shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Полное Имя (ФИО) *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-xs sm:text-sm text-slate-800 leading-snug font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Курс обучения *</label>
                  <select
                    value={editCourse}
                    onChange={(e) => setEditCourse(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-xs sm:text-sm text-slate-800 font-medium"
                  >
                    {[1, 2, 3, 4, 5].map(c => (
                      <option key={c} value={c}>{c}-й курс</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Группа (номер) *</label>
                  <input
                    type="text"
                    required
                    value={editGroup}
                    onChange={(e) => setEditGroup(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-xs sm:text-sm text-slate-800 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Электронная почта</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-xs sm:text-sm text-slate-800 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Номер телефона</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+375 (29) 123-45-67"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-xs sm:text-sm text-slate-800 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="budget_cb"
                  checked={editIsBudget}
                  onChange={(e) => setEditIsBudget(e.target.checked)}
                  className="rounded text-blue-900 focus:ring-blue-900 h-4 w-4"
                />
                <label htmlFor="budget_cb" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Обучаюсь за счет бюджетного ассигнования
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-900 text-white hover:bg-blue-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md mt-4 uppercase border-none"
              >
                Сохранить настройки
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Profile Read Only Metrics */}
              <div className="flex items-start gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 text-slate-400 border border-slate-100 mt-0.5 shrink-0">
                  <Hash className="h-4.5 w-4.5 text-blue-900" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID Зачетной книжки</span>
                  <span className="text-sm font-semibold font-mono text-slate-800">{profile.studentId}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 text-slate-400 border border-slate-100 mt-0.5 shrink-0">
                  <Mail className="h-4.5 w-4.5 text-blue-900" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Электронный адрес</span>
                  <span className="text-sm font-semibold text-slate-800">{profile.email || 'Не указан'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 text-slate-400 border border-slate-100 mt-0.5 shrink-0">
                  <Phone className="h-4.5 w-4.5 text-blue-900" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Телефонный контакт</span>
                  <span className="text-sm font-semibold text-slate-850 font-mono">{profile.phone || 'Не указан'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 text-slate-400 border border-slate-100 mt-0.5 shrink-0">
                  <GraduationCap className="h-4.5 w-4.5 text-blue-900" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Форма финансирования</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {profile.isBudget !== false ? 'Бюджетная' : 'Платная основа'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 text-slate-400 border border-slate-100 mt-0.5 shrink-0">
                  <ClipboardList className="h-4.5 w-4.5 text-blue-900" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Степень / Роль СНО</span>
                  <span className="text-xs font-bold text-blue-800 uppercase px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-100 mt-1 inline-block">
                    {profile.role === 'sno_activist' ? 'Активист СНО ФЭМ / Модератор' : 'Студент-Исследователь'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Hand: Progress graph of points */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-6 flex flex-col justify-between self-stretch">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
              <TrendingUp className="h-5 w-5 text-indigo-750" />
              <span>График академического прогресса</span>
            </h2>
            <p className="text-slate-500 text-xs">
              Динамика научных баллов СНО за текущий семестр. Отражает начисления за доклады, викторины и списания на освобождения.
            </p>
          </div>

          {/* Graph area with recharts responsive container */}
          <div className="h-64 sm:h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <LineChart data={cData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '11px', color: '#fff' }} 
                  labelStyle={{ fontWeight: 'bold', color: '#38bdf8' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="points" 
                  stroke="#1e3a8a" 
                  strokeWidth={3} 
                  activeDot={{ r: 6 }} 
                  dot={{ strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-500 text-xs flex items-center gap-2 md:col-span-1 leading-normal font-sans">
            <span className="text-[10px] font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded uppercase shrink-0">Пояснение</span>
            <span>Каждая отметка на графике — это научное достижение (сдача теста, доклад). Точки роста ведут к справкам-освобождениям от занятий в деканате БГЭУ.</span>
          </div>
        </div>
      </div>

      {/* Badges system (Achievements and Rewards Grid) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-6">
        <div className="space-y-1 border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
            <Trophy className="h-5.5 w-5.5 text-amber-500" />
            <span>Раздел «Достижения и Научные Награды»</span>
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm">
            Зарабатывайте уникальные цифровые значки (бейджи) за участие в дискуссиях СНО БГЭУ, доклады на круглых столах и пополнение научного портфолио!
          </p>
        </div>

        {/* Badges grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {dynamicAchievements.map((badge) => {
            return (
              <div 
                key={badge.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group ${
                  badge.isUnlocked
                    ? 'bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-sm hover:shadow-md hover:border-slate-350'
                    : 'bg-slate-50/70 border-slate-205/60 text-slate-400 select-none'
                }`}
              >
                {/* Visual badge top line and shine effect */}
                {badge.isUnlocked && (
                  <div className={`absolute top-0 left-0 w-2 h-full ${
                    badge.color === 'indigo' ? 'bg-indigo-600' :
                    badge.color === 'emerald' ? 'bg-emerald-600' :
                    badge.color === 'amber' ? 'bg-amber-600' :
                    badge.color === 'blue' ? 'bg-blue-600' :
                    badge.color === 'rose' ? 'bg-rose-600' : 'bg-purple-600'
                  }`} />
                )}

                <div className="space-y-2 select-text">
                  <div className="flex items-center justify-between">
                    {/* Badge Icon circle */}
                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center border shrink-0 ${
                      badge.isUnlocked
                        ? badge.color === 'indigo' ? 'bg-indigo-50 border-indigo-200 text-indigo-750' :
                          badge.color === 'emerald' ? 'bg-emerald-50 border-emerald-200 text-emerald-750' :
                          badge.color === 'amber' ? 'bg-amber-50 border-amber-200 text-amber-750' :
                          badge.color === 'blue' ? 'bg-blue-50 border-blue-200 text-blue-750' :
                          badge.color === 'rose' ? 'bg-rose-50 border-rose-200 text-rose-750' :
                          'bg-purple-50 border-purple-200 text-purple-750'
                        : 'bg-slate-100 border-slate-200 text-slate-300'
                    }`}>
                      {getBadgeIcon(badge.iconName, badge.isUnlocked)}
                    </div>

                    {/* Unlocked stamp badge */}
                    <span className={`text-[9px] font-extrabold uppercase font-sans tracking-wide px-2 py-0.5 rounded-full border ${
                      badge.isUnlocked
                        ? 'bg-emerald-50 text-emerald-850 border-emerald-250'
                        : 'bg-slate-100 text-slate-350 border-slate-200'
                    }`}>
                      {badge.isUnlocked ? 'Получено' : 'Заблокировано'}
                    </span>
                  </div>

                  <div className="p-0.5">
                    <h3 className={`text-sm font-bold leading-snug font-sans ${badge.isUnlocked ? 'text-slate-900 group-hover:text-blue-900 transition-colors' : 'text-slate-500'}`}>
                      {badge.title}
                    </h3>
                    <p className="text-[11px] leading-relaxed mt-1 text-slate-500 font-sans">
                      {badge.description}
                    </p>
                  </div>
                </div>

                {/* Progress bar info for target goals */}
                <div className="pt-2 border-t border-slate-100 select-text">
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-sans">Требование</span>
                  <p className={`text-[10px] font-medium leading-none ${badge.isUnlocked ? 'text-slate-700 font-bold' : 'text-slate-550'}`}>
                    {badge.requirement}
                  </p>
                  
                  {badge.progress && (
                    <div className="mt-2.5 space-y-1">
                      <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold font-mono">
                        <span>Прогресс</span>
                        <span>{Math.min(badge.progress.current, badge.progress.target)} / {badge.progress.target}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200/50">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            badge.isUnlocked ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-slate-300'
                          }`}
                          style={{ width: `${Math.min(100, (badge.progress.current / badge.progress.target) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SNO FEM Scientific Privilege Shop Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-6">
        <div className="space-y-1 border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
              <ShoppingBag className="h-5.5 w-5.5 text-blue-900" />
              <span>Магазин научных привилегий СНО ФЭМ</span>
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Накапливайте академические баллы за активность и обменивайте их на уникальные университетские бонусы и мерч.
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-500 bg-amber-50/70 text-amber-900 px-3 py-1.5 rounded-xl border border-amber-100/70 shrink-0 self-start sm:self-auto flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
            <span>Ваш баланс: <b>{profile.points}</b> баллов</span>
          </div>
        </div>

        {/* Shop Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SHOP_ITEMS.map((item) => {
            const isAffordable = profile.points >= item.cost;
            const isSelected = selectedShopItem?.id === item.id;
            
            // Icon Selector Helper
            const getItemIcon = (iconName: string) => {
              switch (iconName) {
                case 'exemption': return <Calendar className="h-5.5 w-5.5 text-blue-900" />;
                case 'merch': return <Gift className="h-5.5 w-5.5 text-rose-500" />;
                case 'publication': return <Award className="h-5.5 w-5.5 text-emerald-600" />;
                case 'library': return <BookCheck className="h-5.5 w-5.5 text-indigo-600" />;
                case 'coach': return <Briefcase className="h-5.5 w-5.5 text-amber-600" />;
                default: return <Gift className="h-5.5 w-5.5 text-slate-500" />;
              }
            };

            return (
              <div 
                key={item.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group ${
                  isSelected 
                    ? 'ring-2 ring-blue-900 border-blue-200 bg-blue-50/10'
                    : 'bg-gradient-to-br from-white to-slate-50/40 border-slate-200 hover:shadow-md'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                      {getItemIcon(item.iconName)}
                    </div>
                    <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-150 flex items-center gap-1 shrink-0">
                      <Sparkles className="h-3 w-3 text-amber-500" />
                      {item.cost} баллов
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-930 group-hover:text-blue-900 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] leading-relaxed text-slate-505 mt-1.5 line-clamp-3">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      if (isSelected) {
                        setSelectedShopItem(null);
                      } else {
                        setSelectedShopItem(item);
                        setExchangeError('');
                        setExchangeSuccess(false);
                      }
                    }}
                    className={`text-xs font-bold py-1.5 px-3 rounded-lg border transition-all flex items-center gap-1 select-none cursor-pointer ${
                      isSelected 
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300 border-slate-300'
                        : isAffordable
                          ? 'bg-blue-900 text-white hover:bg-blue-950 border-blue-900 hover:shadow shadow-sm'
                          : 'bg-slate-100 text-slate-400 border-slate-220 cursor-not-allowed'
                    }`}
                  >
                    {isSelected ? 'Свернуть' : 'Обменять'}
                  </button>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase font-mono tracking-wide">
                    {isAffordable ? 'Доступно' : `Нужно еще ${item.cost - profile.points}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Shop Item details and checkout form */}
        {selectedShopItem && (
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/20 border border-blue-105 rounded-2xl p-5 sm:p-6 space-y-4 animate-fade-in text-slate-800">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
              <span className="p-1 px-2.5 bg-amber-200/50 text-amber-950 font-bold text-[10px] sm:text-xs rounded-full uppercase tracking-wider border border-amber-300">Шаг 2: Подтверждение обмена</span>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {selectedShopItem.title}
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
              {selectedShopItem.longDescription}
            </p>

            <form onSubmit={handleExchangePoints} className="space-y-4 pt-2">
              {exchangeError && (
                <div className="p-3 bg-red-50 text-red-800 text-xs rounded-xl flex items-center gap-1.5 border border-red-150 animate-fade-in font-semibold">
                  <AlertCircle className="h-4 w-4 text-red-650 shrink-0" />
                  <span>{exchangeError}</span>
                </div>
              )}

              {exchangeSuccess && (
                <div className="p-4 bg-emerald-50 text-emerald-800 text-xs sm:text-sm rounded-xl flex items-center gap-2 border border-emerald-205 animate-fade-in">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold">Обмен выполнен успешно!</p>
                    <p className="text-slate-500 font-medium text-xs mt-0.5">Вам успешно начислена привилегия. Скачать официальный купон-сертификат с QR-кодом для подтверждения вы можете в подразделе «Мои Сертификаты и Справки Обоснования» ниже.</p>
                  </div>
                </div>
              )}

              {!exchangeSuccess && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Dynamic field 1: details */}
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-500 uppercase tracking-wide block">
                      {selectedShopItem.id === 'exemption' && 'Причина пропуска занятий (Обоснование) *'}
                      {selectedShopItem.id === 'merch' && 'Выберите подарок и размер (например: оверсайз-худи, размер M) *'}
                      {selectedShopItem.id === 'publication' && 'Укажите название статьи или тему исследования *'}
                      {selectedShopItem.id === 'library' && 'Комментарий (для какого исследования нужен доступ) *'}
                      {selectedShopItem.id === 'coach' && 'Сфера интересов для коучинга (например: Big Data, Маркетинг) *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={purchaseDetails}
                      onChange={(e) => setPurchaseDetails(e.target.value)}
                      placeholder={
                        selectedShopItem.id === 'exemption' ? 'Докладчик на СНО ФЭМ БГЭУ' :
                        selectedShopItem.id === 'merch' ? 'Худи "SNO Science", размер L' :
                        selectedShopItem.id === 'publication' ? 'Цифровая трансформация рынков РБ' :
                        selectedShopItem.id === 'library' ? 'Статистические архивы БГЭУ за 2025 г.' : 
                        'Финансовый консалтинг и банковский аудит'
                      }
                      className="w-full text-xs sm:text-sm rounded-xl border border-slate-205 p-2.5 font-semibold focus:border-blue-900 focus:outline-none bg-white text-slate-800"
                    />
                  </div>

                  {/* Dynamic field 2: date */}
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-500 uppercase tracking-wide block">
                      {selectedShopItem.id === 'exemption' ? 'Дата пропуска занятий (или начало периода) *' : 'Желаемая дата активации привилегии *'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="date"
                        required
                        value={purchaseDate}
                        onChange={(e) => setPurchaseDate(e.target.value)}
                        className="w-full text-xs rounded-xl border border-slate-205 p-2.5 font-semibold focus:border-blue-900 focus:outline-none bg-white font-mono"
                      />
                      {/* Only show end exemption date for class exemption */}
                      {selectedShopItem.id === 'exemption' ? (
                        <input
                          type="date"
                          placeholder="Дата окончания (необяз.)"
                          value={purchaseEndDate}
                          onChange={(e) => setPurchaseEndDate(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-205 p-2.5 font-semibold focus:border-blue-900 focus:outline-none bg-white font-mono"
                        />
                      ) : (
                        <div className="text-[10px] text-slate-400 bg-slate-100 flex items-center justify-center p-2 rounded-xl italic font-medium leading-tight">
                          Действует бессрочно
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!exchangeSuccess && (
                <div className="pt-3 border-t border-slate-200/50 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={isExchangeLoading || profile.points < selectedShopItem.cost}
                    className="py-2.5 px-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 hover:text-black rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer border-none disabled:opacity-55 disabled:cursor-not-allowed select-none"
                  >
                    {isExchangeLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                        <span>Обработка запроса...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 shrink-0 animate-pulse text-amber-950" />
                        <span>Списать {selectedShopItem.cost} баллов и получить привилегию</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedShopItem(null)}
                    className="py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-200 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer"
                  >
                    Отменить
                  </button>
                </div>
              )}
            </form>
          </div>
        )}
      </div>

      {/* Certificates Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-6">
        <div className="space-y-1 border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
              <BookCheck className="h-5.5 w-5.5 text-blue-900" />
              <span>Мои Сертификаты и Справки Обоснования</span>
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Ваши подтвержденные цифровые сертификаты о научных докладах и справки на освобождение от занятий ФЭМ.
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 shrink-0 self-start sm:self-auto">
            Всего выдано справко-сертификатов: <b className="text-blue-900 font-mono">{certificates.filter(c => c.studentId === profile?.studentId).length}</b>
          </div>
        </div>

        {certificates.filter(c => c.studentId === profile?.studentId).length === 0 ? (
          <div className="text-center py-10 px-4 border-2 border-dashed border-slate-100 rounded-3xl space-y-3 bg-slate-50/20">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 text-slate-350 flex items-center justify-center">
              <Award className="h-6 w-6 text-slate-350" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h4 className="font-bold text-slate-800 text-sm">Пока нет активных сертификатов</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Зарегистрируйтесь на научные конференции, успешно выступайте с докладами или обменивайте накопленные баллы на полезные научные привилегии или освобождение от учебных занятий.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.filter(c => c.studentId === profile?.studentId).map((cert) => {
              const isDownloadingThis = downloadingCertId === cert.id;
              return (
                <div 
                  key={cert.id}
                  className="bg-gradient-to-br from-white to-slate-50/40 p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  {/* Accent colored line */}
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-900" />

                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-extrabold uppercase font-sans tracking-widest text-indigo-700 bg-indigo-50 border border-indigo-100/70 px-2 py-0.5 rounded">
                          Код справки SNO: {cert.id}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 line-clamp-1 mt-1.5">
                          {cert.reason}
                        </h3>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-150 shrink-0">
                        Верифицирован
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-1.5 text-[11px] leading-snug">
                      <div>
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Период освобождения</span>
                        <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-450 shrink-0" />
                          {cert.targetExemptionDate} {cert.endDate && cert.endDate !== cert.targetExemptionDate ? ` - ${cert.endDate}` : ''}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Инвестировано баллов</span>
                        <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                          <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          {cert.pointsDeducted} баллов
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Хэш-код проверки облака БГЭУ</span>
                      <code className="text-[10px] text-slate-505 bg-slate-50 px-2 py-1 rounded font-mono block mt-1 select-all break-all border border-slate-150">
                        {cert.verificationCode}
                      </code>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleDownloadCertificatePDF(cert)}
                      disabled={isDownloadingThis || isDownloadingAny}
                      className="w-full py-2 bg-blue-900 border-none text-white hover:bg-blue-950 rounded-xl font-bold text-xs shadow hover:shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDownloadingThis ? (
                        <>
                          <ArrowUpRight className="h-4 w-4 animate-spin shrink-0" />
                          <span>Генерация PDF-файла...</span>
                        </>
                      ) : (
                        <>
                          <FileSpreadsheet className="h-4 w-4 shrink-0" />
                          <span>Скачать Сертификат (PDF)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
