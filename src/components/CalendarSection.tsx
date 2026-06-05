import { useState, FormEvent } from 'react';
import { Calendar, MapPin, Users, Award, FileText, Check, AlertCircle, Sparkles, BookOpen, Trash2, ShieldCheck } from 'lucide-react';
import { ScienceEvent, EventRegistration, StudentProfile } from '../types';
import EventDetailPage from './EventDetailPage';

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

  if (selectedEvent) {
    return (
      <EventDetailPage
        event={selectedEvent}
        registrations={registrations}
        profile={profile}
        onRegisterEvent={onRegisterEvent}
        onCancelRegistration={onCancelRegistration}
        onBack={() => {
          setSelectedEvent(null);
          setSuccessInfo(null);
        }}
      />
    );
  }

  const handleOpenRegistration = (event: ScienceEvent) => {
    window.location.hash = `#/event/${event.id}`;
  };

  const handleRegisterSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!studentName.trim()) {
      setFormError('Пожалуйста, введите ФИО');
      return;
    }
    if (!studentGroup.trim()) {
      setFormError('Пожалуйста, укажите учебную группу');
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

                  <h3 
                    onClick={() => handleOpenRegistration(event)}
                    className="font-sans text-base sm:text-lg font-bold text-slate-900 leading-snug cursor-pointer hover:text-blue-900 hover:underline transition-all"
                  >
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
    </div>
  );
}
