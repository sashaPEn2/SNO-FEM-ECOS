import React, { useState } from 'react';
import { Award, Calendar, FileText, Trophy, BookOpen, Mic, Sparkles, CheckCircle2, TrendingUp, HelpCircle, MessageSquare, Send, Check, AlertCircle } from 'lucide-react';
import { TimelineItem, StudentProfile } from '../types';
import { jsPDF } from 'jspdf';
import { useFirebase } from '../context/FirebaseContext';

interface TimelineSectionProps {
  profile: StudentProfile;
  timelineItems: TimelineItem[];
  onNavigateToTab: (tab: string) => void;
}

export default function TimelineSection({ profile, timelineItems, onNavigateToTab }: TimelineSectionProps) {
  const [filter, setFilter] = useState<'all' | 'quiz' | 'award' | 'purchase'>('all');
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // High-availability mirrors to load Roboto with full Cyrillic support
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
        console.error('Could not load Cyrillic fonts from any online CDN, falling back to basic font', fontErr);
        // Clean console warning instead of disturbing browser-freeze alert
        console.warn('Внимание: Не удалось подключиться к серверам шрифтов. Текст может отображаться в базовой кодировке.');
      }

      // Drawing the document
      let y = 15;
      
      // Top header (Ministry & University info)
      doc.setFontSize(8);
      doc.setFont('Roboto', 'normal');
      doc.setTextColor(100, 110, 120);
      doc.text('УО «БЕЛОРУССКИЙ ГОСУДАРСТВЕННЫЙ ЭКОНОМИЧЕСКИЙ УНИВЕРСИТЕТ»', 105, y, { align: 'center' });
      
      y += 4;
      doc.text('ФАКУЛЬТЕТ ЭКОНОМИКИ И МЕНЕДЖМЕНТА • СТУДЕНЧЕСКОЕ НАУЧНОЕ ОБЩЕСТВО', 105, y, { align: 'center' });
      
      y += 4;
      doc.setDrawColor(200, 205, 210);
      doc.setLineWidth(0.35);
      doc.line(20, y, 190, y);

      // Report Header Title
      y += 12;
      doc.setFontSize(13);
      doc.setFont('Roboto', 'bold');
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text('ОФИЦИАЛЬНЫЙ НАУЧНЫЙ ОТЧЕТ ОБ АКТИВНОСТИ СТУДЕНТА', 105, y, { align: 'center' });
      
      y += 5;
      doc.setFontSize(8.5);
      doc.setFont('Roboto', 'normal');
      doc.setTextColor(115, 125, 135);
      const reportDateStr = new Date().toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Сформирован: ${reportDateStr} • Верифицирован в реестре СНО БГЭУ`, 105, y, { align: 'center' });

      // Student Card Information Box
      y += 8;
      const cardHeight = 35;
      doc.setFillColor(248, 250, 252);
      doc.rect(20, y, 170, cardHeight, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(20, y, 170, cardHeight, 'S');

      // Card Information columns
      doc.setFontSize(9);
      doc.setFont('Roboto', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('Заявитель (Студент):', 25, y + 7);
      doc.text('Учебная группа:', 25, y + 13);
      doc.text('Ведомство / Статус:', 25, y + 19);
      doc.text('Текущий научный баланс:', 25, y + 25);
      doc.text('Всего заработано баллов:', 25, y + 31);

      doc.setFont('Roboto', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(profile.name, 75, y + 7);
      doc.text(profile.group, 75, y + 13);
      doc.text('СНО ФЭМ БГЭУ (Студенческое научное общество)', 75, y + 19);
      doc.setFont('Roboto', 'bold');
      doc.setTextColor(26, 54, 110);
      doc.text(`${profile.points} баллов СНО (для обмена на справки)`, 75, y + 25);
      doc.setTextColor(16, 124, 65);
      doc.text(`+${totalEarnedPoints} научных баллов СНО`, 75, y + 31);

      // Section Title: Detailed actions
      y += cardHeight + 10;
      doc.setFont('Roboto', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text('РЕЕСТР ПРОВЕДЕННЫХ МЕРОПРИЯТИЙ И НАУЧНЫХ ДОСТИЖЕНИЙ', 20, y);
      
      y += 3;
      doc.setDrawColor(210, 215, 220);
      doc.line(20, y, 190, y);

      // Draw table headers helper
      const drawTableHeader = (startY: number) => {
        doc.setFillColor(241, 245, 249);
        doc.rect(20, startY, 170, 7, 'F');
        doc.setFont('Roboto', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text('Дата', 22, startY + 4.8);
        doc.text('Направление / Категория', 45, startY + 4.8);
        doc.text('Название события и подробности активности', 92, startY + 4.8);
        doc.text('Рейтинг', 174, startY + 4.8);
      };

      y += 3;
      drawTableHeader(y);
      y += 7;

      // Table rows
      doc.setFontSize(8);
      const colDateX = 22;
      const colCatX = 45;
      const colDetX = 92;
      const colPointsX = 175;

      const getRussianTypeLabel = (type: TimelineItem['type']) => {
        switch (type) {
          case 'quiz': return 'Викторина СНО';
          case 'event_registration': return 'Событие / Семинар';
          case 'manual_activity': return 'Научная работа';
          case 'exemption_purchase': return 'Обмен баллов';
          case 'academic_award': return 'Почетная награда';
          default: return 'Активность СНО';
        }
      };

      for (const item of filteredItems) {
        const itemDateStr = new Date(item.date).toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        const categoryLabel = getRussianTypeLabel(item.type);
        
        // Multi-line wrap
        const maxTextWidth = 78;
        doc.setFont('Roboto', 'bold');
        const titleLines: string[] = doc.splitTextToSize(item.title, maxTextWidth);
        
        doc.setFont('Roboto', 'normal');
        const detailsLines: string[] = doc.splitTextToSize(item.details, maxTextWidth);

        const rowHeight = (titleLines.length + detailsLines.length) * 4.2 + 4;

        // Check page overflow
        if (y + rowHeight > 265) {
          doc.addPage();
          // Header on new page
          doc.setFontSize(7);
          doc.setFont('Roboto', 'normal');
          doc.setTextColor(115, 125, 135);
          doc.text(`Научный отчет СНО ФЭМ БГЭУ — ${profile.name}`, 20, 10);
          doc.setDrawColor(230, 235, 240);
          doc.line(20, 12, 190, 12);
          
          y = 15;
          drawTableHeader(y);
          y += 7;
        }

        // Draw light horizontal separator
        doc.setDrawColor(245, 247, 250);
        doc.setLineWidth(0.25);
        doc.line(20, y, 190, y);

        // Date & Category labels (always top-aligned)
        doc.setFont('Roboto', 'normal');
        doc.setTextColor(15, 23, 42);
        doc.text(itemDateStr, colDateX, y + 4.5);
        doc.text(categoryLabel, colCatX, y + 4.5);

        // Detailed description text
        let localY = y + 4.5;
        doc.setFont('Roboto', 'bold');
        doc.setTextColor(15, 23, 42);
        for (const line of titleLines) {
          doc.text(line, colDetX, localY);
          localY += 3.8;
        }

        doc.setFont('Roboto', 'normal');
        doc.setTextColor(100, 105, 115);
        for (const line of detailsLines) {
          doc.text(line, colDetX, localY);
          localY += 3.8;
        }

        // Points indicator
        doc.setFont('Roboto', 'bold');
        if (item.pointsChange > 0) {
          doc.setTextColor(16, 124, 65);
          doc.text(`+${item.pointsChange}`, colPointsX, y + 4.5);
        } else if (item.pointsChange < 0) {
          doc.setTextColor(186, 12, 47);
          doc.text(`${item.pointsChange}`, colPointsX, y + 4.5);
        } else {
          doc.setTextColor(120, 125, 135);
          doc.text('0', colPointsX, y + 4.5);
        }

        y += rowHeight;
      }

      // Legal verification disclaimer & Signatures block
      const sigHeight = 35;
      if (y + sigHeight > 265) {
        doc.addPage();
        y = 30;
      } else {
        y += 10;
      }

      doc.setDrawColor(200, 205, 210);
      doc.setLineWidth(0.35);
      doc.line(20, y, 190, y);
      
      y += 8;
      doc.setFont('Roboto', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(110, 115, 125);
      doc.text('Настоящий реестр сформирован автоматически в информационной системе СНО ФЭМ БГЭУ.', 20, y);
      doc.text('Отчет принимается в качестве официального подтверждения научно-исследовательской активности при аттестации.', 20, y + 4.5);

      // Signatures
      y += 14;
      doc.setFont('Roboto', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text('Председатель СНО ФЭМ БГЭУ:', 20, y);
      doc.setDrawColor(200, 205, 210);
      doc.line(68, y, 122, y);
      doc.text('(Терро А.В.)', 125, y);

      // Stamp placeholder
      doc.text('М.П.', 168, y - 1);
      doc.rect(162, y - 6, 18, 10, 'S');

      const cleanFilename = `SNO_Report_${profile.name.replace(/\s+/g, '_')}.pdf`;
      doc.save(cleanFilename);
    } catch (e) {
      console.error('Exporting pdf failed', e);
      alert('Ошибка при генерации PDF: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setIsDownloading(false);
    }
  };

  const filteredItems = timelineItems.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'quiz') return item.type === 'quiz';
    if (filter === 'award') {
      return item.type === 'academic_award' || item.type === 'event_registration' || item.type === 'manual_activity';
    }
    if (filter === 'purchase') return item.type === 'exemption_purchase';
    return true;
  });

  // Calculate summary stats
  const completedQuizzesCount = timelineItems.filter(item => item.type === 'quiz').length;
  const awardsCount = timelineItems.filter(item => 
    item.type === 'academic_award' || 
    item.type === 'event_registration' || 
    (item.type === 'manual_activity' && item.pointsChange >= 50)
  ).length;

  const totalEarnedPoints = timelineItems
    .filter(item => item.pointsChange > 0)
    .reduce((sum, item) => sum + item.pointsChange, 0);

  const getTimelineIcon = (type: TimelineItem['type']) => {
    switch (type) {
      case 'quiz':
        return <HelpCircle className="h-5 w-5 text-indigo-600" />;
      case 'event_registration':
        return <Mic className="h-5 w-5 text-blue-600" />;
      case 'manual_activity':
        return <BookOpen className="h-5 w-5 text-emerald-600" />;
      case 'exemption_purchase':
        return <FileText className="h-5 w-5 text-amber-600" />;
      case 'academic_award':
        return <Trophy className="h-5 w-5 text-amber-500" />;
      default:
        return <Award className="h-5 w-5 text-slate-600" />;
    }
  };

  const getTypeStyle = (type: TimelineItem['type']) => {
    switch (type) {
      case 'quiz':
        return {
          bg: 'bg-indigo-50 border-indigo-150',
          badge: 'bg-indigo-50 text-indigo-700 border-indigo-100',
          label: 'Викторина СНО',
        };
      case 'event_registration':
        return {
          bg: 'bg-blue-50 border-blue-150',
          badge: 'bg-blue-50 text-blue-700 border-blue-100',
          label: 'Событие / Конференция',
        };
      case 'manual_activity':
        return {
          bg: 'bg-emerald-50 border-emerald-150',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
          label: 'Научная работа',
        };
      case 'exemption_purchase':
        return {
          bg: 'bg-amber-50 border-amber-150 border-dashed',
          badge: 'bg-amber-50 text-amber-700 border-amber-150',
          label: 'Обмен баллов (Справка)',
        };
      case 'academic_award':
        return {
          bg: 'bg-rose-50 border-rose-150',
          badge: 'bg-rose-50 text-rose-700 border-rose-100',
          label: 'Почетная награда',
        };
      default:
        return {
          bg: 'bg-slate-50 border-slate-200',
          badge: 'bg-slate-50 text-slate-700 border-slate-200',
          label: 'Активность',
        };
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-800 font-sans">
      
      {/* Header Visual Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950 px-6 py-8 border border-slate-850 sm:px-12">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center space-x-1 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20">
              <Trophy className="h-3 w-3" />
              <span>Личное научное портфолио</span>
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Достижения и Научный Путь
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light max-w-xl">
              Единая хронология ваших академических побед, пройденных экономических тестов СНО ФЭМ БГЭУ, публикаций и выданных верифицированных документов.
            </p>
            <div className="pt-3">
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="inline-flex items-center space-x-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-75 text-white px-4 py-2.5 text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer"
              >
                <FileText className={`h-4 w-4 ${isDownloading ? 'animate-bounce' : ''}`} />
                <span>{isDownloading ? 'Загрузка кириллицы и сборка PDF...' : 'Скачать официальный научный отчет (PDF)'}</span>
              </button>
            </div>
          </div>

          <div className="flex bg-white/5 border border-white/10 p-2 rounded-2xl items-center gap-4 text-white self-start md:self-auto backdrop-blur-sm shadow-inner shrink-0">
            <div className="px-3 py-1.5 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Текущий баланс</span>
              <span className="text-xl font-mono font-extrabold text-amber-300 flex items-center justify-center gap-1 mt-0.5">
                <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                {profile.points}
              </span>
            </div>
            <div className="h-8 w-px bg-white/10"></div>
            <div className="px-3 py-1.5 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Всего заработано</span>
              <span className="text-xl font-mono font-extrabold text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                <TrendingUp className="h-4 w-4" />
                +{totalEarnedPoints}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Counter Decks */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider leading-none">Пройдено викторин</span>
            <span className="text-xl font-mono font-extrabold text-slate-900 mt-1 block">
              {completedQuizzesCount} / 3 <span className="text-xs text-slate-400 font-sans font-normal">(тестов)</span>
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
            <Trophy className="h-6 w-6 text-rose-600" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider leading-none">Получено наград</span>
            <span className="text-xl font-mono font-extrabold text-slate-900 mt-1 block">
              {awardsCount} <span className="text-xs text-slate-400 font-sans font-normal">(научных побед)</span>
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
            <FileText className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider leading-none">Оформлено освобождений</span>
            <span className="text-xl font-mono font-extrabold text-slate-900 mt-1 block">
              {profile.exemptionCount} <span className="text-xs text-slate-400 font-sans font-normal">(справок)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Timeline list */}
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Все события
          </button>
          <button
            onClick={() => setFilter('award')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              filter === 'award'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            🔬 Научные победы и Награды
          </button>
          <button
            onClick={() => setFilter('quiz')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              filter === 'quiz'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            📝 Викторины
          </button>
          <button
            onClick={() => setFilter('purchase')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              filter === 'purchase'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            🛒 Списания (Обмен баллов)
          </button>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-200 bg-white rounded-2xl p-6 space-y-3">
            <Calendar className="h-10 w-10 text-slate-300 mx-auto" />
            <h4 className="font-semibold text-slate-700">События не найдены</h4>
            <p className="text-xs text-slate-550 max-w-sm mx-auto font-sans leading-normal">
              Попробуйте сменить фильтр или примите активное участие в жизни СНО ФЭМ БГЭУ.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => onNavigateToTab('calendar')}
                className="rounded-xl border border-slate-250 bg-white hover:bg-slate-50 text-slate-650 px-3.5 py-1.5 text-xs font-semibold cursor-pointer"
              >
                Подать доклад
              </button>
              <button
                onClick={() => onNavigateToTab('quiz')}
                className="rounded-xl bg-blue-900 text-white hover:bg-blue-800 px-3.5 py-1.5 text-xs font-semibold shadow-sm cursor-pointer"
              >
                Решить викторину (+50 баллов)
              </button>
            </div>
          </div>
        ) : (
          /* Timeline Visual Component */
          <div className="relative pl-6 md:pl-8 border-l border-slate-200/80 space-y-8 py-2 ml-4">
            {filteredItems.map((item, index) => {
              const theme = getTypeStyle(item.type);
              const formattedDate = new Date(item.date).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              });

              return (
                <div key={item.id} className="relative group">
                  {/* Timeline Pulse Node dot */}
                  <div className="absolute -left-[37px] md:-left-[45px] top-1.5 h-6 w-6 md:h-8 md:w-8 rounded-full border border-slate-200 bg-white flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:border-slate-350 transition-all z-10">
                    {getTimelineIcon(item.type)}
                  </div>

                  {/* Connect Line Accent */}
                  <div className="absolute -left-[31px] md:-left-[39px] top-9 bottom-[-32px] w-0.5 bg-slate-100 group-last:hidden"></div>

                  {/* Timeline Card details */}
                  <div className="p-5 border border-slate-200/90 rounded-2xl bg-white shadow-sm hover:shadow-md hover:border-slate-300 transition-all space-y-3 relative overflow-hidden">
                    {/* Background decoration blur */}
                    <div className="absolute top-0 right-0 -mr-6 -mt-6 h-16 w-16 bg-blue-500/[0.015] rounded-full"></div>

                    {/* Metadata line */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold border uppercase tracking-wide font-sans ${theme.badge}`}>
                          {theme.label}
                        </span>
                        <span className="text-[10px] sm:text-xs text-slate-400 font-mono flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formattedDate}
                        </span>
                      </div>

                      {/* Points badge indicator */}
                      <span className={`self-start sm:self-auto font-mono text-xs sm:text-sm font-extrabold px-3 py-1 rounded-full border flex items-center gap-1 ${
                        item.pointsChange > 0
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {item.pointsChange > 0 ? `+${item.pointsChange}` : `${item.pointsChange}`}
                        <span className="text-[10px] font-normal font-sans">баллов</span>
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-sans text-sm sm:text-base font-bold text-slate-900 leading-snug group-hover:text-blue-900 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-550 leading-relaxed font-sans font-normal italic">
                        {item.details}
                      </p>
                    </div>

                    {/* Shortcut dynamic route trigger */}
                    {item.type === 'exemption_purchase' && (
                      <div className="pt-2 border-t border-slate-50 flex">
                        <button
                          onClick={() => onNavigateToTab('store')}
                          className="text-[11px] font-bold text-blue-900 hover:text-blue-700 transition-colors flex items-center space-x-1 cursor-pointer"
                        >
                          <span>Посмотреть бланки в магазине</span>
                          <span>→</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Advice widget cards */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5 space-y-3 font-sans">
        <h4 className="text-xs font-bold text-blue-950 uppercase tracking-widest font-display flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-blue-900" />
          <span>Как повысить свой статус на шкале достижений?</span>
        </h4>
        <div className="grid gap-3 sm:grid-cols-2 text-xs text-slate-600 leading-relaxed font-sans">
          <p>
            • <b>Записывайтесь докладчиком</b> на круглые столы ФЭМ или отправляйте научные работы на вузовские конкурсы БГЭУ. Это приносит от <b>80 до 120 баллов СНО</b> разом и фиксируется в вашем личном портфолио!
          </p>
          <p>
            • <b>Еженедельно решайте</b> экономические викторины СНО на этой платформе. Каждая успешная попытка дает до <b>+50 баллов</b> в вашу личную копилку.
          </p>
        </div>
      </div>

      {/* Dynamic Interactive Student Feedback Port */}
      <StudentFeedbackPort profile={profile} />
    </div>
  );
}

function StudentFeedbackPort({ profile }: { profile: StudentProfile }) {
  const { feedbacks, submitFeedback } = useFirebase();
  const [category, setCategory] = useState<'suggestion' | 'issue' | 'praise' | 'other'>('suggestion');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Filter feedbacks belonging only to this specific student
  const myFeedbacks = feedbacks.filter(f => f.studentId === profile.studentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setIsSubmitting(true);
    setSuccess(false);

    try {
      await submitFeedback(category, message.trim());
      setMessage('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2 font-sans">
      {/* Feedback Submission Form */}
      <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-1.5">
            <MessageSquare className="h-4 w-4 text-blue-900" />
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Обратная связь с Активом СНО</h4>
          </div>
          <p className="text-[11px] text-slate-400">Есть идея, нашли ошибку в балансе, или хотите поблагодарить организаторов? Напишите обращение.</p>
        </div>

        {success && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-850 border border-emerald-200 rounded-xl text-xs animate-fade-in">
            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">Обращение успешно доставлено в деканат СНО БГЭУ!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Category selection */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Категория общения</label>
            <div className="grid grid-cols-2 gap-1.5">
              {(['suggestion', 'issue', 'praise', 'other'] as const).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    category === cat
                      ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat === 'suggestion' ? '💡 Предложить идею' :
                   cat === 'issue' ? '⚠️ Сообщить об ошибке' :
                   cat === 'praise' ? '🌟 Спасибо' : '✉️ Другое'}
                </button>
              ))}
            </div>
          </div>

          {/* Message input */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Текст обращения</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Опишите ваше предложение или проблему подробно. Актив СНО ответит вам прямо сюда..."
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 text-xs sm:text-sm text-slate-800 placeholder-slate-400 resize-none font-sans"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !message.trim()}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-900 text-white hover:bg-blue-950 font-bold rounded-xl text-xs transition-all disabled:opacity-50 cursor-pointer shadow"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{isSubmitting ? 'Отправка...' : 'Отправить обращение'}</span>
          </button>
        </form>
      </div>

      {/* Feedback list / history for this specific student */}
      <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
        <div className="space-y-3 w-full">
          <div className="space-y-1 border-b border-sidebar-100 pb-2">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">История ваших обращений ({myFeedbacks.length})</h4>
            <p className="text-[11px] text-slate-400">Здесь вы можете отслеживать статусы рассмотрения ваших заявок Активом СНО ФЭМ:</p>
          </div>

          <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-1">
            {myFeedbacks.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs space-y-1.5">
                <AlertCircle className="h-8 w-8 mx-auto text-slate-300" />
                <p className="font-semibold">История сообщений пуста</p>
                <p>Вы пока не отправляли обратной связи.</p>
              </div>
            ) : (
              myFeedbacks.map(fb => (
                <div key={fb.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5 transition-shadow hover:shadow-sm">
                  {/* Category, status and date */}
                  <div className="flex items-center justify-between text-[10px] flex-wrap gap-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-1.5 py-0.5 rounded font-extrabold uppercase ${
                        fb.category === 'issue' ? 'bg-rose-100 text-rose-700' :
                        fb.category === 'suggestion' ? 'bg-amber-100 text-amber-800' :
                        fb.category === 'praise' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {fb.category === 'issue' ? 'Проблема' :
                         fb.category === 'suggestion' ? 'Предложение' :
                         fb.category === 'praise' ? 'Благодарность' : 'Другое'}
                      </span>
                      <span className="text-slate-400 font-sans">{fb.date}</span>
                    </div>

                    <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      fb.status === 'new' ? 'bg-red-50 text-red-600 border border-red-100' :
                      fb.status === 'reviewed' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      {fb.status === 'new' ? 'НОВОЕ' :
                       fb.status === 'reviewed' ? 'В ПРОЦЕССЕ' : 'РЕШЕНО'}
                    </span>
                  </div>

                  {/* Message */}
                  <p className="text-xs text-slate-650 leading-relaxed font-sans">{fb.message}</p>

                  {/* Reply text if present */}
                  {fb.replyText && (
                    <div className="bg-lime-50/20 border-l-2 border-emerald-500 p-2 text-[11px] leading-relaxed">
                      <span className="font-bold text-emerald-800 block uppercase text-[9px] tracking-wide">Ответ Актива СНО:</span>
                      <p className="text-slate-700 font-medium italic mt-0.5">«{fb.replyText}»</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
