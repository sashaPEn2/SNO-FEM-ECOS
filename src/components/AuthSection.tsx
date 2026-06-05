import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { GraduationCap, ShieldCheck, UserCheck, Lock, Mail, Users, BookOpen, Key, Sparkles, CheckCircle2 } from 'lucide-react';
import { useFirebase } from '../context/FirebaseContext';
import { auth } from '../firebase';
import HelpDeskSection from './HelpDeskSection';

interface AuthSectionProps {
  onLogin: (profile: StudentProfile) => void;
  registeredUsers: StudentProfile[];
  onRegister: (newProfile: StudentProfile) => void;
}

export default function AuthSection({ onLogin, registeredUsers, onRegister }: AuthSectionProps) {
  const { login, loginWithGoogle, registerStudent, currentUser } = useFirebase();
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

  const handleGoogleLogin = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);
    setSyncMessage('Авторизация через аккаунт Google в облаке...');

    try {
      const profileResult = await loginWithGoogle();
      if (profileResult) {
        setSuccess('Вход через Google выполнен успешно!');
        setTimeout(() => {
          setIsLoading(false);
          onLogin(profileResult);
        }, 800);
      } else {
        setSuccess('Вы вошли во временную сессию Google! Пожалуйста, завершите регистрацию вашего студенческого дела SNO.');
        setIsLoginMode(false);
        setIsLoading(false);
        // Pre-fill fields from Google account dynamically
        if (auth.currentUser) {
          if (auth.currentUser.email) setEmail(auth.currentUser.email);
          if (auth.currentUser.displayName) setName(auth.currentUser.displayName);
        }
      }
    } catch (err: any) {
      setIsLoading(false);
      let errorMsg = 'Не удалось авторизоваться через Google. Попробуйте еще раз.';
      if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
    }
  };

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

    const isGoogleAuth = currentUser && currentUser.email?.toLowerCase().trim() === email.trim().toLowerCase();
    const resolvedPassword = isGoogleAuth ? 'google-auth-user' : password;

    if (!name || !group || !studentId || !email || (!isGoogleAuth && !password)) {
      setError('Пожалуйста, заполните все обязательные поля.');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      setError('Неверный формат электронной почты (например, ivan@bseu.by или researcher@example.com).');
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
      }, resolvedPassword);

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

  const isGoogleSignup = currentUser && currentUser.email?.toLowerCase().trim() === email.trim().toLowerCase();

  return (
    <div className={`${isLoginMode ? 'max-w-md' : 'max-w-3xl'} mx-auto my-8 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden relative transition-all duration-300 ease-in-out`}>
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
          style={{ paddingTop: '10px', marginLeft: '19px' }}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
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
          style={{ paddingTop: '10px', marginLeft: '7px', marginTop: '0px', paddingBottom: '10px', paddingRight: '0px', marginRight: '11px', marginBottom: '0px' }}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
            !isLoginMode 
              ? 'bg-blue-900 text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Регистрация
        </button>
      </div>

      <div className="p-6 sm:p-8" style={{ backgroundColor: '#ffffff' }}>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl flex items-center space-x-2">
            <span>⚠️ {error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs sm:text-sm rounded-xl flex items-center space-x-2">
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-slate-900 transition-all text-sm placeholder-slate-400"
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-slate-900 transition-all text-sm placeholder-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{ backgroundColor: '#251f84' }}
              className="w-full py-3 text-white rounded-xl font-bold shadow-md hover:opacity-90 active:scale-95 disabled:opacity-70 transition-all flex items-center justify-center space-x-2 border-none cursor-pointer"
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

            <div className="text-center pt-1">
              <span className="text-[11px] text-slate-400 font-medium">
                Первый раз здесь? Выберите вкладку «Регистрация» выше.
              </span>
            </div>
          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Info Hint about self-registration */}
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-blue-800 leading-relaxed font-semibold">
              💡 <b>Регистрация активна!</b> Заполните реквизиты студенческого дела для автоматического начисления вех научно-исследовательских баллов ФЭМ.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
              {/* Full Name */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  ФИО Студента (в именительном падеже) *
                </label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-2.5 h-4 w-4 text-slate-450" />
                  <input
                    type="text"
                    required
                    placeholder="Карабанова Дарья Андреевна"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-slate-900 transition-all text-sm placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Student ID / Record Book Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Номер зачетной книжки *
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-2.5 h-4 w-4 text-slate-450" />
                  <input
                    type="text"
                    required
                    placeholder="БГЭУ-ФЭМ-30248"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-slate-900 transition-all text-sm placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Academic Group and Course */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Группа *
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-2.5 h-4 w-4 text-slate-455" />
                    <input
                      type="text"
                      required
                      placeholder="ДНЗ-2"
                      value={group}
                      onChange={(e) => setGroup(e.target.value)}
                      disabled={isLoading}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-slate-900 transition-all text-sm placeholder-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Курс *
                  </label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(Number(e.target.value))}
                    disabled={isLoading}
                    className="w-full px-3 py-2 bg-slate-55 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-slate-900 transition-all text-sm"
                  >
                    <option value={1}>1 курс</option>
                    <option value={2}>2 курс</option>
                    <option value={3}>3 курс</option>
                    <option value={4}>4 курс</option>
                  </select>
                </div>
              </div>

              {/* Funding basis */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Финансирование *
                </label>
                <select
                  value={isBudget ? 'budget' : 'paid'}
                  onChange={(e) => setIsBudget(e.target.value === 'budget')}
                  disabled={isLoading}
                  className="w-full px-3 py-2.5 bg-slate-55 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-slate-900 transition-all text-sm"
                >
                  <option value="budget">Бюджет</option>
                  <option value="paid">Платное</option>
                </select>
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Моб. телефон *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+375 (29) 111-22-33"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-slate-900 text-sm placeholder-slate-400"
                />
              </div>

              {/* SNO Role Selector (Temporarily Restored as requested) */}
              <div className="md:col-span-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Роль в СНО ФЭМ *
                  </label>
                  <span className="text-[10px] text-amber-700 font-extrabold uppercase bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 animate-pulse">
                    ⚠️ Временный доступ
                  </span>
                </div>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'student' | 'sno_activist')}
                  disabled={isLoading}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-900 transition-all text-sm font-semibold"
                >
                  <option value="student">🎓 Студент-Исследователь (Стандартный аккаунт)</option>
                  <option value="sno_activist">⚡ Член актива СНО / Адвокат-Модератор ФЭМ</option>
                </select>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Регистрация актива СНО временно возвращена по запросу администрации. Выбрав роль <b>«Член актива»</b>, вы получите расширенные модераторские права доступа и доступ к реестру.
                </p>
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-705 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>E-mail адрес *</span>
                  {isGoogleSignup && (
                    <span className="text-[10px] text-emerald-600 normal-case font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Подтвержден Google
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-450" />
                  <input
                    type="email"
                    required
                    placeholder="daria@bseu.by"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading || isGoogleSignup}
                    className={`w-full pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-slate-900 transition-all text-sm placeholder-slate-400 ${
                      isGoogleSignup ? 'bg-slate-100 border-slate-300 select-none text-slate-500 cursor-not-allowed' : 'bg-slate-50 border border-slate-200'
                    }`}
                  />
                </div>
              </div>

              {/* Password */}
              {!isGoogleSignup && (
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Пароль учетной записи *
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-450" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-slate-900 transition-all text-sm placeholder-slate-400"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{ backgroundColor: '#251f84' }}
              className="w-full py-3 text-white rounded-xl font-bold shadow-md hover:opacity-90 active:scale-95 disabled:opacity-70 transition-all flex items-center justify-center space-x-2 border-none cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span className="text-sm">{syncMessage}</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span>Зарегистрироваться в СНО ФЭМ</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* HelpDesk Section for Firebase configuration */}
        <HelpDeskSection />
      </div>
    </div>
  );
}
