import React, { useState } from 'react';
import { Quiz, QuizQuestion, ScienceEvent, EventRegistration, StudentProfile } from '../types';
import { Award, ClipboardList, PenTool, Users, PlusCircle, CheckCircle, BrainCircuit, ShieldAlert, Sparkles, UserPlus } from 'lucide-react';

interface SnoActiveSectionProps {
  quizzes: Quiz[];
  onCreateQuiz: (newQuiz: Quiz) => void;
  events: ScienceEvent[];
  registrations: EventRegistration[];
  registeredUsers: StudentProfile[];
  onAwardPoints: (studentIdOrName: string, points: number, reason: string) => void;
  profile: StudentProfile;
}

export default function SnoActiveSection({
  quizzes,
  onCreateQuiz,
  events,
  registrations,
  registeredUsers,
  onAwardPoints,
  profile,
}: SnoActiveSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<'quizzes' | 'registrations' | 'award'>('quizzes');

  // --- Quiz Creation State ---
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDesc, setQuizDesc] = useState('');
  const [quizCategory, setQuizCategory] = useState('Общий');
  const [quizPoints, setQuizPoints] = useState<number>(50);
  const [questions, setQuestions] = useState<Omit<QuizQuestion, 'id'>[]>([
    {
      text: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
      explanation: '',
    },
  ]);

  const [quizSuccess, setQuizSuccess] = useState('');
  const [quizError, setQuizError] = useState('');

  // --- Points Awarding State ---
  const [selectedUserEmailOrId, setSelectedUserEmailOrId] = useState('');
  const [customPoints, setCustomPoints] = useState<number>(30);
  const [awardReason, setAwardReason] = useState('');
  const [awardSuccess, setAwardSuccess] = useState('');
  const [awardError, setAwardError] = useState('');

  // Add Question to Quiz Builder
  const handleAddQuestion = () => {
    if (questions.length >= 10) {
      alert('Максимальное количество вопросов в викторине — 10');
      return;
    }
    setQuestions([
      ...questions,
      {
        text: '',
        options: ['', '', '', ''],
        correctAnswerIndex: 0,
        explanation: '',
      },
    ]);
  };

  // Remove Question
  const handleRemoveQuestion = (index: number) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    setQuestions(
      questions.map((q, qIndex) => {
        if (qIndex === index) {
          return { ...q, [field]: value };
        }
        return q;
      })
    );
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    setQuestions(
      questions.map((q, index) => {
        if (index === qIndex) {
          const newOptions = [...q.options];
          newOptions[oIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  // Submit Quiz Action
  const handleSubmitQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    setQuizError('');
    setQuizSuccess('');

    if (!quizTitle || !quizDesc) {
      setQuizError('Пожалуйста, заполните заголовок и описание викторины.');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        setQuizError(`Вопрос №${i + 1} содержит пустой текст.`);
        return;
      }
      if (q.options.some((opt) => !opt.trim())) {
        setQuizError(`Вопрос №${i + 1} содержит незаполненные варианты ответов.`);
        return;
      }
      if (!q.explanation.trim()) {
        setQuizError(`Вопрос №${i + 1} содержит пустое обоснование правильного ответа.`);
        return;
      }
    }

    const newQuiz: Quiz = {
      id: `q-custom-${Date.now()}`,
      title: quizTitle,
      description: quizDesc,
      category: quizCategory,
      pointsReward: quizPoints,
      questions: questions.map((q, idx) => ({
        ...q,
        id: `q-custom-sub-${idx}-${Date.now()}`,
      })),
      completed: false,
    };

    onCreateQuiz(newQuiz);
    setQuizSuccess(`Викторина «${quizTitle}» успешно добавлена в общий каталог СНО ФЭМ!`);
    
    // Clear Form
    setQuizTitle('');
    setQuizDesc('');
    setQuizCategory('Общий');
    setQuizPoints(50);
    setQuestions([
      {
        text: '',
        options: ['', '', '', ''],
        correctAnswerIndex: 0,
        explanation: '',
      },
    ]);
  };

  // Submit Award Action
  const handleAwardPointsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAwardError('');
    setAwardSuccess('');

    if (!selectedUserEmailOrId) {
      setAwardError('Пожалуйста, выберите получателя баллов.');
      return;
    }

    if (!awardReason.trim()) {
      setAwardError('Укажите веское основание начисления.');
      return;
    }

    // Run action
    onAwardPoints(selectedUserEmailOrId, customPoints, awardReason);

    // Find the student name helper for modal confirmation
    const studentObj = registeredUsers.find(
      (u) => u.studentId === selectedUserEmailOrId || u.name === selectedUserEmailOrId
    );
    const resolvedName = studentObj ? studentObj.name : selectedUserEmailOrId;

    setAwardSuccess(`Успешно начислено ${customPoints} баллов СНО пользователю ${resolvedName}!`);
    setAwardReason('');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-1 sm:px-4">
      {/* SNO Active Dashboard Brand Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-bold text-blue-300 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-400/20 uppercase tracking-widest">
              Кабинет Модератора СНО
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Организационная рабочая панель СНО ФЭМ
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Приветствуем, <b className="text-indigo-200">{profile.name}</b>. Как активный член СНО, вы уполномочены управлять научными рейтингами, викторинами и просматривать списки участников научных конференций ФЭМ.
          </p>
        </div>
      </div>

      {/* Sub-tab navigation buttons */}
      <div className="flex flex-wrap p-1.5 bg-slate-100 rounded-2xl gap-1">
        <button
          onClick={() => setActiveSubTab('quizzes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeSubTab === 'quizzes'
              ? 'bg-white text-blue-950 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <PenTool className="h-4 w-4 text-blue-900" />
          <span>Конструктор викторин</span>
        </button>

        <button
          onClick={() => setActiveSubTab('registrations')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeSubTab === 'registrations'
              ? 'bg-white text-blue-950 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList className="h-4 w-4 text-blue-900" />
          <span>Списки регистраций</span>
        </button>

        <button
          onClick={() => setActiveSubTab('award')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeSubTab === 'award'
              ? 'bg-white text-blue-950 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span>Начисление баллов</span>
        </button>
      </div>

      {/* SUB-TAB CONTENTS */}

      {activeSubTab === 'quizzes' && (
        /* QUIZ CREATOR FORM */
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BrainCircuit className="h-5.5 w-5.5 text-blue-900" />
              <span>Создать новую викторину</span>
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Спроектируйте тест из вопросов по экономике, менеджменту или истории БГЭУ с поощрением прохождения научными баллами.
            </p>
          </div>

          {quizSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-2xl flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{quizSuccess}</span>
            </div>
          )}

          {quizError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-2xl flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-600 shrink-0" />
              <span>{quizError}</span>
            </div>
          )}

          <form onSubmit={handleSubmitQuiz} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Quiz Title */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Название викторины *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Экологическая экономика и устойчивость Беларуси"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-slate-800 text-sm"
                />
              </div>

              {/* Award Points & Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Размер вознаграждения (баллов) *
                </label>
                <input
                  type="number"
                  required
                  min={10}
                  max={200}
                  value={quizPoints}
                  onChange={(e) => setQuizPoints(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-slate-800 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Краткое описание / Призыв к прохождению *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Отличный способ блеснуть эрудицией и пополнить академический рейтинг СНО..."
                  value={quizDesc}
                  onChange={(e) => setQuizDesc(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-slate-800 text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Уровень / Категория *
                </label>
                <select
                  value={quizCategory}
                  onChange={(e) => setQuizCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-slate-800 text-sm"
                >
                  <option value="Базовый">Базовый уровень</option>
                  <option value="Продвинутый">Продвинутый уровень</option>
                  <option value="Беларусистика">Беларусистика</option>
                  <option value="Экспертный">Экспертный уровень</option>
                </select>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-6 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                  Список вопросов ({questions.length})
                </h3>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="flex items-center gap-1.5 text-xs text-blue-900 hover:text-blue-950 font-bold"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Добавить вопрос</span>
                </button>
              </div>

              <div className="space-y-8 divide-y divide-slate-100">
                {questions.map((q, qIdx) => (
                  <div key={qIdx} className={`pt-6 ${qIdx === 0 ? '' : 'mt-6'} space-y-4`}>
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">
                        Вопрос №{qIdx + 1}
                      </span>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qIdx)}
                          className="text-xs text-red-500 hover:text-red-700 font-semibold"
                        >
                          Удалить вопр.
                        </button>
                      )}
                    </div>

                    {/* Question text */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Текст вопроса *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Какой закон в экономике описывает распределение богатства?"
                        value={q.text}
                        onChange={(e) => handleQuestionChange(qIdx, 'text', e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-slate-800 text-xs sm:text-sm"
                      />
                    </div>

                    {/* 4 options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx}>
                          <label className={`block text-[10px] font-bold ${q.correctAnswerIndex === oIdx ? 'text-emerald-700 font-extrabold' : 'text-slate-500'} mb-1`}>
                            Вариант {oIdx + 1} {q.correctAnswerIndex === oIdx && ' (Правильный ответ)'}
                          </label>
                          <input
                            type="text"
                            required
                            placeholder={`Вариант ${oIdx + 1}`}
                            value={opt}
                            onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                            className={`w-full px-3 py-1.5 bg-slate-50 border rounded-xl focus:outline-none text-xs ${
                              q.correctAnswerIndex === oIdx 
                                ? 'border-emerald-300 focus:ring-2 focus:ring-emerald-500 focus:bg-white bg-emerald-50/20' 
                                : 'border-slate-200 focus:ring-2 focus:ring-blue-900 focus:bg-white'
                            }`}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Correct answer index */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">
                          Какое поле верное? *
                        </label>
                        <select
                          value={q.correctAnswerIndex}
                          onChange={(e) => handleQuestionChange(qIdx, 'correctAnswerIndex', Number(e.target.value))}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                        >
                          <option value={0}>Вариант 1</option>
                          <option value={1}>Вариант 2</option>
                          <option value={2}>Вариант 3</option>
                          <option value={3}>Вариант 4</option>
                        </select>
                      </div>

                      {/* Explanation */}
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">
                          Обоснование правильного ответа *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Этот закон был предложен Вильфредо Парето в 1896 году..."
                          value={q.explanation}
                          onChange={(e) => handleQuestionChange(qIdx, 'explanation', e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-900 text-white rounded-xl text-xs sm:text-sm font-semibold active:scale-95 transition-all flex items-center gap-2"
              >
                <BrainCircuit className="h-4 w-4" />
                <span>Опубликовать в СНО</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {activeSubTab === 'registrations' && (
        /* EVENT REGISTRATION LIST TRACKER */
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="h-5.5 w-5.5 text-blue-900" />
              <span>Заявки участников на мероприятия</span>
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Проверяйте списки зарегистрированных докладчиков и слушателей на олимпиады и круглые столы ФЭМ БГЭУ.
            </p>
          </div>

          <div className="space-y-8">
            {events.map((ev) => {
              const matchedRegs = registrations.filter((r) => r.eventId === ev.id);

              return (
                <div key={ev.id} className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/30 p-4 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">{ev.title}</h3>
                      <p className="text-slate-400 text-xs mt-0.5">Дата: {ev.date} время {ev.time} | Кабинет: {ev.location}</p>
                    </div>
                    <div className="px-3 py-1 bg-blue-50 border border-blue-100 text-blue-900 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      Всего заявок: {matchedRegs.length}
                    </div>
                  </div>

                  {matchedRegs.length === 0 ? (
                    <p className="text-slate-400 text-xs italic py-4 text-center">Никто из исследователей еще не регистрировался на это мероприятие.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="text-slate-500 font-bold border-b border-slate-100 uppercase text-[9px] tracking-wider">
                            <th className="py-2">Фио</th>
                            <th className="py-2">Группа</th>
                            <th className="py-2">Роль</th>
                            <th className="py-2">Научный доклад / Тезисы</th>
                            <th className="py-2 text-right">Подано</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {matchedRegs.map((r) => (
                            <tr key={r.id} className="hover:bg-slate-100/40">
                              <td className="py-3 font-bold text-slate-800">{r.studentName}</td>
                              <td className="py-3 font-mono">{r.studentGroup}</td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                                  r.role === 'speaker'
                                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                }`}>
                                  {r.role === 'speaker' ? 'Докладчик' : 'Слушатель'}
                                </span>
                              </td>
                              <td className="py-3 text-slate-600 truncate max-w-[200px]" title={r.paperTitle}>
                                {r.paperTitle || <span className="text-slate-400 italic">Отсутствует (слушатель)</span>}
                              </td>
                              <td className="py-3 text-right font-medium text-slate-400">{r.registrationDate}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeSubTab === 'award' && (
        /* SNO LEAGUE RATING POINTS ALLOCATOR */
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-5.5 w-5.5 text-amber-500" />
              <span>Начисление баллов (академический рейтинг)</span>
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Премируйте заслуживающих студентов баллами СНО за участие в олимпиадах, публикации статей, написание тезисов РИНЦ.
            </p>
          </div>

          {awardSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-2xl flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{awardSuccess}</span>
            </div>
          )}

          {awardError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-2xl flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-600 shrink-0" />
              <span>{awardError}</span>
            </div>
          )}

          <form onSubmit={handleAwardPointsSubmit} className="space-y-4 max-w-xl">
            {/* Student selection dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Выберите студента из реестра СНО *
              </label>
              <select
                value={selectedUserEmailOrId}
                onChange={(e) => setSelectedUserEmailOrId(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-slate-800 text-sm"
              >
                <option value="">-- Выбрать получателя из зарегистрированных --</option>
                {/* Always make sure logged user is lists as well as mock users */}
                {registeredUsers.map((u) => (
                  <option key={u.studentId} value={u.studentId}>
                    {u.name} (Группа {u.group}, Баланс: {u.points} СНО)
                  </option>
                ))}
              </select>
            </div>

            {/* Quick pre-sets for manual writing if testing */}
            <div className="pt-1 text-[11px] text-slate-400">
              Попробуйте начислить баллы на свой аккаунт, выбрав его в выпадающем меню!
            </div>

            {/* Points to inject and reason */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Баллы *
                </label>
                <input
                  type="number"
                  required
                  min={5}
                  max={250}
                  value={customPoints}
                  onChange={(e) => setCustomPoints(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-800 text-sm"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Основание начисления *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Публикация статьи в журнале ВАК БГЭУ"
                  value={awardReason}
                  onChange={(e) => setAwardReason(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-800 text-sm"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-900 text-white rounded-xl text-xs sm:text-sm font-semibold active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>Начислить академические баллы</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
