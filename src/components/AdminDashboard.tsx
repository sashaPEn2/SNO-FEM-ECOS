import React, { useState } from 'react';
import { useFirebase } from '../context/FirebaseContext';
import { StudentFeedback, SystemLog, EventRegistration, ScienceEvent } from '../types';
import { 
  Users, CheckSquare, Square, Check, X, ShieldAlert, 
  Trash2, Filter, Search, Terminal, MessageSquare, AlertCircle, 
  CheckCircle2, HelpCircle, MessageCircle, Award, 
  ChevronRight, Shield, Download, RefreshCw, Eye, Sparkles,
  UserCheck, AlertTriangle, HelpCircle as QuestionCircle, Inbox, ScrollText
} from 'lucide-react';

export default function AdminDashboard() {
  const {
    registrations,
    events,
    feedbacks,
    systemLogs,
    registeredUsersList,
    updateFeedback,
    deleteFeedback,
    bulkUpdateRegistrations,
    createLog
  } = useFirebase();

  // Primary Tabs: 'registrations' | 'feedback' | 'logs'
  const [activeTab, setActiveTab] = useState<'registrations' | 'feedback' | 'logs'>('registrations');

  // --- REGISTRATIONS SUB-TAB STATE ---
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [regSearchQuery, setRegSearchQuery] = useState<string>('');
  const [selectedRegIds, setSelectedRegIds] = useState<string[]>([]);
  const [isBulkActionActive, setIsBulkActionActive] = useState<boolean>(false);
  const [regSuccessMessage, setRegSuccessMessage] = useState<string>('');

  // --- FEEDBACK SUB-TAB STATE ---
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<string>('all');
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState<string>('all');
  const [activeFeedbackId, setActiveFeedbackId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState<string>('');
  const [adminNotesText, setAdminNotesText] = useState<string>('');
  const [feedbackSuccessMessage, setFeedbackSuccessMessage] = useState<string>('');

  // --- LOGS SUB-TAB STATE ---
  const [logSeverityFilter, setLogSeverityFilter] = useState<string>('all');
  const [logSearchQuery, setLogSearchQuery] = useState<string>('');
  const [isLogsAutoScrollActive, setIsLogsAutoScrollActive] = useState<boolean>(true);

  // --- CALCULATORS & FILTERS ---

  // 1. Registrations Filtering
  const filteredRegistrations = registrations.filter(reg => {
    const matchesEvent = selectedEventId === 'all' || reg.eventId === selectedEventId;
    const matchesSearch = regSearchQuery.trim() === '' || 
      reg.studentName.toLowerCase().includes(regSearchQuery.toLowerCase()) ||
      (reg.studentGroup && reg.studentGroup.toLowerCase().includes(regSearchQuery.toLowerCase())) ||
      (reg.paperTitle && reg.paperTitle.toLowerCase().includes(regSearchQuery.toLowerCase()));
    return matchesEvent && matchesSearch;
  });

  // 2. Feedback Filtering
  const filteredFeedbacks = feedbacks.filter(fb => {
    const matchesStatus = feedbackStatusFilter === 'all' || fb.status === feedbackStatusFilter;
    const matchesCategory = feedbackCategoryFilter === 'all' || fb.category === feedbackCategoryFilter;
    return matchesStatus && matchesCategory;
  });

  // 3. System Logs Filtering & Formatting
  const filteredLogs = systemLogs.filter(log => {
    const matchesSeverity = logSeverityFilter === 'all' || log.severity === logSeverityFilter;
    const matchesSearch = logSearchQuery.trim() === '' || 
      log.action.toLowerCase().includes(logSearchQuery.toLowerCase()) || 
      log.details.toLowerCase().includes(logSearchQuery.toLowerCase()) || 
      log.userName.toLowerCase().includes(logSearchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  // --- HANDLERS ---

  // Bulk Operations Handlers
  const handleToggleSelectReg = (id: string) => {
    setSelectedRegIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFilteredRegs = () => {
    if (selectedRegIds.length === filteredRegistrations.length) {
      setSelectedRegIds([]);
    } else {
      setSelectedRegIds(filteredRegistrations.map(r => r.id));
    }
  };

  const executeBulkOperation = async (action: 'delete' | 'change_role' | 'mark_attended', rolePayload?: 'speaker' | 'listener') => {
    if (selectedRegIds.length === 0) return;
    setIsBulkActionActive(true);
    setRegSuccessMessage('');

    try {
      if (action === 'change_role') {
        await bulkUpdateRegistrations(selectedRegIds, 'change_role', { role: rolePayload });
        setRegSuccessMessage(`Успешно изменена роль для ${selectedRegIds.length} участников на ${rolePayload === 'speaker' ? 'Докладчик' : 'Слушатель'}.`);
      } else if (action === 'mark_attended') {
        await bulkUpdateRegistrations(selectedRegIds, 'mark_attended');
        setRegSuccessMessage(`Успешно зафиксировано присутствие и начислены баллы для ${selectedRegIds.length} участников!`);
      } else if (action === 'delete') {
        if (confirm(`Вы уверены, что хотите аннулировать ${selectedRegIds.length} регистраций на события? Это уменьшит счетчик зарегистрированных участников конференций.`)) {
          await bulkUpdateRegistrations(selectedRegIds, 'delete');
          setRegSuccessMessage(`Успешно аннулировано ${selectedRegIds.length} регистраций участников.`);
        }
      }
      setSelectedRegIds([]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsBulkActionActive(false);
      setTimeout(() => setRegSuccessMessage(''), 5000);
    }
  };

  // Feedback Management Handlers
  const handleOpenFeedbackActionModal = (fb: StudentFeedback) => {
    setActiveFeedbackId(fb.id);
    setAdminReplyText(fb.replyText || '');
    setAdminNotesText(fb.adminNotes || '');
    setFeedbackSuccessMessage('');
  };

  const handleUpdateFeedbackStatus = async (fbId: string, nextStatus: StudentFeedback['status']) => {
    try {
      await updateFeedback(fbId, { status: nextStatus });
      setFeedbackSuccessMessage(`Статус отзыва изменен на «${
        nextStatus === 'new' ? 'Новый' : nextStatus === 'reviewed' ? 'Просмотрено' : 'Решено'
      }».`);
      setTimeout(() => setFeedbackSuccessMessage(''), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveFeedbackEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFeedbackId) return;

    try {
      await updateFeedback(activeFeedbackId, {
        replyText: adminReplyText.trim() || undefined,
        adminNotes: adminNotesText.trim() || undefined,
        status: adminReplyText.trim() ? 'resolved' : 'reviewed'
      });
      setFeedbackSuccessMessage('Ответ и внутренние заметки администратора успешно сохранены.');
      setActiveFeedbackId(null);
      setTimeout(() => setFeedbackSuccessMessage(''), 5000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (confirm('Вы уверены, что хотите безвозвратно удалить этот отзыв? Студенты больше не увидят его.')) {
      try {
        await deleteFeedback(id);
        setFeedbackSuccessMessage('Отзыв успешно удален.');
        setTimeout(() => setFeedbackSuccessMessage(''), 4000);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // LOGS STASTICS
  const logStats = {
    total: systemLogs.length,
    success: systemLogs.filter(l => l.severity === 'success').length,
    info: systemLogs.filter(l => l.severity === 'info').length,
    warning: systemLogs.filter(l => l.severity === 'warning').length,
  };

  return (
    <div className="space-y-6">
      {/* SECTION HEADER WITH SUBTITLE */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-3xl border border-slate-800 text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1 px-2 text-[10px] font-extrabold uppercase tracking-widest bg-indigo-500 text-indigo-50 rounded bg-opacity-30">
              Организатор СНО
            </span>
            <Shield className="h-4 w-4 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-black font-display tracking-tight text-white">
            Панель управления Актива СНО ФЭМ
          </h1>
          <p className="text-xs text-indigo-200">
            Менеджмент обращений студентов БГЭУ, служебные логи, реестры и пакетные операции на события
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/5 text-center">
            <p className="text-[10px] uppercase font-bold text-indigo-300">Регистраций</p>
            <p className="text-lg font-black">{registrations.length}</p>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/5 text-center">
            <p className="text-[10px] uppercase font-bold text-indigo-300">Тикетов связи</p>
            <p className="text-lg font-black">{feedbacks.length}</p>
          </div>
        </div>
      </div>

      {/* DASHBOARD TAB SHIFT BAR */}
      <div className="flex border-b border-slate-200 bg-white p-1.5 rounded-2xl shadow-sm gap-1">
        <button
          onClick={() => {
            setActiveTab('registrations');
            createLog('Переключение вкладки', 'Открыт реестр групповых операций над регистрациями', 'info');
          }}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'registrations'
              ? 'bg-blue-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <UserCheck className="h-4 w-4" />
          <span>Пакетные операции</span>
          {selectedRegIds.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black animate-pulse">
              {selectedRegIds.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('feedback');
            createLog('Переключение вкладки', 'Открыто управление жалобами и откликами студентов', 'info');
          }}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'feedback'
              ? 'bg-blue-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Студенческий фидбек</span>
          {feedbacks.filter(f => f.status === 'new').length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-650 text-white bg-red-600 font-extrabold text-[9px]">
              {feedbacks.filter(f => f.status === 'new').length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('logs');
            createLog('Переключение вкладки', 'Открыт терминал системного аудита и логирования', 'info');
          }}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'logs'
              ? 'bg-blue-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Terminal className="h-4 w-4" />
          <span>Логи системы</span>
        </button>
      </div>

      {/* --- WORKSPACE SUBSECTIONS --- */}

      {/* 1. REGISTRATIONS WORKSPACE (BULK OPERATIONS) */}
      {activeTab === 'registrations' && (
        <div className="space-y-4">
          {regSuccessMessage && (
            <div className="flex items-center gap-3 p-4 text-xs sm:text-sm bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl animate-fade-in shadow-sm">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <span className="font-semibold">{regSuccessMessage}</span>
            </div>
          )}

          {/* Table Filters & Header controls */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center space-x-1.5 border-b border-slate-100 pb-2.5">
              <span>Параметры фильтрации и групповых действий</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Event Filter */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Выбор научного события</label>
                <select
                  value={selectedEventId}
                  onChange={(e) => {
                    setSelectedEventId(e.target.value);
                    setSelectedRegIds([]);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 text-xs sm:text-sm text-slate-700"
                >
                  <option value="all">Все запланированные события ({events.length})</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.title.length > 50 ? `${ev.title.slice(0, 50)}...` : ev.title}</option>
                  ))}
                </select>
              </div>

              {/* Text Search input */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Поиск студента или группы</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={regSearchQuery}
                    onChange={(e) => {
                      setRegSearchQuery(e.target.value);
                      setSelectedRegIds([]);
                    }}
                    placeholder="Например: Карабанова или ДНЗ-2..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 text-xs sm:text-sm placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Selection Summary */}
              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 flex flex-col justify-center items-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">В выборке: {filteredRegistrations.length}</span>
                <span className="text-xs font-black text-slate-700 mt-0.5">Выбрано записей: {selectedRegIds.length}</span>
              </div>
            </div>

            {/* Bulk Actions Panel */}
            {selectedRegIds.length > 0 && (
              <div className="p-4 bg-amber-50/55 border border-amber-200/60 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in shadow-inner">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-slate-900">Доступны пакетные операции</p>
                    <p className="text-[10.5px] text-slate-500">К выбранным {selectedRegIds.length} записям можно применить действия:</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    onClick={() => executeBulkOperation('mark_attended')}
                    disabled={isBulkActionActive}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Подтвердить участие & выдать баллы</span>
                  </button>

                  <button
                    onClick={() => executeBulkOperation('change_role', 'speaker')}
                    disabled={isBulkActionActive}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-650 text-indigo-900 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-all active:scale-95"
                  >
                    <Award className="h-3.5 w-3.5 text-indigo-700" />
                    <span>В докладчики</span>
                  </button>

                  <button
                    onClick={() => executeBulkOperation('change_role', 'listener')}
                    disabled={isBulkActionActive}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-900 hover:bg-blue-100 rounded-xl text-xs font-bold transition-all active:scale-95"
                  >
                    <Users className="h-3.5 w-3.5 text-blue-700" />
                    <span>В слушатели</span>
                  </button>

                  <button
                    onClick={() => executeBulkOperation('delete')}
                    disabled={isBulkActionActive}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all active:scale-95"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                    <span>Аннулировать</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Registrations List Grid Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden pb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4 w-12 text-center h-11">
                      <button
                        onClick={handleSelectAllFilteredRegs}
                        className="text-slate-400 hover:text-slate-700 focus:outline-none flex justify-center w-full"
                      >
                        {selectedRegIds.length === filteredRegistrations.length && filteredRegistrations.length > 0 ? (
                          <CheckSquare className="h-4 w-4 text-blue-900" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="py-3 px-4">Студент</th>
                    <th className="py-3 px-4">Группа</th>
                    <th className="py-3 px-4">Научное событие / Конференция</th>
                    <th className="py-3 px-4">Выбранная Роль</th>
                    <th className="py-3 px-4">Доклад / Тема</th>
                    <th className="py-3 px-4 text-right">Подано</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs sm:text-sm text-slate-700">
                  {filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <div className="max-w-xs mx-auto text-slate-400 space-y-2">
                          <Inbox className="h-10 w-10 mx-auto text-slate-300" />
                          <p className="font-bold">Нет действующих регистраций</p>
                          <p className="text-xs">Никто не подходит под данные критерии фильтрации.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRegistrations.map((reg) => {
                      const isSelected = selectedRegIds.includes(reg.id);
                      return (
                        <tr 
                          key={reg.id} 
                          className={`hover:bg-slate-50/50 transition-colors ${
                            isSelected ? 'bg-indigo-50/20' : ''
                          }`}
                        >
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleToggleSelectReg(reg.id)}
                              className="text-slate-400 hover:text-blue-900 focus:outline-none flex justify-center w-full"
                            >
                              {isSelected ? (
                                <CheckSquare className="h-4.5 w-4.5 text-blue-900" />
                              ) : (
                                <Square className="h-4.5 w-4.5" />
                              )}
                            </button>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-800">
                            <div>
                              <span>{reg.studentName}</span>
                              <span className="block text-[10px] text-slate-400 font-mono mt-0.5">{reg.studentId}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10.5px]">
                              {reg.studentGroup}
                            </span>
                          </td>
                          <td className="py-3 px-4 max-w-xs truncate">
                            <span className="font-medium text-slate-600 block truncate" title={reg.eventTitle}>
                              {reg.eventTitle}
                            </span>
                            <span className="text-[10px] text-slate-400 font-sans">{reg.eventDate}</span>
                          </td>
                          <td className="py-3 px-4 font-semibold">
                            {reg.role === 'speaker' ? (
                              <span className="inline-flex items-center text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg text-[10.5px] border border-indigo-100">
                                <Award className="h-3 w-3 mr-1 text-indigo-500" />
                                Докладчик
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-blue-700 bg-blue-50 px-2 py-1 rounded-lg text-[10.5px] border border-blue-100">
                                <Users className="h-3 w-3 mr-1 text-blue-400" />
                                Слушатель
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 max-w-xs italic text-slate-500">
                            {reg.role === 'speaker' 
                              ? (reg.paperTitle ? `«${reg.paperTitle}»` : 'Тема доклада на согласовании в деканате') 
                              : 'Участие в сессии вопросов-ответов ФЭМ'}
                          </td>
                          <td className="py-3 px-4 text-right text-[11px] text-slate-400 font-sans">
                            {reg.registrationDate}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. STUDENT FEEDBACK LOOP PORT */}
      {activeTab === 'feedback' && (
        <div className="space-y-4">
          {feedbackSuccessMessage && (
            <div className="flex items-center gap-3 p-4 text-xs sm:text-sm bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl animate-fade-in shadow-sm">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <span className="font-semibold">{feedbackSuccessMessage}</span>
            </div>
          )}

          {/* Feedback Filter Bar */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center space-x-1.5 border-b border-slate-100 pb-2.5">
              <span>Сортировка по типу обращения и статусу деканата</span>
            </h2>

            <div className="flex flex-wrap gap-4 items-center">
              {/* Status Selector */}
              <div className="flex flex-col space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Текущий Статус</span>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                  {['all', 'new', 'reviewed', 'resolved'].map(stat => (
                    <button
                      key={stat}
                      onClick={() => setFeedbackStatusFilter(stat)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold uppercase transition-all ${
                        feedbackStatusFilter === stat
                          ? 'bg-blue-900 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {stat === 'all' ? 'Все' : stat === 'new' ? 'Новые' : stat === 'reviewed' ? 'В процессе' : 'Решено'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Selector */}
              <div className="flex flex-col space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Категория отзыва</span>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                  {['all', 'suggestion', 'issue', 'praise', 'other'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFeedbackCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold uppercase transition-all ${
                        feedbackCategoryFilter === cat
                          ? 'bg-blue-900 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {cat === 'all' ? 'Все' : cat === 'suggestion' ? 'Идеи' : cat === 'issue' ? 'Ошибки' : cat === 'praise' ? 'Приветствие' : 'Другое'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feedback list */}
          <div className="space-y-3.5">
            {filteredFeedbacks.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto space-y-3 mt-6">
                <Inbox className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-slate-800 font-bold">Обращений пока не поступало</p>
                <p className="text-xs text-slate-500">Студенты ФЭМ БГЭУ не отправляли обратная связь данного типа.</p>
              </div>
            ) : (
              filteredFeedbacks.map((fb) => (
                <div 
                  key={fb.id}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  {/* Category Banner Side strip */}
                  <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                    fb.category === 'issue' ? 'bg-rose-500' :
                    fb.category === 'suggestion' ? 'bg-amber-500' :
                    fb.category === 'praise' ? 'bg-emerald-500' : 'bg-slate-400'
                  }`} />

                  {/* Header info */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-4 border-b border-slate-100 mb-4 pl-1">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="font-extrabold text-sm text-slate-800">{fb.studentName}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded">
                          {fb.studentGroup}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">({fb.studentId})</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">Отправлено: {fb.date}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Category Badge */}
                      <span className={`text-[9.5px] font-black uppercase px-2 py-0.8 rounded-full border ${
                        fb.category === 'issue' ? 'bg-rose-50 border-rose-200 text-rose-700' :
                        fb.category === 'suggestion' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                        fb.category === 'praise' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                        'bg-slate-50 border-slate-200 text-slate-700'
                      }`}>
                        {fb.category === 'issue' ? 'Проблема ⚠️' :
                         fb.category === 'suggestion' ? 'Идея / Предложение 💡' :
                         fb.category === 'praise' ? 'Благодарность 🌟' : 'Обращение ✉️'}
                      </span>

                      {/* Status Badge */}
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                        fb.status === 'new' ? 'bg-red-50 text-red-700 border border-red-100' :
                        fb.status === 'reviewed' ? 'bg-amber-50 text-amber-800 border border-amber-100' :
                        'bg-emerald-50 text-emerald-800 border border-emerald-100'
                      }`}>
                        ● {fb.status === 'new' ? 'Новое' : fb.status === 'reviewed' ? 'В процессе' : 'Решено'}
                      </span>
                    </div>
                  </div>

                  {/* Message body */}
                  <div className="text-sm text-slate-700 leading-relaxed mb-4 pl-1 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100 font-sans">
                    {fb.message}
                  </div>

                  {/* Reply or admin note section displays if they exist */}
                  {(fb.replyText || fb.adminNotes) && (
                    <div className="space-y-2 mb-4 bg-indigo-50/20 border border-indigo-100/50 p-4 rounded-2xl text-xs sm:text-sm">
                      {fb.adminNotes && (
                        <div>
                          <span className="font-extrabold text-[10px] text-indigo-900 uppercase block tracking-wider">Внутренние заметки Актива:</span>
                          <p className="text-slate-600 mt-0.5">{fb.adminNotes}</p>
                        </div>
                      )}
                      {fb.replyText && (
                        <div className="pt-2 border-t border-indigo-100/50">
                          <span className="font-extrabold text-[10px] text-emerald-800 uppercase block tracking-wider flex items-center space-x-1">
                            <span>Официальный ответ деканата СНО:</span>
                          </span>
                          <p className="font-medium text-slate-800 mt-0.5 italic">«{fb.replyText}»</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions buttons */}
                  <div className="flex items-center justify-end space-x-2 pl-1 border-t border-slate-50 pt-3">
                    <button
                      onClick={() => handleUpdateFeedbackStatus(fb.id, 'reviewed')}
                      className="px-3 py-1.5 hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs transition-all active:scale-95"
                    >
                      На процесс проверки
                    </button>
                    <button
                      onClick={() => handleUpdateFeedbackStatus(fb.id, 'resolved')}
                      className="px-3 py-1.5 hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs transition-all active:scale-95"
                    >
                      Отметить Решенным
                    </button>
                    <button
                      onClick={() => handleOpenFeedbackActionModal(fb)}
                      className="flex items-center space-x-1 px-3.5 py-1.5 bg-indigo-900 text-white hover:bg-blue-900 font-bold rounded-xl text-xs transition-all active:scale-95 shadow-sm shadow-blue-950/10"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>Ответить / Изменить заметку</span>
                    </button>
                    <button
                      onClick={() => handleDeleteFeedback(fb.id)}
                      className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs transition-colors"
                      title="Удалить отзыв полностью"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. SYSTEM SECURITY AUDIT LOG TERMINAL */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 p-6 text-slate-100 shadow-xl space-y-4">
            
            {/* Logs stats grid header */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pb-4 border-b border-slate-800">
              <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700/50">
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wide">Всего за логировано</span>
                <span className="text-xl font-black font-mono text-indigo-400">{logStats.total}</span>
              </div>
              <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700/50">
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wide">Запись успешных</span>
                <span className="text-xl font-black font-mono text-emerald-400">+{logStats.success}</span>
              </div>
              <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700/50">
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wide">Запись информационных</span>
                <span className="text-xl font-black font-mono text-blue-400">{logStats.info}</span>
              </div>
              <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700/50">
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wide">Предупреждения</span>
                <span className="text-xl font-black font-mono text-amber-400">{logStats.warning}</span>
              </div>
            </div>

            {/* Filter outputs logs */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-1">
              <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
                {['all', 'success', 'info', 'warning', 'error'].map(sev => (
                  <button
                    key={sev}
                    onClick={() => setLogSeverityFilter(sev)}
                    className={`px-3 py-1.5 rounded-xl text-[10.5px] font-bold uppercase transition-all font-mono border ${
                      logSeverityFilter === sev
                        ? 'bg-indigo-500 border-indigo-400 text-white shadow shadow-indigo-500/20'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                    }`}
                  >
                    {sev === 'all' ? 'Все уровни' : sev === 'success' ? 'success' : sev === 'info' ? 'info' : sev === 'warning' ? 'warning' : 'error'}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  placeholder="Отфильтровать вывод терминала..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 text-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-400 text-xs font-mono placeholder-slate-500"
                />
              </div>
            </div>

            {/* Terminal screen output */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 h-[360px] overflow-y-auto font-mono text-xs leading-relaxed scrollbar-thin">
              <div className="text-[10px] text-slate-500 pb-2 mb-3 border-b border-slate-900 flex justify-between">
                <span>TERMINAL RECLOG CONSOLE v1.0.8</span>
                <span>ONLINE CLOUD RUN AGENT: ACTIVE</span>
              </div>

              <div className="space-y-2">
                {filteredLogs.length === 0 ? (
                  <div className="py-24 text-center text-slate-600">
                    -- НЕТ ЖУРНАЛЬНЫХ ЗАПИСЕЙ ПО ЗАДАННОМУ ФИЛЬТРУ --
                  </div>
                ) : (
                  filteredLogs.map(log => {
                    const cleanTime = new Date(log.timestamp).toLocaleTimeString('ru-RU');
                    return (
                      <div key={log.id} className="flex hover:bg-slate-900/40 p-1.5 rounded transition-colors group">
                        <span className="text-slate-600 shrink-0 select-none mr-2">[{cleanTime}]</span>
                        <span className={`shrink-0 select-none font-bold mr-1.5 ${
                          log.severity === 'success' ? 'text-emerald-500' :
                          log.severity === 'info' ? 'text-sky-400' :
                          log.severity === 'warning' ? 'text-amber-500' : 'text-red-500'
                        }`}>
                          {log.severity.toUpperCase()}:
                        </span>
                        <div className="flex-1 space-y-0.5">
                          <p className="text-slate-200 font-bold leading-tight flex items-center">
                            <span>{log.action}</span>
                            <span className="text-[10px] text-slate-500 font-normal ml-2 block opacity-0 group-hover:opacity-100 transition-opacity">
                              by {log.userName} ({log.userEmail})
                            </span>
                          </p>
                          <p className="text-slate-400 text-[11px] leading-relaxed">{log.details}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Terminal Actions Footer */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 font-mono">
              <div className="flex items-center space-x-3">
                <span>Записи отфильтровано: {filteredLogs.length}</span>
                <span>•</span>
                <span>Всего логов в памяти: {systemLogs.length}</span>
              </div>
              <button
                onClick={async () => {
                  await createLog('Очистка логов', 'Служебный дашборд запросил ручную запись пульса', 'info');
                }}
                className="flex items-center space-x-1 hover:text-slate-200 transition-colors"
              >
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Записать пульс системы</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DIALOGS --- */}

      {/* Reply Modal Dialog */}
      {activeFeedbackId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in shadow-2xl">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-indigo-900" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                  Форма ответа на обратную связь
                </h3>
              </div>
              <button
                onClick={() => setActiveFeedbackId(null)}
                className="h-8 w-8 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors flex items-center justify-center text-lg font-bold"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveFeedbackEdits} className="p-6 space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-2">
                <div className="flex items-center space-x-1 font-bold text-slate-700">
                  <Inbox className="h-3.5 w-3.5 text-slate-500" />
                  <span>Цитирование обращения:</span>
                </div>
                <p className="italic bg-white p-2.5 rounded-xl border border-slate-200/50 text-slate-500">
                  {feedbacks.find(f => f.id === activeFeedbackId)?.message}
                </p>
                <p className="font-extrabold text-[10px] text-slate-400">
                  ОТПРАВИЛ: {feedbacks.find(f => f.id === activeFeedbackId)?.studentName}
                </p>
              </div>

              {/* Official response input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Официальный ответ СНО на отзыв</label>
                <textarea
                  rows={3}
                  value={adminReplyText}
                  onChange={(e) => setAdminReplyText(e.target.value)}
                  placeholder="Например: Огромное спасибо за предложение! Мы обсудим графики на следующем заседании 27 мая..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 text-xs sm:text-sm text-slate-800 focus:bg-white transition-all resize-none"
                />
                <span className="text-[10px] text-slate-400 leading-tight block">Заполнение ответа автоматически продвинет статус обращения на «Решено». Студент увидит ответ в своем реестре.</span>
              </div>

              {/* Administrative internal notes */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Внутренние заметки Актива (скрыто от студента)</label>
                <textarea
                  rows={2}
                  value={adminNotesText}
                  onChange={(e) => setAdminNotesText(e.target.value)}
                  placeholder="Добавьте пометку для организатора (например: Студент Дарья Карабанова из группы ДНЗ-2, 3 курс...)"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 text-xs sm:text-sm text-slate-800 focus:bg-white transition-all resize-none"
                />
              </div>

              {/* Footer actions */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-150">
                <button
                  type="button"
                  onClick={() => setActiveFeedbackId(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs sm:text-sm hover:bg-slate-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 relative hover:bg-blue-950 font-bold text-white rounded-xl text-xs sm:text-sm active:scale-95 transition-all shadow-md shadow-blue-950/15"
                >
                  Сохранить изменения
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
