import { useState, FormEvent } from 'react';
import { User, Sparkles, RefreshCw, Layers, Check, Trophy, BookOpen, AlertCircle, X } from 'lucide-react';
import { StudentProfile } from '../types';

interface AdminSimulatorProps {
  profile: StudentProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProfile: (updated: Partial<StudentProfile>) => void;
  onResetAllData: () => void;
  onAddPoints: (points: number, reason: string) => void;
}

export default function AdminSimulator({
  profile,
  isOpen,
  onClose,
  onUpdateProfile,
  onResetAllData,
  onAddPoints,
}: AdminSimulatorProps) {
  const [name, setName] = useState(profile.name);
  const [group, setGroup] = useState(profile.group);
  const [course, setCourse] = useState(profile.course);
  const [pointsVal, setPointsVal] = useState<number>(profile.points);

  if (!isOpen) return null;

  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name,
      group,
      course,
      points: pointsVal,
    });
    onClose();
  };

  const handleSimulateActivity = (points: number, description: string) => {
    onAddPoints(points, description);
    setPointsVal(prev => prev + points);
    alert(`Симуляция: ${description}\n\nБаланс пополнен на +${points} научных баллов СНО!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/40 backdrop-blur-sm animate-fade-in">
      <div className="h-full w-full max-w-sm border-l border-slate-200 bg-white shadow-2xl flex flex-col justify-between block font-sans">
        
        {/* Header toolbar */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <Layers className="h-5 w-5 text-blue-900" />
            <div>
              <h3 className="font-sans text-sm font-bold text-slate-900">
                Панель Симуляции СНО
              </h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-none mt-0.5">
                тестирование системы баллов
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-650 p-1.5 rounded-lg transition-colors"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* Quick instructions alert */}
          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-start gap-2 text-slate-600 font-sans">
            <AlertCircle className="h-4 w-4 text-blue-700 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Эта панель позволяет изменять профиль студента и начислять баллы СНО для мгновенного тестирования покупки справки-освобождения (стоит 150 баллов).
            </p>
          </div>

          {/* Form editing profile details */}
          <form onSubmit={handleSaveProfile} className="space-y-3.5 border-t border-slate-100 pt-4">
            <h4 className="font-sans font-bold text-slate-800 uppercase tracking-wide text-[10px]">
              Профиль Текущего Студента
            </h4>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">ФИО Студента:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-900 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Группа ФЭМ:</label>
                <input
                  type="text"
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-900 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Курс:</label>
                <select
                  value={course}
                  onChange={(e) => setCourse(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-900 focus:outline-none"
                >
                  <option value={1}>1 курс</option>
                  <option value={2}>2 курс</option>
                  <option value={3}>3 курс</option>
                  <option value={4}>4 курс</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Научные баллы:</label>
              <input
                type="number"
                value={pointsVal}
                onChange={(e) => setPointsVal(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-900 focus:outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold py-1.5 text-xs transition-colors"
            >
              Сохранить профиль
            </button>
          </form>

          {/* Simulate Scientific Activity */}
          <div className="space-y-3 border-t border-slate-100 pt-4">
            <h4 className="font-sans font-bold text-slate-800 uppercase tracking-wide text-[10px]">
              Быстрое Начисление Баллов за Науку
            </h4>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleSimulateActivity(100, 'Публикация научной статьи в сборнике БГЭУ')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-left font-sans"
              >
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <span className="font-semibold block text-[11px] leading-tight text-slate-800">Научная Публикация в РИНЦ</span>
                    <span className="text-[9px] text-slate-400">Написание тезисов</span>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono text-emerald-600">+100 баллов</span>
              </button>

              <button
                type="button"
                onClick={() => handleSimulateActivity(120, 'Победа на Республиканской олимпиаде БГЭУ')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-left font-sans"
              >
                <div className="flex items-center space-x-2">
                  <Trophy className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  <div>
                    <span className="font-semibold block text-[11px] leading-tight text-slate-800">Победа в Олимпиаде ФЭМ</span>
                    <span className="text-[9px] text-slate-400">По бизнес-аналитике</span>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono text-amber-600">+120 баллов</span>
              </button>

              <button
                type="button"
                onClick={() => handleSimulateActivity(30, 'Посещение научного семинара СНО ФЭМ')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-left font-sans"
              >
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <div>
                    <span className="font-semibold block text-[11px] leading-tight text-slate-800">Слушатель семинара</span>
                    <span className="text-[9px] text-slate-400 font-sans">Участие в дискуссиях</span>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono text-blue-600">+30 баллов</span>
              </button>
            </div>
          </div>

          {/* Total reset parameter */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <h4 className="font-sans font-bold text-slate-800 uppercase tracking-wide text-[10px] text-red-650">
              Сброс Данных
            </h4>
            <button
              type="button"
              onClick={() => {
                if (confirm('Внимание! Все ваши записи, баллы и оформленные справки будут стерты и сброшены к начальным. Продолжить?')) {
                  onResetAllData();
                  onClose();
                }
              }}
              className="w-full flex items-center justify-center space-x-2 text-xs font-bold text-red-600 border border-red-200 p-2.5 rounded-xl bg-red-50/50 hover:bg-red-100 hover:text-red-700 transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Очистить кэш & сбросить данные</span>
            </button>
          </div>

        </div>

        {/* Footer info lock */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 font-medium text-center font-mono">
          BSEU SSN Sandbox Admin Tools v1.1
        </div>

      </div>
    </div>
  );
}
