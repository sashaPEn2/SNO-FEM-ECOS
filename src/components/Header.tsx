import { useState } from 'react';
import { BookOpen, Calendar, Award, ShoppingBag, User, GraduationCap, Sparkles, Trophy, ShieldCheck, Server, LogOut, Shield, Bell, Trash, Check, AlertCircle, ChevronDown, HelpCircle } from 'lucide-react';
import { StudentProfile } from '../types';
import { useFirebase } from '../context/FirebaseContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: StudentProfile & { role?: 'student' | 'sno_activist' };
  onLogout: () => void;
  isLoggedIn: boolean;
}

export default function Header({ activeTab, setActiveTab, profile, onLogout, isLoggedIn }: HeaderProps) {
  const { isSandboxActive, setIsSandboxActive, notifications, markNotificationAsRead, clearNotifications } = useFirebase();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Common tabs visible to everyone
  const tabs = [
    { id: 'profile', label: 'Профиль', icon: User },
    { id: 'news', label: 'Новости СНО', icon: BookOpen },
    { id: 'calendar', label: 'Календарь событий', icon: Calendar },
    { id: 'quiz', label: 'Викторины', icon: Award },
    { id: 'timeline', label: 'Достижения', icon: Trophy },
    { id: 'faq', label: 'FAQ / Помощь', icon: HelpCircle },
  ];

  // Organizer tab if they are SNO activist
  if (isLoggedIn && profile.role === 'sno_activist') {
    tabs.push({ id: 'sno_active', label: 'Актив СНО', icon: Server });
    tabs.push({ id: 'admin_dashboard', label: 'Админ-Панель', icon: Shield });
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo / Branding */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-blue-900 text-white shadow-md shadow-blue-900/20 shrink-0">
            <GraduationCap className="h-4 w-4 sm:h-6 sm:w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <span className="font-sans text-xs sm:text-sm md:text-sm lg:text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap">
                СНО ФЭМ
              </span>
              <span className="text-[9px] sm:text-xs font-semibold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 uppercase">
                БГЭУ
              </span>
              {isSandboxActive && (
                <button
                  onClick={() => setIsSandboxActive(false)}
                  className="hidden sm:inline-block text-[8px] font-bold px-1.5 py-px rounded bg-amber-105 text-amber-800 border border-amber-200 hover:bg-amber-200 uppercase tracking-wide cursor-pointer transition-colors"
                  title="Нажмите, чтобы вернуться в Облачный режим"
                >
                  Песочница ✖
                </button>
              )}
            </div>
            <p className="hidden sm:block md:hidden xl:block text-[9px] font-medium text-slate-500 uppercase tracking-widest leading-none">
              научное общество студентов
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        {isLoggedIn && (
          <nav className="hidden lg:flex items-center space-x-1">
            {/* Direct Links to Core Sections */}
            <div className="flex items-center space-x-1 border-r border-slate-100 pr-2 mr-2">
              {[
                { id: 'profile', label: 'Личный кабинет', icon: User },
                { id: 'news', label: 'Новости СНО', icon: BookOpen },
                { id: 'calendar', label: 'Календарь', icon: Calendar },
                { id: 'quiz', label: 'Викторины', icon: Award },
                { id: 'timeline', label: 'Достижения', icon: Trophy },
                { id: 'faq', label: 'FAQ', icon: HelpCircle },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-900 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dropdown 3: Organizer Panel (Activists only) */}
            {profile.role === 'sno_activist' && (
              <div className="relative group/dropdown">
                <button
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    ['sno_active', 'admin_dashboard'].includes(activeTab)
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-100/60'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Shield className="h-4 w-4 text-emerald-600" />
                  <span>Панель СНО</span>
                  <ChevronDown className="h-3 w-3 text-slate-400 group-hover/dropdown:rotate-180 transition-transform animate-pulse" />
                </button>
                
                <div className="absolute right-0 mt-1.5 w-60 bg-white border border-slate-200/90 shadow-xl rounded-2xl p-2 hidden group-hover/dropdown:block animate-fade-in z-50">
                  {[
                    { id: 'sno_active', label: 'Актив СНО', desc: 'Управление викторинами, начисление баллов', icon: Server },
                    { id: 'admin_dashboard', label: 'Администратор', desc: 'Утверждение профилей БГЭУ, выгрузки БД', icon: Shield },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full text-left flex items-start gap-2.5 p-2 rounded-xl text-xs transition-all cursor-pointer ${
                          isActive
                            ? 'bg-emerald-900 text-white shadow-sm'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${isActive ? 'text-white' : 'text-emerald-700'}`} />
                        <div className="flex flex-col">
                          <span className="font-bold">{item.label}</span>
                          <span className={`text-[10px] leading-snug mt-0.5 ${isActive ? 'text-emerald-100' : 'text-slate-405'}`}>{item.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </nav>
        )}

        {/* Student Profile Info */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          {isLoggedIn ? (
            <div className="flex items-center space-x-1.5 lg:space-x-2.5 bg-slate-50 border border-slate-100 rounded-2xl p-1 lg:p-1.5 pr-2.5 pl-2 lg:pr-4 lg:pl-3.5 shadow-sm">
              <div className="text-right">
                <p className="text-[11px] lg:text-xs font-semibold text-slate-900 truncate max-w-[50px] sm:max-w-[100px] md:max-w-[45px] lg:max-w-[120px]">
                  {profile.name}
                </p>
                <div className="flex items-center space-x-1 justify-end">
                  <span className="text-[9px] lg:text-[10px] text-slate-500 font-mono">
                    {profile.group} гр.
                  </span>
                  <span className={`h-1 lg:h-1.5 w-1 lg:w-1.5 rounded-full ${profile.role === 'sno_activist' ? 'bg-indigo-600' : 'bg-emerald-500'}`}></span>
                </div>
              </div>

              <div className="h-6 lg:h-8 w-px bg-slate-200"></div>

              {/* Points Balance */}
              <div className="flex flex-col items-center">
                <span className="text-[8px] lg:text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                  Баллы
                </span>
                <div className="flex items-center text-amber-600 font-mono font-bold text-xs lg:text-sm">
                  <Sparkles className="h-2.5 w-2.5 lg:h-3 lg:w-3 mr-0.5 lg:mr-1 self-center animate-pulse" />
                  <span>{profile.points}</span>
                </div>
              </div>

              <div className="h-6 lg:h-8 w-px bg-slate-200"></div>

              {/* Logout button */}
              <button
                onClick={onLogout}
                className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                title="Выйти"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Вход
            </div>
          )}

          {/* SNO Feed Notifications Bell */}
          {isLoggedIn && (
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-755 hover:bg-slate-100 transition-colors shrink-0 relative cursor-pointer"
                title="Уведомления"
              >
                <Bell className="h-4 w-4 text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full bg-rose-500 text-white text-[9px] font-bold font-sans animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown list */}
              {isNotifOpen && (
                <div className="absolute right-0 top-11 w-80 max-h-96 sm:w-96 bg-white border border-slate-200 shadow-xl rounded-2xl p-4 z-50 overflow-hidden flex flex-col space-y-3 animate-fade-in text-left">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Bell className="h-3.5 w-3.5 text-blue-900" />
                      <span>Уведомления СНО</span>
                    </h3>
                    {notifications.length > 0 && (
                      <button
                        onClick={() => { clearNotifications(); setIsNotifOpen(false); }}
                        className="text-[10px] text-slate-550 hover:text-rose-600 font-bold uppercase cursor-pointer flex items-center gap-1 bg-none border-none"
                      >
                        <Trash className="h-3 w-3" />
                        Очистить все
                      </button>
                    )}
                  </div>

                  <div className="overflow-y-auto space-y-2 flex-1 max-h-72 pr-1 select-text">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-455 text-xs flex flex-col items-center justify-center space-y-1">
                        <AlertCircle className="h-6 w-6 text-slate-300" />
                        <p className="font-bold text-slate-700">Уведомлений пока нет</p>
                        <p className="text-[10px] text-slate-400">Мы пришлем оповещения о новостях и приближении мероприятий!</p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationAsRead(notif.id)}
                          className={`p-3 rounded-xl border text-xs transition-colors cursor-pointer flex flex-col space-y-1 relative group ${
                            notif.read
                              ? 'bg-slate-50/50 border-slate-150 text-slate-500'
                              : 'bg-indigo-50/20 border-indigo-100/50 text-slate-900 hover:bg-indigo-50/40'
                          }`}
                        >
                          {!notif.read && (
                            <span className="absolute top-3 right-3 h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
                          )}
                          <div className="flex items-start justify-between">
                            <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                              notif.type === 'news' ? 'bg-blue-100 text-blue-800' :
                              notif.type === 'event' ? 'bg-amber-100 text-amber-800' :
                              notif.type === 'status_change' ? 'bg-purple-100 text-purple-800' :
                              notif.type === 'reminder' ? 'bg-rose-100 text-rose-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {notif.type === 'news' ? 'Новость' :
                               notif.type === 'event' ? 'Событие' :
                               notif.type === 'status_change' ? 'Статус' :
                               notif.type === 'reminder' ? 'Напоминание' :
                               notif.type === 'registration' ? 'Заявка' : 'СНО'}
                            </span>
                            <span className="text-[9px] text-slate-400 font-sans">{notif.date.split(' ')[0]}</span>
                          </div>
                          
                          <p className="font-bold text-slate-900 pr-3">{notif.title}</p>
                          <p className="text-[11px] text-slate-550 leading-relaxed font-sans">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Mobile navigation tab-bar */}
      {isLoggedIn && (
        <div className="flex lg:hidden border-t border-slate-100 bg-white justify-start md:justify-center items-center space-x-1.5 py-1.5 px-3 overflow-x-auto w-full max-w-full shrink-0 select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center space-y-0.5 px-3 py-1 rounded-xl text-[10px] font-medium transition-all shrink-0 ${
                  isActive
                    ? 'text-blue-900 font-semibold bg-slate-50'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-blue-900 scale-105' : 'text-slate-600'}`} />
                <span className="text-[9px] truncate max-w-[70px]">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
