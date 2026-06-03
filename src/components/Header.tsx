import { BookOpen, Calendar, Award, ShoppingBag, User, GraduationCap, Sparkles, Trophy, ShieldCheck, Server, LogOut, Shield } from 'lucide-react';
import { StudentProfile } from '../types';
import { useFirebase } from '../context/FirebaseContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: StudentProfile & { role?: 'student' | 'sno_activist' };
  onOpenSimulator: () => void;
  onLogout: () => void;
  isLoggedIn: boolean;
}

export default function Header({ activeTab, setActiveTab, profile, onOpenSimulator, onLogout, isLoggedIn }: HeaderProps) {
  const { isSandboxActive } = useFirebase();
  // Common tabs visible to everyone
  const tabs = [
    { id: 'news', label: 'Новости СНО', icon: BookOpen },
    { id: 'calendar', label: 'Календарь событий', icon: Calendar },
    { id: 'quiz', label: 'Викторины', icon: Award },
    { id: 'store', label: 'Обмен баллов', icon: ShoppingBag },
    { id: 'timeline', label: 'Достижения', icon: Trophy },
    { id: 'verify', label: 'Реестр и Верификация', icon: ShieldCheck },
  ];

  // Organizer tab if they are SNO activist
  if (isLoggedIn && profile.role === 'sno_activist') {
    tabs.push({ id: 'sno_active', label: 'Актив СНО', icon: Server });
    tabs.push({ id: 'admin_dashboard', label: 'Админ-Панель', icon: Shield });
  }

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
                <span className="hidden sm:inline-block text-[8px] font-bold px-1.5 py-px rounded bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wide">
                  Песочница
                </span>
              )}
            </div>
            <p className="hidden sm:block md:hidden xl:block text-[9px] font-medium text-slate-500 uppercase tracking-widest leading-none">
              научное общество студентов
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        {isLoggedIn && (
          <nav className="hidden lg:flex space-x-0.5 xl:space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 lg:space-x-2 px-2 py-1.5 lg:px-3 lg:py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 xl:h-4 xl:w-4 shrink-0" />
                  <span className="truncate max-w-[80px] xl:max-w-none">{tab.label}</span>
                </button>
              );
            })}
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

          {/* Quick Config Button for Simulator */}
          <button
            onClick={onOpenSimulator}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-dashed border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors shrink-0"
            title="Панель Симуляции"
          >
            <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
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
