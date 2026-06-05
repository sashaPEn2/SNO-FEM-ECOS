import { useState } from 'react';
import { Award, CheckCircle2, XCircle, ChevronRight, HelpCircle, RefreshCw, Trophy, Sparkles, ShieldAlert, Download, Loader2 } from 'lucide-react';
import { Quiz, QuizQuestion, StudentProfile } from '../types';
import { jsPDF } from 'jspdf';

interface QuizSectionProps {
  quizzes: Quiz[];
  onAddPoints: (points: number, reason: string) => void;
  completedQuizIds: Record<string, number>; // quizId -> score
  onCompleteQuiz: (quizId: string, score: number) => void;
  profile?: StudentProfile | null;
}

export default function QuizSection({
  quizzes,
  onAddPoints,
  completedQuizIds,
  onCompleteQuiz,
  profile,
}: QuizSectionProps) {
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [earnedPointsThisRun, setEarnedPointsThisRun] = useState<number>(0);
  const [downloadingCertId, setDownloadingCertId] = useState<string | null>(null);

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

  const handleDownloadQuizCertificate = async (quiz: Quiz, score: number) => {
    setDownloadingCertId(quiz.id);
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // High-availability mirrors to load Roboto with Cyrillic support
      const REGULAR_FONT_URLS = [
        'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
        'https://cdn.jsdelivr.net/npm/roboto-fontface@0.10.0/fonts/roboto/Roboto-Regular.ttf',
        'https://unpkg.com/pdfmake@0.1.66/build/fonts/Roboto/Roboto-Regular.ttf',
        'https://raw.githubusercontent.com/google/fonts/main/ofl/roboto/static/Roboto-Regular.ttf'
      ];

      const BOLD_FONT_URLS = [
        'https://raw.githubusercontent.com/google/fonts/main/ofl/roboto/static/Roboto-Bold.ttf',
        'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
        'https://cdn.jsdelivr.net/npm/roboto-fontface@0.10.0/fonts/roboto/Roboto-Bold.ttf',
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
      }

      // Border & Frame (Landscape size is 297mm x 210mm)
      doc.setDrawColor(30, 41, 59); // slate-800
      doc.setLineWidth(1.5);
      doc.rect(10, 10, 277, 190, 'S');

      doc.setDrawColor(245, 158, 11); // Amber / Gold
      doc.setLineWidth(0.5);
      doc.rect(14, 14, 269, 182, 'S');

      const cornerSize = 8;
      doc.setFillColor(30, 41, 59);
      doc.rect(14, 14, cornerSize, cornerSize, 'F');
      doc.rect(283 - cornerSize, 14, cornerSize, cornerSize, 'F');
      doc.rect(14, 196 - cornerSize, cornerSize, cornerSize, 'F');
      doc.rect(283 - cornerSize, 196 - cornerSize, cornerSize, cornerSize, 'F');

      let y = 30;
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
      doc.setFontSize(22);
      doc.setFont('Roboto', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('СЕРТИФИКАТ ОБ УСПЕШНОМ ПРОХОЖДЕНИИ', 148.5, y, { align: 'center' });

      y += 6;
      doc.setFontSize(10);
      doc.setFont('Roboto', 'normal');
      doc.setTextColor(245, 158, 11);
      doc.text('ИНТЕЛЛЕКТУАЛЬНЫЕ ВИКТОРУНЫ СНО ФЭМ БГЭУ', 148.5, y, { align: 'center', charSpace: 1.5 });

      y += 16;
      doc.setFontSize(12);
      doc.setFont('Roboto', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text('Настоящим сертификатом подтверждается, что студент-исследователь', 148.5, y, { align: 'center' });

      y += 12;
      doc.setFontSize(18);
      doc.setFont('Roboto', 'bold');
      doc.setTextColor(15, 23, 42);
      const studentName = profile?.name || 'Студент БГЭУ';
      doc.text(studentName, 148.5, y, { align: 'center' });

      y += 8;
      doc.setFontSize(11);
      doc.setFont('Roboto', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`Студент ${profile?.course || 3}-го курса группы ${profile?.group || 'ДНЗ-2'} факультета экономики и менеджмента`, 148.5, y, { align: 'center' });

      y += 14;
      doc.setFontSize(11);
      doc.text('успешно прошел(а) научную интерактивную викторину СНО на тему:', 148.5, y, { align: 'center' });

      y += 8;
      doc.setFontSize(13);
      doc.setFont('Roboto', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(`«${quiz.title}»`, 148.5, y, { align: 'center', maxWidth: 210 });

      y += 14;
      doc.setFontSize(11);
      doc.setFont('Roboto', 'normal');
      doc.setTextColor(30, 41, 59);
      const pointsReward = Math.round(quiz.pointsReward * (score / quiz.questions.length));
      doc.text(`С результатом: ${score} из ${quiz.questions.length} правильных ответов (${Math.round((score / quiz.questions.length) * 100)}% верных решений).`, 148.5, y, { align: 'center' });
      y += 5.5;
      doc.text(`За проявленную эрудицию исследователю начислено и добавлено ${pointsReward} баллов в личный рейтинг СНО ФЭМ.`, 148.5, y, { align: 'center' });

      y = 158;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.rect(25, y, 110, 26, 'F');
      doc.rect(25, y, 110, 26, 'S');

      doc.setFontSize(7.5);
      doc.setFont('Roboto', 'bold');
      doc.setTextColor(100, 110, 120);
      doc.text('ВЕРИФИКАЦИЯ РЕЗУЛЬТАТОВ СНО RESTR', 30, y + 5);
      
      doc.setFont('Roboto', 'normal');
      doc.setFontSize(8);
      const uniqueCode = `SNO-QUIZ-${quiz.id.toUpperCase()}-${score}-${profile?.studentId || 'GUEST'}`;
      doc.text(`Код викторины: ${quiz.id}`, 30, y + 11);
      doc.text(`Категория: ${quiz.category}`, 30, y + 16);
      
      doc.setFont('Roboto', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(`Проверочный токен: ${uniqueCode}`, 30, y + 21);

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

      const fileName = `sno_quiz_certificate_${quiz.id}_${(profile?.name || 'student').replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error('Error generating Quiz PDF: ', err);
    } finally {
      setDownloadingCertId(null);
    }
  };

  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIdx(0);
    setSelectedAnswerIdx(null);
    setIsSubmitted(false);
    setCorrectAnswersCount(0);
    setQuizFinished(false);
    setEarnedPointsThisRun(0);
  };

  const handleSelectOption = (index: number) => {
    if (isSubmitted) return;
    setSelectedAnswerIdx(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswerIdx === null || isSubmitted) return;

    const question = activeQuiz!.questions[currentQuestionIdx];
    const isCorrect = selectedAnswerIdx === question.correctAnswerIndex;

    if (isCorrect) {
      setCorrectAnswersCount(p => p + 1);
    }

    setIsSubmitted(true);
  };

  const handleNext = () => {
    const isLast = currentQuestionIdx === activeQuiz!.questions.length - 1;

    if (isLast) {
      // Calculate final reward points
      const questionsCount = activeQuiz!.questions.length;
      const finalScore = correctAnswersCount + (selectedAnswerIdx === activeQuiz!.questions[currentQuestionIdx].correctAnswerIndex ? 1 : 0);
      
      // Calculate fraction of points
      const scoreRatio = finalScore / questionsCount;
      const pointsReward = Math.round(activeQuiz!.pointsReward * scoreRatio);

      setEarnedPointsThisRun(pointsReward);
      setQuizFinished(true);

      // Determine if they can claim it. If previous highscore was lower, they claim the delta
      const prevHighScore = completedQuizIds[activeQuiz!.id] || 0;
      if (finalScore > prevHighScore) {
        const prevRatio = prevHighScore / questionsCount;
        const prevPoints = Math.round(activeQuiz!.pointsReward * prevRatio);
        const deltaPoints = pointsReward - prevPoints;

        if (deltaPoints > 0) {
          onAddPoints(deltaPoints, `Прохождение викторины "${activeQuiz!.title}" (${finalScore}/${questionsCount} прав. ответов)`);
        }
        onCompleteQuiz(activeQuiz!.id, finalScore);
      }
    } else {
      setCurrentQuestionIdx(p => p + 1);
      setSelectedAnswerIdx(null);
      setIsSubmitted(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {!activeQuiz ? (
        <div className="space-y-6">
          {/* Header info */}
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-sans tracking-tight">
              Интеллектуальные Викторины СНО
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-sans">
              Участвуй в интерактивных викторинах по экономике, бизнес-анализу и истории БГЭУ. Зарабатывай реальные баллы для обмена на освобождение!
            </p>
          </div>

          {/* Quizzes Grid layout */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => {
              const previousScore = completedQuizIds[quiz.id];
              const isBestPerfect = previousScore === quiz.questions.length;

              return (
                <div
                  key={quiz.id}
                  className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all duration-300"
                >
                  <div className="space-y-3.5">
                    {/* Badge and Max points view */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-blue-800 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1">
                        {quiz.category}
                      </span>
                      <span className="flex items-center space-x-1 text-xs font-bold font-mono text-amber-600">
                        <Sparkles className="h-3 w-3" />
                        <span>+{quiz.pointsReward} баллов</span>
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-sans text-base font-bold text-slate-900 leading-tight">
                        {quiz.title}
                      </h4>
                      <p className="font-sans text-xs text-slate-500 leading-relaxed line-clamp-3">
                        {quiz.description}
                      </p>
                    </div>

                    <div className="text-[11px] font-medium text-slate-400 font-mono">
                      Вопросов в тесте: <b>{quiz.questions.length}</b>
                    </div>

                    {/* Show completed state */}
                    {previousScore !== undefined && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Trophy className={`h-4 w-4 ${isBestPerfect ? 'text-amber-500' : 'text-slate-400'}`} />
                          <span>Лучший результат:</span>
                        </span>
                        <span className="font-mono font-bold text-slate-800">
                          {previousScore} / {quiz.questions.length}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-50 flex gap-2">
                    {previousScore !== undefined ? (
                      <>
                        <button
                          disabled
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs py-2.5 border border-slate-200 select-none cursor-not-allowed"
                        >
                          <span>Решение сохранено</span>
                        </button>
                        <button
                          onClick={() => handleDownloadQuizCertificate(quiz, previousScore)}
                          disabled={downloadingCertId === quiz.id}
                          className="px-3 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs transition-all float-right shadow-sm shrink-0 flex items-center justify-center border-none cursor-pointer disabled:opacity-60"
                          title="Скачать официальный сертификат викторины"
                        >
                          {downloadingCertId === quiz.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startQuiz(quiz)}
                        className="w-full flex items-center justify-center space-x-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs py-2.5 transition-colors shadow-sm cursor-pointer border-none"
                      >
                        <span>Начать тест (1 попытка)</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Academic Integrity box */}
          <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex gap-3 items-start">
            <Trophy className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-widest leading-none block">Правила СНО БГЭУ</span>
              <p className="text-xs text-slate-600 leading-relaxed font-sans mt-1">
                Система начисления баллов СНО ФЭМ является полностью автоматизированной. Очки начисляются пропорционально правильным ответам. <b>Согласно обновлению, на каждую викторину даётся только 1 попытка</b>. После завершения викторины вы сможете сгенерировать и скачать верифицированный Сертификат СНО ФЭМ (PDF). Проверяйте свои ответы внимательно!
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Quiz Gameplay View */
        <div className="max-w-xl mx-auto border border-slate-100 rounded-3xl bg-white shadow-xl overflow-hidden">
          {/* Header status bar */}
          <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-300 block tracking-widest leading-none">Викторина</span>
              <h3 className="text-sm font-bold truncate max-w-[240px] mt-1">{activeQuiz.title}</h3>
            </div>
            <button
              onClick={() => { if (confirm('Вы уверены, что хотите прервать викторину? Прогресс не сохранится.')) { setActiveQuiz(null); } }}
              className="text-xs text-slate-400 hover:text-white font-bold hover:underline"
            >
              Выйти
            </button>
          </div>

          {!quizFinished ? (
            <div className="p-6 space-y-5">
              {/* Question progress */}
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Вопрос {currentQuestionIdx + 1} из {activeQuiz.questions.length}
                </span>

                {/* Micro progress dots indicator */}
                <div className="flex gap-1.5">
                  {activeQuiz.questions.map((_, i) => (
                    <span
                      key={i}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === currentQuestionIdx
                          ? 'w-5 bg-blue-900'
                          : i < currentQuestionIdx
                          ? 'w-2 bg-slate-300'
                          : 'w-2 bg-slate-100'
                      }`}
                    ></span>
                  ))}
                </div>
              </div>

              {/* Question text */}
              <div className="space-y-4">
                <div className="flex items-start gap-2 text-slate-800">
                  <HelpCircle className="h-5 w-5 text-blue-900 flex-shrink-0 mt-0.5" />
                  <h4 className="font-sans text-base font-bold text-slate-900 leading-snug">
                    {activeQuiz.questions[currentQuestionIdx].text}
                  </h4>
                </div>

                {/* Options List */}
                <div className="space-y-2.5 pt-2">
                  {activeQuiz.questions[currentQuestionIdx].options.map((option, index) => {
                    const isSelected = selectedAnswerIdx === index;
                    const question = activeQuiz.questions[currentQuestionIdx];

                    let optionStyle = 'border-slate-200 hover:bg-slate-50';
                    if (isSelected) {
                      optionStyle = 'border-blue-900 bg-blue-50/50 font-medium';
                    }

                    if (isSubmitted) {
                      const isCorrectAnswer = index === question.correctAnswerIndex;
                      if (isCorrectAnswer) {
                        optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                      } else if (isSelected) {
                        optionStyle = 'border-red-400 bg-red-50 text-red-900 font-medium';
                      } else {
                        optionStyle = 'border-slate-100 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={index}
                        disabled={isSubmitted}
                        onClick={() => handleSelectOption(index)}
                        className={`w-full text-left p-3.5 rounded-2xl border text-xs sm:text-sm font-sans flex items-center justify-between transition-all ${optionStyle}`}
                      >
                        <span className="pr-4">{option}</span>
                        {isSubmitted && index === question.correctAnswerIndex && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                        )}
                        {isSubmitted && isSelected && index !== question.correctAnswerIndex && (
                          <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Explanatory notes if answer is checked */}
              {isSubmitted && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 animate-fade-in text-xs text-slate-600 font-sans space-y-1">
                  <span className="font-extrabold text-blue-950 uppercase block tracking-wider text-[10px]">Подробное объяснение:</span>
                  <p className="leading-relaxed">{activeQuiz.questions[currentQuestionIdx].explanation}</p>
                </div>
              )}

              {/* Submission actions */}
              <div className="flex justify-end pt-4 border-t border-slate-100">
                {!isSubmitted ? (
                  <button
                    disabled={selectedAnswerIdx === null}
                    onClick={handleSubmitAnswer}
                    className="rounded-xl px-5 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-850 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-900/10"
                  >
                    Проверить ответ
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="flex items-center space-x-1.5 rounded-xl px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow"
                  >
                    <span>
                      {currentQuestionIdx === activeQuiz.questions.length - 1
                        ? 'Завершить Викторину'
                        : 'Следующий вопрос'}
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Quiz Completed Recap tab */
            <div className="p-6 text-center space-y-5 animate-fade-in">
              <div className="h-16 w-16 rounded-full bg-amber-50 text-amber-500 border border-amber-100 flex items-center justify-center mx-auto">
                <Trophy className="h-8 w-8 text-amber-500" />
              </div>

              <div className="space-y-1">
                <h3 className="font-sans text-xl font-extrabold text-slate-900">
                  Викторина пройдена!
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  "{activeQuiz.title}" успешно завершена.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto p-4 bg-slate-50/80 border border-slate-200 rounded-2xl font-sans">
                <div className="text-center p-2.5 border-r border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider leading-none">Результат:</span>
                  <span className="text-lg font-mono font-extrabold text-slate-900 block mt-2">
                    {correctAnswersCount} / {activeQuiz.questions.length}
                  </span>
                </div>
                <div className="text-center p-2.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider leading-none">Ваши баллы:</span>
                  <span className="text-lg font-mono font-bold text-amber-600 block mt-2 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 mr-1 text-amber-500" />
                    <span>+{earnedPointsThisRun}</span>
                  </span>
                </div>
              </div>

              {/* Highscore info regarding single attempt logic */}
              <div className="max-w-sm mx-auto p-3.5 rounded-xl border border-dashed border-blue-200 bg-blue-50/50 text-[11px] text-slate-600 leading-relaxed font-sans text-left space-y-1">
                <span className="font-bold text-blue-900 block uppercase tracking-wider text-[10px]">Информация по начислению:</span>
                <span>
                  Ваш результат <b>{correctAnswersCount} из {activeQuiz.questions.length}</b> зафиксирован в базе данных СНО ФЭМ БГЭУ. Единственная попытка использована. Скачайте официальный сертификат о прохождении викторины ниже.
                </span>
              </div>

              <div className="flex flex-col gap-2 max-w-xs mx-auto pt-2">
                <button
                  onClick={() => handleDownloadQuizCertificate(activeQuiz, correctAnswersCount)}
                  disabled={downloadingCertId === activeQuiz.id}
                  className="w-full flex items-center justify-center space-x-1.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold py-2.5 text-xs transition-all shadow hover:shadow-md border-none cursor-pointer disabled:opacity-60"
                >
                  {downloadingCertId === activeQuiz.id ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Генерация Сертификата (PDF)...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-3.5 w-3.5" />
                      <span>Скачать Сертификат (PDF)</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 text-xs transition-colors shadow border-none cursor-pointer"
                >
                  Вернуться к списку викторин
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
