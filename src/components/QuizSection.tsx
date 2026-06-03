import { useState } from 'react';
import { Award, CheckCircle2, XCircle, ChevronRight, HelpCircle, RefreshCw, Trophy, Sparkles, ShieldAlert } from 'lucide-react';
import { Quiz, QuizQuestion } from '../types';

interface QuizSectionProps {
  quizzes: Quiz[];
  onAddPoints: (points: number, reason: string) => void;
  completedQuizIds: Record<string, number>; // quizId -> score
  onCompleteQuiz: (quizId: string, score: number) => void;
}

export default function QuizSection({
  quizzes,
  onAddPoints,
  completedQuizIds,
  onCompleteQuiz,
}: QuizSectionProps) {
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [earnedPointsThisRun, setEarnedPointsThisRun] = useState<number>(0);

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

                  <div className="pt-4 mt-4 border-t border-slate-50">
                    <button
                      onClick={() => startQuiz(quiz)}
                      className="w-full flex items-center justify-center space-x-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs py-2.5 transition-colors shadow-sm"
                    >
                      <span>{previousScore !== undefined ? 'Пройти снова' : 'Начать тест'}</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
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
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Система начисления баллов СНО ФЭМ является полностью автоматизированной. Очки начисляются пропорционально правильным ответам. Баллы за конкретную викторину можно накопить только один раз (до максимума). Попытки прохождения не ограничены. Исследуйте подсказки, учитесь экономике и побеждайте!
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

              {/* Highscore assessment text */}
              <div className="max-w-sm mx-auto p-3.5 rounded-xl border border-dashed border-blue-200 bg-blue-50/50 text-[11px] text-slate-600 leading-relaxed font-sans text-left space-y-1">
                <span className="font-bold text-blue-900 block uppercase tracking-wider text-[10px]">Информация по начислению:</span>
                {completedQuizIds[activeQuiz.id] !== undefined && completedQuizIds[activeQuiz.id] >= correctAnswersCount ? (
                  <span>
                    Вы уже ранее проходили эту викторину с результатом <b>{completedQuizIds[activeQuiz.id]} из {activeQuiz.questions.length}</b>. Баллы начисляются только за улучшение лучшего результата. Попробуйте еще раз, чтобы получить идеальный балл!
                  </span>
                ) : (
                  <span>
                    Поздравляем! Новый рекорд записан в систему СНО ФЭМ БГЭУ. Очки успешно зачислены в ваш личный профиль и готовы к использованию в магазине СНО.
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2 max-w-xs mx-auto pt-2">
                <button
                  onClick={() => startQuiz(activeQuiz)}
                  className="w-full flex items-center justify-center space-x-1.5 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Пройти заново</span>
                </button>
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 text-xs transition-colors shadow"
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
