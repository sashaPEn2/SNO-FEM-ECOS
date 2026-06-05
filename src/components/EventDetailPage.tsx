import React, { useState, FormEvent, useEffect } from 'react';
import { ArrowLeft, Calendar, MapPin, Users, Award, ShieldCheck, Clock, BookOpen, AlertCircle, FileText, Check, Download, Trash2 } from 'lucide-react';
import { ScienceEvent, EventRegistration, StudentProfile } from '../types';

interface EventDetailPageProps {
  event: ScienceEvent;
  registrations: EventRegistration[];
  profile: StudentProfile;
  onRegisterEvent: (registration: Omit<EventRegistration, 'id' | 'registrationDate' | 'qrCodeValue'>) => void;
  onCancelRegistration: (id: string) => void;
  onBack: () => void;
}

export default function EventDetailPage({
  event,
  registrations,
  profile,
  onRegisterEvent,
  onCancelRegistration,
  onBack,
}: EventDetailPageProps) {
  // Form states
  const [studentName, setStudentName] = useState(profile.name);
  const [studentGroup, setStudentGroup] = useState(profile.group);
  const [role, setRole] = useState<'speaker' | 'listener'>('listener');
  const [paperTitle, setPaperTitle] = useState('');
  const [formError, setFormError] = useState('');
  const [successRegistration, setSuccessRegistration] = useState<EventRegistration | null>(null);

  useEffect(() => {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [event.id]);

  // Read all registrations for this specific event to display on safety panels
  const eventAttendees = registrations.filter(r => r.eventId === event.id);
  const isCurrentUserRegistered = registrations.some(r => r.eventId === event.id);
  const userTicket = registrations.find(r => r.eventId === event.id);

  const handleSubmitRegistration = (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!studentName.trim()) {
      setFormError('Пожалуйста, введите ФИО');
      return;
    }
    if (!studentGroup.trim()) {
      setFormError('Пожалуйста, укажите учебную группу');
      return;
    }
    if (role === 'speaker' && !paperTitle.trim()) {
      setFormError('Докладчикам обязательно нужно указать тему научного доклада');
      return;
    }

    const isAlreadyRegistered = registrations.some(
      r => r.eventId === event.id && r.studentName.toLowerCase() === studentName.toLowerCase()
    );

    if (isAlreadyRegistered) {
      setFormError('Вы уже зарегистрировались на это мероприятие!');
      return;
    }

    onRegisterEvent({
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      studentName,
      studentGroup,
      role,
      paperTitle: role === 'speaker' ? paperTitle : undefined,
    });

    const qrCodeMock = `BSEU-FEM-CONF-${event.id}-${Date.now().toString().slice(-4)}`;
    const mockCreatedReg: EventRegistration = {
      id: Math.random().toString(),
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      studentName,
      studentGroup,
      role,
      paperTitle: role === 'speaker' ? paperTitle : undefined,
      registrationDate: new Date().toLocaleDateString(),
      qrCodeValue: qrCodeMock,
    };

    setSuccessRegistration(mockCreatedReg);
  };

  const currentRegistrationTicket = successRegistration || userTicket;

  return (
    <div className="space-y-8 animate-fade-in text-slate-800 pb-16">
      {/* Breadcrumbs and back navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-900 group transition-all"
        >
          <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
          <span>Вернуться к календарю событий</span>
        </button>

        <div className="flex items-center space-x-2 text-slate-400 font-bold uppercase text-[10px] sm:text-xs">
          <span>События БГЭУ</span>
          <span className="text-slate-600 truncate max-w-[200px] sm:max-w-xs ml-2">/ {event.title}</span>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Event details information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Banner */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
            <div className="h-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950"></div>
            <div className="p-6 sm:p-8 space-y-5">
              <span className="inline-flex items-center space-x-1.5 rounded-full bg-blue-50 text-blue-900 border border-blue-105 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                💡 Официальное событие СНО ФЭМ
              </span>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 leading-snug">
                {event.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                {event.description}
              </p>

              {/* Badges Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-150">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Начисление для докладчика:</span>
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-blue-900">
                    <Award className="h-4 w-4 text-amber-500" />
                    <span>+{event.pointsForSpeaker} баллов активности</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 border-t md:border-t-0 md:border-l border-slate-200 pt-2.5 md:pt-0 md:pl-4">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Начисление для слушателя:</span>
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-slate-700">
                    <Award className="h-4 w-4 text-slate-400" />
                    <span>+{event.pointsForListener} баллов активности</span>
                  </div>
                </div>
              </div>

              {/* Event logistics info */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2 text-xs sm:text-sm font-semibold">
                <div className="flex items-start space-x-2 p-3 bg-blue-100/30 rounded-xl border border-blue-100 border-l-3 border-l-blue-905">
                  <Calendar className="h-4.5 w-4.5 text-blue-900 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] uppercase font-bold text-blue-800 tracking-wider block font-sans">Дата:</span>
                    <span className="text-slate-800 text-xs sm:text-sm">{new Date(event.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2 p-3 bg-indigo-50 border border-indigo-100 rounded-xl border-l-3 border-l-indigo-400">
                  <Clock className="h-4.5 w-4.5 text-indigo-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] uppercase font-bold text-indigo-800 tracking-wider block font-sans">Время:</span>
                    <span className="text-slate-800 text-xs sm:text-sm">{event.time}</span>
                  </div>
                </div>

                <div className="col-span-2 md:col-span-1 flex items-start space-x-2 p-3 bg-slate-100/50 border border-slate-200 rounded-xl border-l-3 border-l-slate-400">
                  <MapPin className="h-4.5 w-4.5 text-slate-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block font-sans">Аудитория:</span>
                    <span className="text-slate-800 text-xs sm:text-sm truncate block">{event.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Agenda & Rules Checklist (Collapsible or structured blocks) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 space-y-4">
            <h3 className="font-sans text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
              📅 Программа научного события ФЭМ
            </h3>

            <div className="relative border-l border-slate-200 ml-3.5 space-y-5 py-2 text-xs sm:text-sm font-sans">
              <div className="relative pl-6">
                <div className="absolute -left-[5.5px] top-1.5 h-2.5 w-2.5 rounded-full bg-blue-900"></div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-700">{event.time} - {parseInt(event.time) + 0}:20</span>
                  <span className="text-slate-800 font-semibold mt-0.5">Вводный доклад СНО & Сбор научных руководителей ФЭМ</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">Приветственное слово деканата факультета экономики и менеджмента БГЭУ.</p>
                </div>
              </div>

              <div className="relative pl-6">
                <div className="absolute -left-[5.5px] top-1.5 h-2.5 w-2.5 rounded-full bg-indigo-705"></div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-700">{parseInt(event.time) + 0}:30 - {parseInt(event.time) + 2}:00</span>
                  <span className="text-slate-800 font-semibold mt-0.5">Основное пленарное заседание</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">Выступление почетных докладчиков, презентация последних прикладных бизнес-моделей.</p>
                </div>
              </div>

              <div className="relative pl-6">
                <div className="absolute -left-[5.5px] top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500"></div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-700">{parseInt(event.time) + 2}:15 - Назад</span>
                  <span className="text-slate-800 font-semibold mt-0.5">Подведение итогов, разбор тезисов и начисление баллов СНО</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">Выдача официальных билетов по верификации для дежурства на сессии деканских увольнений.</p>
                </div>
              </div>
            </div>
            
            {event.requirements && (
              <div className="mt-4 p-4 bg-orange-50/50 border border-orange-200/60 rounded-2xl flex items-start gap-2 text-xs text-slate-600 leading-relaxed font-sans">
                <AlertCircle className="h-4.5 w-4.5 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-orange-850 uppercase text-[10px] block mb-1">Требования к научному участию:</span>
                  {event.requirements}
                </div>
              </div>
            )}
          </div>

          {/* Social Attendee Registry list */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 space-y-4">
            <h3 className="font-sans text-base sm:text-lg font-bold text-slate-900 flex items-center justify-between">
              <span>👥 Реестр участников события ({eventAttendees.length})</span>
              <span className="text-xs bg-slate-100 text-slate-500 font-mono font-bold px-2 py-0.5 rounded-md">
                Осталось мест: {45 - eventAttendees.length}
              </span>
            </h3>

            {eventAttendees.length === 0 ? (
              <div className="border border-dashed border-slate-150 rounded-2xl p-6 text-center text-slate-400 text-xs sm:text-sm font-medium">
                Пока никто не зарегистрировался на это событие. Будьте первым!
              </div>
            ) : (
              <div className="space-y-3 font-sans text-xs">
                {eventAttendees.map((att, idx) => (
                  <div key={idx} className="flex gap-3 justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-150">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-indigo-50 border border-indigo-200 text-indigo-800 font-extrabold flex items-center justify-center rounded-lg text-xs">
                        {idx + 1}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block line-clamp-1">{att.studentName}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">Группа {att.studentGroup}</span>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end shrink-0">
                      <span className={`inline-block text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md leading-none ${
                        att.role === 'speaker'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-105 text-blue-800'
                      }`}>
                        {att.role === 'speaker' ? 'Докладчик' : 'Слушатель'}
                      </span>
                      {att.paperTitle && (
                        <span className="text-[10px] italic text-slate-400 mt-1 block truncate max-w-[120px] sm:max-w-xs">
                          «{att.paperTitle}»
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Dynamic registration form or personal ticket details */}
        <div className="space-y-6">
          {!isCurrentUserRegistered ? (
            /* REGISTRATION FORM (Injected directly on page) */
            <div className="bg-white rounded-3xl border border-slate-205 shadow-md p-5 sm:p-6 space-y-4">
              <div className="border-b border-slate-150 pb-2">
                <h4 className="font-sans text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-tight">
                  Подать заявку на участие
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Оформить запись в научную базу СНО:</p>
              </div>

              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                  <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitRegistration} className="space-y-4">
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-600 uppercase tracking-wide block">
                    ФИО Участника: *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 p-2.5 font-semibold focus:border-blue-900 focus:outline-none"
                    placeholder="Сидоров Алан Борисович"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-600 uppercase tracking-wide block">
                    Группа: *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentGroup}
                    onChange={(e) => setStudentGroup(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 p-2.5 font-semibold focus:border-blue-900 focus:outline-none"
                    placeholder="ДНЗ-1"
                  />
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
                  <label className="font-bold text-slate-600 uppercase tracking-wide block">
                    Выберите Вашу роль: *
                  </label>

                  <div className="grid grid-cols-1 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setRole('listener')}
                      className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                        role === 'listener'
                          ? 'border-blue-900 bg-blue-50/50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input type="radio" checked={role === 'listener'} readOnly className="h-4 w-4 text-blue-900 shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800">Слушатель</span>
                        <span className="text-[10px] text-slate-400 mt-0.5 font-medium leading-none">Очное присутствие | +{event.pointsForListener} баллов</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setRole('speaker'); setPaperTitle(''); }}
                      className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                        role === 'speaker'
                          ? 'border-blue-900 bg-blue-50/50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input type="radio" checked={role === 'speaker'} readOnly className="h-4 w-4 text-blue-900 shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-850">Докладчик</span>
                        <span className="text-[10px] text-slate-450 mt-0.5 font-medium leading-none">Тезисы в сборник РИНЦ | +{event.pointsForSpeaker} баллов</span>
                      </div>
                    </button>
                  </div>
                </div>

                {role === 'speaker' && (
                  <div className="space-y-1 text-xs border-t border-slate-100 pt-3 animate-fade-in">
                    <label className="font-bold text-slate-600 uppercase tracking-wide block">
                      Научная тема тезисов: *
                    </label>
                    <input
                      type="text"
                      required
                      value={paperTitle}
                      onChange={(e) => setPaperTitle(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-200 p-2.5 font-semibold focus:border-blue-900 focus:outline-none"
                      placeholder="Оценка инвестиционных рисков ФЭМ БГЭУ..."
                    />
                  </div>
                )}

                {profile.isGuest ? (
                  <div className="bg-indigo-50 border border-indigo-150 p-4 rounded-xl text-center space-y-2.5">
                    <p className="text-[11px] leading-relaxed text-indigo-950 font-bold">
                      Вход в ознакомительном режиме
                    </p>
                    <p className="text-[10px] sm:text-[11px] leading-relaxed text-slate-500 font-medium">
                      Подача заявок на научные мероприятия доступна только авторизованным исследователям СНО ФЭМ. Регистрация займет менее минуты!
                    </p>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-blue-900 hover:bg-blue-850 text-white text-xs sm:text-sm font-bold py-3 transition-colors shadow-md shadow-blue-900/10 cursor-pointer text-center"
                  >
                    Подтвердить запись
                  </button>
                )}
              </form>
            </div>
          ) : (
            /* CONFIGURED REGISTERED TICKET */
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-5 sm:p-6 space-y-5 text-center relative overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-400 absolute top-0 left-0 right-0"></div>

              <div className="pt-3 flex flex-col items-center">
                <div className="h-10 w-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-2">
                  <Check className="h-6 w-6 stroke-[3px]" />
                </div>
                <h4 className="font-sans text-xs sm:text-sm font-extrabold text-slate-900 uppercase">
                  Вы успешно записаны!
                </h4>
                <p className="text-[10px] text-slate-400 font-medium">Ваш легитимный билет в системе БГЭУ СНО</p>
              </div>

              {currentRegistrationTicket && (
                <div className="space-y-4">
                  {/* Detailed summary */}
                  <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-2xl text-left text-xs font-sans space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Событие:</span>
                      <span className="font-bold text-slate-800 truncate max-w-[140px]">{currentRegistrationTicket.eventTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">ФИО:</span>
                      <span className="font-bold text-slate-800 uppercase">{currentRegistrationTicket.studentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Роль:</span>
                      <span className="font-extrabold text-indigo-800 uppercase text-[10px] bg-indigo-50 border border-indigo-100 px-1 rounded">
                        {currentRegistrationTicket.role === 'speaker' ? 'Докладчик' : 'Слушатель'}
                      </span>
                    </div>
                    {currentRegistrationTicket.paperTitle && (
                      <div className="mt-1.5 p-2 bg-amber-50 border border-amber-100 rounded-lg">
                        <span className="text-[9px] uppercase font-bold text-amber-700 block mb-0.5">Доклад:</span>
                        <p className="text-[10px] leading-tight text-slate-700 italic">«{currentRegistrationTicket.paperTitle}»</p>
                      </div>
                    )}
                  </div>

                  {/* QR Core Simulator Block */}
                  <div className="bg-slate-900 border border-slate-700/60 shadow-inner rounded-2xl p-4 flex flex-col items-center">
                    <div className="h-28 w-28 bg-white flex flex-col p-2 select-none rounded-xl relative">
                      {/* Grid Simulator QR */}
                      <div className="grid grid-cols-5 gap-1.5 w-full h-full bg-slate-100 border border-slate-200 p-1">
                        <div className="bg-slate-900 pointer-events-none"></div>
                        <div className="bg-slate-900 pointer-events-none"></div>
                        <div className="bg-transparent pointer-events-none"></div>
                        <div className="bg-slate-900 pointer-events-none"></div>
                        <div className="bg-slate-900 pointer-events-none"></div>
                        <div className="bg-slate-900 pointer-events-none"></div>
                        <div className="bg-transparent pointer-events-none"></div>
                        <div className="bg-slate-900 pointer-events-none"></div>
                        <div className="bg-transparent pointer-events-none"></div>
                        <div className="bg-slate-900 pointer-events-none"></div>
                        <div className="bg-transparent pointer-events-none"></div>
                        <div className="bg-slate-900 pointer-events-none"></div>
                        <div className="bg-slate-900 pointer-events-none"></div>
                        <div className="bg-slate-900 pointer-events-none"></div>
                        <div className="bg-transparent pointer-events-none"></div>
                        <div className="bg-slate-900 pointer-events-none"></div>
                        <div className="bg-transparent pointer-events-none"></div>
                        <div className="bg-slate-900 pointer-events-none"></div>
                        <div className="bg-transparent pointer-events-none"></div>
                        <div className="bg-slate-900 pointer-events-none"></div>
                        <div className="bg-slate-900 pointer-events-none"></div>
                        <div className="bg-slate-900 pointer-events-none"></div>
                        <div className="bg-transparent pointer-events-none"></div>
                        <div className="bg-slate-900 pointer-events-none"></div>
                        <div className="bg-slate-900 pointer-events-none"></div>
                      </div>
                    </div>

                    <span className="text-[9px] font-mono font-medium text-slate-300 mt-2 block select-all">
                      {currentRegistrationTicket.qrCodeValue}
                    </span>
                  </div>

                  {/* Actions summary cancel/print */}
                  <div className="flex gap-2 text-xs pt-1">
                    <button
                      onClick={() => window.print()}
                      className="flex-1 flex items-center justify-center space-x-1 border border-slate-200 hover:bg-slate-50 font-bold p-2.5 rounded-xl text-[11px] transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Скачать билет</span>
                    </button>

                    <button
                      onClick={() => onCancelRegistration(currentRegistrationTicket.id)}
                      className="flex-1 flex items-center justify-center space-x-1 border border-red-200 text-red-650 hover:bg-red-50 font-bold p-2.5 rounded-xl text-[11px] transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Отменить запись</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
