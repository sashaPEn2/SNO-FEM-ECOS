import { useState, FormEvent } from 'react';
import { Calendar, MapPin, Users, Award, FileText, Check, AlertCircle, Sparkles, BookOpen, Trash2, ShieldCheck } from 'lucide-react';
import { ScienceEvent, EventRegistration, StudentProfile } from '../types';

interface CalendarSectionProps {
  events: ScienceEvent[];
  registrations: EventRegistration[];
  profile: StudentProfile;
  onRegisterEvent: (registration: Omit<EventRegistration, 'id' | 'registrationDate' | 'qrCodeValue'>) => void;
  onCancelRegistration: (id: string) => void;
}

export default function CalendarSection({
  events,
  registrations,
  profile,
  onRegisterEvent,
  onCancelRegistration,
}: CalendarSectionProps) {
  const [selectedEvent, setSelectedEvent] = useState<ScienceEvent | null>(null);
  const [activeTab, setActiveTab] = useState<'events' | 'my-tickets'>('events');

  // Form states
  const [studentName, setStudentName] = useState(profile.name);
  const [studentGroup, setStudentGroup] = useState(profile.group);
  const [role, setRole] = useState<'speaker' | 'listener'>('listener');
  const [paperTitle, setPaperTitle] = useState('');
  const [formError, setFormError] = useState('');
  const [successInfo, setSuccessInfo] = useState<EventRegistration | null>(null);

  const handleOpenRegistration = (event: ScienceEvent) => {
    setSelectedEvent(event);
    setStudentName(profile.name);
    setStudentGroup(profile.group);
    setRole('listener');
    setPaperTitle('');
    setFormError('');
    setSuccessInfo(null);
  };

  const handleRegisterSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!studentName.trim()) {
      setFormError('Пожалуйста, введите ФИО');
      return;
    }
    if (!studentGroup.trim()) {
      setFormError('Пожалуйста, укажите академическую группу');
      return;
    }
    if (role === 'speaker' && !paperTitle.trim()) {
      setFormError('Докладчикам обязательно нужно указать тему научного доклада (тезисов)');
      return;
    }

    if (!selectedEvent) return;

    // Check if progress duplicates
    const isAlreadyRegistered = registrations.some(
      r => r.eventId === selectedEvent.id && r.studentName.toLowerCase() === studentName.toLowerCase()
    );

    if (isAlreadyRegistered) {
      setFormError('Вы уже зарегистрировали участие на это мероприятие под этим именем!');
      return;
    }

    // Call callback to parent state
    onRegisterEvent({
      eventId: selectedEvent.id,
      eventTitle: selectedEvent.title,
      eventDate: selectedEvent.date,
      studentName,
      studentGroup,
      role,
      paperTitle: role === 'speaker' ? paperTitle : undefined,
    });

    // Extract newly registered ticket
    const qrCodeMock = `BSEU-FEM-CONF-${selectedEvent.id}-${Date.now().toString().slice(-4)}`;
    const newReg: EventRegistration = {
      id: Math.random().toString(),
      eventId: selectedEvent.id,
      eventTitle: selectedEvent.title,
      eventDate: selectedEvent.date,
      studentName,
      studentGroup,
      role,
      paperTitle: role === 'speaker' ? paperTitle : undefined,
      registrationDate: new Date().toLocaleDateString(),
      qrCodeValue: qrCodeMock,
    };

    setSuccessInfo(newReg);
    setFormError('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-sans tracking-tight">
            Календарь Научных Событий ФЭМ
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-sans">
            Регистрируйся на научные конференции, семинары и хакатоны. Зарабатывай баллы за активность!
          </p>
        </div>

        {/* Sub-navigation buttons */}
        <div className="flex bg-slate-50 border border-slate-100 p-1 rounded-xl self-start">
          <button
            onClick={() => { setActiveTab('events'); setSuccessInfo(null); setSelectedEvent(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all ${
              activeTab === 'events'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Предстоящие события ({events.length})
          </button>
          <button
            onClick={() => { setActiveTab('my-tickets'); setSuccessInfo(null); setSelectedEvent(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all relative ${
              activeTab === 'my-tickets'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Мои записи ({registrations.length})
            {registrations.length > 0 && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'events' && (
        <div className="space-y-4">
          {events.map((event) => {
            const isStudentRegistered = registrations.some(r => r.eventId === event.id);

            return (
              <div
                key={event.id}
                className="flex flex-col lg:flex-row gap-5 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-slate-300 hover:shadow-md transition-all duration-300"
              >
                {/* Date highlight box (Visual element) */}
                <div className="flex flex-row lg:flex-col items-center justify-center lg:w-28 flex-shrink-0 bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
                  <div className="text-blue-900 font-bold text-2xl lg:text-3xl leading-none">
                    {new Date(event.date).getDate()}
                  </div>
                  <div className="text-blue-700 font-semibold text-xs uppercase tracking-wider ml-2 lg:ml-0 lg:mt-1 font-mono">
                    {new Date(event.date).toLocaleDateString('ru-RU', { month: 'short' })}
                  </div>
                  <div className="text-slate-500 text-[10px] font-mono ml-auto lg:ml-0 lg:mt-2">
                    {event.time}
                  </div>
                </div>

                {/* Event text info */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center space-x-1 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 border border-amber-100">
                      <Sparkles className="h-3 w-3 mr-0.5" />
                      Докладчик: +{event.pointsForSpeaker} баллов
                    </span>
                    <span className="inline-flex items-center space-x-1 rounded-full bg-slate-50 text-slate-700 font-semibold text-[10px] uppercase tracking-wider px-2 py-0.5 border border-slate-200">
                      Слушатель: +{event.pointsForListener} баллов
                    </span>
                  </div>

                  <h3 className="font-sans text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {event.title}
                  </h3>

                  <p className="font-sans text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1.5 text-xs text-slate-450 font-medium">
                    <div className="flex items-center space-x-2 text-slate-600">
                      <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-600">
                      <Users className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <span>Уже записано: <b>{event.registeredCount} чел.</b></span>
                    </div>
                  </div>

                  {event.requirements && (
                    <div className="text-[11px] font-sans bg-slate-50 border border-slate-100 p-2 text-slate-500 flex items-start gap-1.5 rounded-lg border-l-2 border-l-orange-300">
                      <AlertCircle className="h-3.5 w-3.5 text-orange-400 flex-shrink-0 mt-0.5" />
                      <span>{event.requirements}</span>
                    </div>
                  )}
                </div>

                {/* Action registration trigger */}
                <div className="flex items-center lg:justify-center border-t lg:border-t-0 lg:border-l border-slate-100 pt-3 lg:pt-0 lg:pl-5 flex-shrink-0">
                  {isStudentRegistered ? (
                    <div className="w-full text-center space-y-2">
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold w-full justify-center">
                        <Check className="h-4 w-4" />
                        <span>Вы записаны</span>
                      </span>
                      <button
                        onClick={() => { setActiveTab('my-tickets'); }}
                        className="text-[10px] text-blue-900 font-bold hover:underline"
                      >
                        Посмотреть билет
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenRegistration(event)}
                      className="w-full lg:w-36 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs sm:text-sm font-bold py-2.5 px-4 transition-colors shadow-sm"
                    >
                      Зарегистрироваться
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'my-tickets' && (
        <div className="space-y-6">
          {registrations.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-3xl bg-slate-50 space-y-3">
              <Calendar className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-slate-500 text-sm font-medium">
                У вас пока нет активных записей на научные события ФЭМ.
              </p>
              <button
                onClick={() => setActiveTab('events')}
                className="text-xs font-bold text-blue-900 hover:underline"
              >
                Посмотреть календарь событий
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {registrations.map((ticket) => (
                <div
                  key={ticket.id}
                  className="relative overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-md flex flex-col justify-between"
                >
                  {/* Styling top decorative bar */}
                  <div className="h-2 bg-gradient-to-r from-blue-900 to-indigo-700"></div>

                  <div className="p-5 space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className={`inline-block text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md ${
                          ticket.role === 'speaker'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {ticket.role === 'speaker' ? 'Докладчик' : 'Слушатель'}
                        </span>
                        <h4 className="font-sans text-sm sm:text-base font-bold text-slate-900 mt-1 pb-1 line-clamp-2">
                          {ticket.eventTitle}
                        </h4>
                      </div>

                      {/* Barcode/QR visualization mock */}
                      <div className="h-12 w-12 bg-slate-100 flex-shrink-0 border border-slate-200 rounded-lg flex flex-col items-center justify-center p-1" title={ticket.qrCodeValue}>
                        <div className="grid grid-cols-3 gap-0.5 w-full h-full opacity-70">
                          <div className="bg-slate-800"></div>
                          <div className="bg-transparent"></div>
                          <div className="bg-slate-800"></div>
                          <div className="bg-slate-800"></div>
                          <div className="bg-slate-800"></div>
                          <div className="bg-slate-800"></div>
                          <div className="bg-slate-800"></div>
                          <div className="bg-transparent"></div>
                          <div className="bg-slate-800"></div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 font-sans border-t border-slate-50 pt-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Студент:</span>
                        <span className="font-semibold text-slate-800">{ticket.studentName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Группа:</span>
                        <span className="font-mono">{ticket.studentGroup}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Дата события:</span>
                        <span className="font-semibold">{ticket.eventDate}</span>
                      </div>
                      {ticket.paperTitle && (
                        <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded-lg">
                          <span className="text-[10px] text-amber-700 font-bold block uppercase leading-none mb-1">
                            Тема научного доклада:
                          </span>
                          <span className="text-[11px] text-slate-700 italic font-medium leading-tight">
                            «{ticket.paperTitle}»
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Exemption alert */}
                    <div className="flex items-center gap-2 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/50 text-[10px] text-slate-600">
                      <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span>
                        Справка СНО формируется автоматически при подтверждении участия организатором.
                      </span>
                    </div>
                  </div>

                  {/* Cancel ticket bar */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border-t border-slate-100">
                    <span className="text-[10px] font-mono text-slate-400">
                      ID: {ticket.qrCodeValue}
                    </span>
                    <button
                      onClick={() => onCancelRegistration(ticket.id)}
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors flex items-center space-x-1"
                      title="Аннулировать регистрацию"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold">Отменить</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Registration popup modal form */}
      {selectedEvent && !successInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 flex flex-col">
            <div className="p-6 bg-blue-950 text-white">
              <span className="inline-block text-[10px] uppercase font-bold text-blue-300 tracking-wider">
                Оформление регистрации
              </span>
              <h3 className="text-lg font-bold truncate mt-1">
                {selectedEvent.title}
              </h3>
              <p className="text-xs text-blue-100 mt-1">
                {selectedEvent.date} в {selectedEvent.time} | {selectedEvent.location}
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-150 rounded-xl flex items-center gap-2 text-xs text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block">
                  ФИО Участника:
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-900 focus:outline-none"
                  placeholder="Иванов Иван Иванович"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block">
                    Академическая группа:
                  </label>
                  <input
                    type="text"
                    required
                    value={studentGroup}
                    onChange={(e) => setStudentGroup(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-900 focus:outline-none"
                    placeholder="ДНЗ-1"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block">
                    Положение студента:
                  </label>
                  <div className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-sm text-slate-600 font-semibold text-center">
                    {profile.course}-й курс ФЭМ
                  </div>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block">
                  Формат научного участия:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('listener')}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      role === 'listener'
                        ? 'border-blue-900 bg-blue-50/50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-800 block">Слушатель</span>
                    <span className="text-[10px] text-slate-500 mt-1">
                      Очное присутствие, ведение научных дискуссий.
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 mt-2 block">
                      +{selectedEvent.pointsForListener} баллов СНО
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setRole('speaker'); setPaperTitle(''); }}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      role === 'speaker'
                        ? 'border-blue-900 bg-blue-50/50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-800 block">Докладчик</span>
                    <span className="text-[10px] text-slate-500 mt-1">
                      Публикация тезисов в РИНЦ сборнике БГЭУ.
                    </span>
                    <span className="text-[10px] font-bold text-amber-600 mt-2 block">
                      +{selectedEvent.pointsForSpeaker} баллов СНО
                    </span>
                  </button>
                </div>
              </div>

              {role === 'speaker' && (
                <div className="space-y-1 border-t border-slate-200 pt-3 animate-fade-in">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block flex items-center justify-between">
                    <span>Тема научного доклада:</span>
                    <span className="text-[10px] text-amber-600 font-bold">Обязательно</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={paperTitle}
                    onChange={(e) => setPaperTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-900 focus:outline-none placeholder-slate-400"
                    placeholder="Например: 'Перспективы развития циркулярной экономики в Республике Беларусь'"
                  />
                  <span className="text-[10px] text-slate-400 leading-tight block">
                    Окончательная тема тезисов будет согласована с вашим научным руководителем при верификации.
                  </span>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-900 px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-blue-850 transition-colors shadow-md shadow-blue-900/10"
                >
                  Зарегистрироваться
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success slip popup on successful registration */}
      {successInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 flex flex-col text-center">
            <div className="p-6 bg-gradient-to-br from-emerald-600 to-teal-500 text-white flex flex-col items-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <Check className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-lg font-extrabold font-sans">
                Регистрация успешна!
              </h3>
              <p className="text-xs text-emerald-50 max-w-[280px]">
                Ваше участие зарегистрировано сотрудником СНО ФЭМ БГЭУ.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs text-left text-slate-600 font-sans">
                <div>
                  <span className="text-slate-400">Событие:</span>
                  <p className="font-semibold text-slate-800 leading-tight">{successInfo.eventTitle}</p>
                </div>
                <div className="flex justify-between border-t border-slate-100/60 pt-1.5 mt-1.5">
                  <span className="text-slate-400">Роль:</span>
                  <span className="font-bold text-blue-900 uppercase">
                    {successInfo.role === 'speaker' ? 'Докладчик' : 'Слушатель'}
                  </span>
                </div>
                {successInfo.paperTitle && (
                  <div className="border-t border-slate-100/60 pt-1.5 mt-1.5 bg-amber-50/50 p-2 rounded-lg">
                    <span className="text-slate-400 block mb-0.5 text-[10px]">Тема:</span>
                    <p className="text-[11px] text-slate-800 leading-tight italic">«{successInfo.paperTitle}»</p>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 border border-slate-100 border-dashed rounded-xl p-3 flex flex-col items-center">
                {/* Visual QR Simulator */}
                <div className="h-24 w-24 bg-slate-900 flex flex-col p-2 space-y-1 opacity-90 rounded">
                  <div className="text-[8px] font-mono text-emerald-400 text-center uppercase tracking-widest leading-none">
                    BGEU CONF
                  </div>
                  <div className="grid grid-cols-5 gap-1 w-full h-full bg-slate-900 p-1">
                    <div className="bg-white"></div>
                    <div className="bg-white"></div>
                    <div className="bg-slate-900"></div>
                    <div className="bg-white"></div>
                    <div className="bg-white"></div>
                    <div className="bg-white"></div>
                    <div className="bg-slate-900"></div>
                    <div className="bg-white"></div>
                    <div className="bg-slate-900"></div>
                    <div className="bg-white"></div>
                    <div className="bg-slate-900"></div>
                    <div className="bg-white"></div>
                    <div className="bg-white"></div>
                    <div className="bg-white"></div>
                    <div className="bg-slate-900"></div>
                    <div className="bg-white"></div>
                    <div className="bg-slate-900"></div>
                    <div className="bg-white"></div>
                    <div className="bg-slate-900"></div>
                    <div className="bg-white"></div>
                    <div className="bg-white"></div>
                    <div className="bg-white"></div>
                    <div className="bg-slate-900"></div>
                    <div className="bg-white"></div>
                    <div className="bg-white"></div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400 mt-2 block select-all">
                  Код билета: {successInfo.qrCodeValue}
                </span>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSuccessInfo(null);
                    setSelectedEvent(null);
                    setActiveTab('my-tickets');
                  }}
                  className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 text-xs block transition-colors shadow"
                >
                  Перейти в мои билеты
                </button>
                <div className="text-[10px] text-slate-400 font-medium">
                  Сохраните скриншот или покажите QR-код при входе в аудиторию.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
