import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { GraduationCap, ShieldCheck, UserCheck, Lock, Mail, Users, BookOpen, Key, Sparkles, CheckCircle2 } from 'lucide-react';
import { useFirebase } from '../context/FirebaseContext';

interface AuthSectionProps {
  onLogin: (profile: StudentProfile) => void;
  registeredUsers: StudentProfile[];
  onRegister: (newProfile: StudentProfile) => void;
}

export default function AuthSection({ onLogin, registeredUsers, onRegister }: AuthSectionProps) {
  const { login, registerStudent, isSandboxActive, setIsSandboxActive } = useFirebase();
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [group, setGroup] = useState('');
  const [course, setCourse] = useState<number>(3);
  const [studentId, setStudentId] = useState('');
  const [role, setRole] = useState<'student' | 'sno_activist'>('student');
  const [isBudget, setIsBudget] = useState<boolean>(true);
  const [phone, setPhone] = useState('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setSyncMessage('Синхронизация рейтинга СНО ФЭМ БГЭУ...');

    try {
      const userProfile = await login(email, password);
      setSuccess('Авторизация выполнена успешно!');
      setTimeout(() => {
        setIsLoading(false);
        onLogin(userProfile);
      }, 600);
    } catch (err: any) {
      setIsLoading(false);
      let errorMsg = 'Неверный ID/Email студента или пароль. Пожалуйста, проверьте вводимые данные.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMsg = 'Неверный логин или пароль. Проверьте зачетную книжку или зарегистрируйтесь.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !group || !studentId || !email || !password) {
      setError('Пожалуйста, заполните все обязательные поля.');
      return;
    }

    setIsLoading(true);
    setSyncMessage('Регистрация личного кабинета исследователя в облаке...');

    try {
      const newProfile = await registerStudent({
        name: name.trim(),
        course: Number(course),
        group: group.trim(),
        studentId: studentId.trim().toUpperCase(),
        role,
        email: email.trim(),
        isBudget,
        phone: phone.trim() || '+375 (29) 111-22-33'
      }, password);

      onRegister(newProfile);
      setSuccess('Регистрация прошла успешно! Вы будете авторизованы автоматом.');
      setTimeout(() => {
        setIsLoading(false);
        onLogin(newProfile);
      }, 800);
    } catch (err: any) {
      setIsLoading(false);
      let errorMsg = 'Ошибка создания учетной записи в облаке БГЭУ.';
      if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'Студент с таким E-mail адресом уже зарегистрирован в СНО.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950"></div>
      
      {/* Decorative Brand Header */}
      <div className="p-8 text-center bg-slate-50 border-b border-slate-100">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-blue-900 text-white flex items-center justify-center shadow-md shadow-blue-900/20 mb-3">
          <GraduationCap className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Цифровой кабинет СНО ФЭМ
        </h2>
        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">
          БГЭУ • Деканат факультета экономики и менеджмента
        </p>
      </div>

      {/* Mode Switches */}
      <div className="flex border-b border-slate-100 p-2 bg-slate-50/50">
        <button
          type="button"
          onClick={() => { setIsLoginMode(true); setError(''); setSuccess(''); }}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
            isLoginMode 
              ? 'bg-blue-900 text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Вход
        </button>
        <button
          type="button"
          onClick={() => { setIsLoginMode(false); setError(''); setSuccess(''); }}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
            !isLoginMode 
              ? 'bg-blue-900 text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Регистрация
        </button>
      </div>

      <div className="p-6 sm:p-8">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl flex items-center space-x-2 animate-pulse">
            <span>⚠️ {error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm rounded-xl flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {isLoginMode ? (
          /* LOGIN FORM */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                ID Студента или Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="БГЭУ-ФЭМ-30248 или email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-slate-900 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-slate-900 transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-900 text-white rounded-xl font-semibold shadow-md active:scale-95 disabled:opacity-70 transition-all flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span className="text-sm">{syncMessage}</span>
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4" />
                  <span>Авторизоваться по базе СНО</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <span className="text-[10px] text-slate-400 font-medium">
                Первый раз здесь? Выберите вкладку «Регистрация» выше.
              </span>
            </div>
          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegister} className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
            {/* Info Hint about self-registration */}
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-blue-800 leading-relaxed font-medium">
              💡 <b>Самостоятельная регистрация активна!</b> Вы можете указать свою учебную или личную почту и пароль. Данные профиля будут созданы и защищены в вашей базе.
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                ФИО Студента (в именительном падеже) *
              </label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Карабанова Дарья Андреевна"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-slate-900 transition-all text-sm"
                />
              </div>
            </div>

            {/* Academic Group and Course */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Группа (например: ДНЗ-2) *
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="ДНЗ-2"
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-slate-900 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Курс *
                </label>
                <select
                  value={course}
                  onChange={(e) => setCourse(Number(e.target.value))}
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-slate-900 transition-all text-sm"
                >
                  <option value={1}>1 курс</option>
                  <option value={2}>2 курс</option>
                  <option value={3}>3 курс</option>
                  <option value={4}>4 курс</option>
                </select>
              </div>
            </div>

            {/* Student ID / Record Book Number */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Номер зачетной книжки *
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="БГЭУ-ФЭМ-30248"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-slate-900 transition-all text-sm"
                />
              </div>
            </div>

            {/* Funding basis and phone number */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Финансирование
                </label>
                <select
                  value={isBudget ? 'budget' : 'paid'}
                  onChange={(e) => setIsBudget(e.target.value === 'budget')}
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-slate-900 transition-all text-sm"
                >
                  <option value="budget">Бюджет</option>
                  <option value="paid">Платное</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Моб. телефон
                </label>
                <input
                  type="text"
                  placeholder="+375 (29) 123-45-67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-slate-900 text-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                E-mail (для уведомлений СНО) *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="daria@bseu.by"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-slate-900 transition-all text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Пароль счета *
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-slate-900 transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-900 text-white rounded-xl font-semibold shadow-md active:scale-95 disabled:opacity-70 transition-all flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span className="text-sm">{syncMessage}</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span>Зарегистрироваться в СНО</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Sandbox Toggle Mode Footnote */}
      <div className="mx-6 mb-6 p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex flex-col items-center text-center space-y-2">
        <div className="flex items-center justify-between w-full">
          <div className="text-left">
            <span className="block text-xs font-bold text-slate-800">
              {isSandboxActive ? "🔌 Режим: Локальная Песочница" : "☁️ Режим: Firebase Cloud"}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">
              {isSandboxActive 
                ? "Вход локально во временную сессию" 
                : "Данные сохраняются напрямую в облако Firestore!"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsSandboxActive(!isSandboxActive);
              setError('');
              setSuccess('');
            }}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm ${
              isSandboxActive 
                ? "bg-amber-100 text-amber-800 hover:bg-amber-200" 
                : "bg-blue-50 text-blue-800 hover:bg-blue-100"
            }`}
          >
            {isSandboxActive ? "Включить Cloud" : "Включить Демо"}
          </button>
        </div>
        
        <div className="w-full text-left pt-2 border-t border-slate-200 text-[10px] text-slate-500 space-y-1">
          <p>💡 <b>Доступны быстрые профили по ID (как в песочнице, так и в облаке):</b></p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li><b>БГЭУ-ФЭМ-30248</b> - Активист СНО Дарья Андреевна (пароль: <b>123</b>)</li>
            <li><b>БГЭУ-ФЭМ-40156</b> - Студент Александр Дмитриевич (пароль: <b>123</b>)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
