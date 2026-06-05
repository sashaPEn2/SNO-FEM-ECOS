import { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Header from './components/Header';
import NewsSection from './components/NewsSection';
import CalendarSection from './components/CalendarSection';
import QuizSection from './components/QuizSection';
import TimelineSection from './components/TimelineSection';
import AuthSection from './components/AuthSection'; 
import SnoActiveSection from './components/SnoActiveSection'; 
import AdminDashboard from './components/AdminDashboard';
import ProfileSection from './components/ProfileSection';
import ArticleDetailPage from './components/ArticleDetailPage';
import EventDetailPage from './components/EventDetailPage';
import { useFirebase } from './context/FirebaseContext';
import { Loader2, GraduationCap } from 'lucide-react';

export default function App() {
  const {
    currentUser,
    profile,
    news,
    events,
    registrations,
    certificates,
    quizzes,
    timelineItems,
    completedQuizzes,
    registeredUsersList,
    isLoading,
    isAuthLoading,
    logout,
    likeNews,
    registerForEvent,
    cancelRegistration,
    purchaseExemption,
    awardPoints,
    createQuiz,
    createNews,
    completeQuiz,
    updateStudentProfileFromAdmin,
    resetAllDbData,
    activeToast,
    setActiveToast,
    firebaseError,
    isSandboxActive,
    setIsSandboxActive
  } = useFirebase();

  const [activeTab, setActiveTab] = useState<string>('news');
  const [currentHash, setCurrentHash] = useState<string>(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Authentication proxy updates
  const handleLogin = () => {
    setActiveTab('news');
  };

  const handleRegister = () => {
    setActiveTab('news');
  };

  const handleLogout = async () => {
    await logout();
    setActiveTab('news');
  };

  const handleAddPointsLocalFallback = async (amount: number, reason: string) => {
    if (profile) {
      await awardPoints(profile.studentId, amount, reason);
    }
  };

  // Gracefully rescue the user if Firebase operations fail due to setup issues
  if (firebaseError && !isSandboxActive) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 text-center select-text">
        <div className="absolute inset-0 bg-radial-gradient from-rose-50/20 to-transparent pointer-events-none"></div>
        <div className="relative space-y-6 max-w-xl w-full bg-white border border-slate-200/85 shadow-2xl rounded-3xl p-6 sm:p-10">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/25 mb-2 shrink-0">
            <svg className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">Подключение к Firebase</h1>
            <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest font-extrabold">БГЭУ • СНО ФЭМ РЕЕСТР</p>
          </div>

          <div className="p-4 bg-rose-50/70 border border-rose-100/50 rounded-2xl text-left select-all">
            <p className="font-bold text-rose-800 text-[11px] sm:text-xs mb-1.5 flex items-center gap-1.5">
              <span>⚠️ Ошибка Firebase:</span>
            </p>
            <code className="text-rose-950 font-mono text-[11px] block bg-rose-100/45 p-2.5 rounded-xl border border-rose-200/50 break-all whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">{firebaseError}</code>
          </div>

          <div className="text-left space-y-3.5 pt-1.5 border-t border-slate-100">
            <div className="text-slate-600 space-y-2.5 text-xs">
              <p className="font-bold text-slate-800 text-sm">🛠️ Как настроить ваш проект <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded border text-indigo-700">sno-fem-bseu</span> в консоли:</p>
              <ul className="list-decimal list-inside space-y-2 pl-1 leading-relaxed">
                <li><b className="text-slate-800">Правила базы (Firestore Rules):</b> Мы уже автоматически развернули правила безопасности <span className="font-mono bg-slate-50 border px-1 rounded">firestore.rules</span> в вашу БД!</li>
                <li><b className="text-slate-800">Разрешенные домены (Authorized Domains):</b> Если вы видите ошибку <code>auth/unauthorized-domain</code>, зайдите в Firebase Console &rarr; Build &rarr; Authentication &rarr; Settings &rarr; Authorized domains и добавьте домен вашего тестового стенда.</li>
              </ul>
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">ИЛИ</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <p className="text-slate-500 text-xs text-center leading-relaxed">Запустите интерактивную <b>Песочницу (Локальный демонстрационный режим)</b>, чтобы мгновенно протестировать все функции СНО ФЭМ без необходимости дополнительной настройки облака!</p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setIsSandboxActive(true)}
              className="w-full py-3 sm:py-4 bg-blue-900 hover:bg-blue-800 text-white rounded-2xl font-bold tracking-tight shadow-md hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              <span>Запустить локальную Песочницу SNO</span>
              <svg className="h-4.5 w-4.5 text-white shrink-0 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // High-performance loading screen centered on elegant scientific theme metrics
  if (isLoading || isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="absolute inset-0 bg-radial-gradient from-blue-50/25 to-transparent pointer-events-none"></div>
        <div className="relative space-y-6 max-w-sm">
          <div className="mx-auto h-16 w-16 rounded-3xl bg-blue-900 text-white flex items-center justify-center shadow-lg shadow-blue-900/15 animate-bounce">
            <GraduationCap className="h-9 w-9" />
          </div>
          <div className="space-y-2">
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">Цифровой реестр СНО ФЭМ</h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">БГЭУ • Деканат</p>
          </div>
          <div className="flex items-center justify-center gap-2.5 text-blue-900 font-medium text-xs sm:text-sm pt-2 bg-white/60 backdrop-blur border border-slate-100 py-3 px-5 rounded-2xl shadow-sm">
            <Loader2 className="h-4.5 w-4.5 animate-spin shrink-0 text-blue-950" />
            <span>Синхронизация с облаком БГЭУ...</span>
          </div>
        </div>
      </div>
    );
  }

  const isLoggedIn = !!currentUser && !!profile;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-800">
      <Analytics />
      {/* Dynamic Header Component */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile || { name: 'Гость', course: 3, group: 'ДНЗ-2', studentId: '', points: 0, exemptionCount: 0 }}
        onLogout={handleLogout}
        isLoggedIn={isLoggedIn}
      />

      {/* Main Container Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {!isLoggedIn ? (
          <AuthSection
            onLogin={handleLogin}
            registeredUsers={registeredUsersList}
            onRegister={handleRegister}
          />
        ) : (
          <>
            {currentHash.startsWith('#/news/') ? (() => {
              const articleId = currentHash.replace('#/news/', '');
              const foundArticle = news.find(n => n.id === articleId);
              if (foundArticle) {
                return (
                  <ArticleDetailPage
                    article={foundArticle}
                    onBack={() => { window.location.hash = ''; setActiveTab('news'); }}
                    onLikeNews={likeNews}
                    newsList={news}
                    onOpenArticle={(item) => { window.location.hash = `#/news/${item.id}`; }}
                  />
                );
              }
              return (
                <NewsSection
                  news={news}
                  onLikeNews={likeNews}
                  onNavigateToTab={setActiveTab}
                  profile={profile || undefined}
                  onAddNews={createNews}
                />
              );
            })() : currentHash.startsWith('#/event/') ? (() => {
              const eventId = currentHash.replace('#/event/', '');
              const foundEvent = events.find(e => e.id === eventId);
              if (foundEvent) {
                return (
                  <EventDetailPage
                    event={foundEvent}
                    registrations={registrations}
                    profile={profile}
                    onRegisterEvent={registerForEvent}
                    onCancelRegistration={cancelRegistration}
                    onBack={() => { window.location.hash = ''; setActiveTab('calendar'); }}
                  />
                );
              }
              return (
                <CalendarSection
                  events={events}
                  registrations={registrations}
                  profile={profile}
                  onRegisterEvent={registerForEvent}
                  onCancelRegistration={cancelRegistration}
                />
              );
            })() : (
              <>
                {activeTab === 'profile' && (
                  <ProfileSection />
                )}

                {activeTab === 'news' && (
                  <NewsSection
                    news={news}
                    onLikeNews={likeNews}
                    onNavigateToTab={setActiveTab}
                    profile={profile || undefined}
                    onAddNews={createNews}
                  />
                )}

                {activeTab === 'calendar' && (
                  <CalendarSection
                    events={events}
                    registrations={registrations}
                    profile={profile}
                    onRegisterEvent={registerForEvent}
                    onCancelRegistration={cancelRegistration}
                  />
                )}

                {activeTab === 'quiz' && (
                  <QuizSection
                    quizzes={quizzes}
                    onAddPoints={handleAddPointsLocalFallback}
                    completedQuizIds={completedQuizzes}
                    onCompleteQuiz={completeQuiz}
                    profile={profile}
                  />
                )}

                {activeTab === 'timeline' && (
                  <TimelineSection
                    profile={profile}
                    timelineItems={timelineItems}
                    onNavigateToTab={setActiveTab}
                  />
                )}

                {activeTab === 'sno_active' && profile.role === 'sno_activist' && (
                  <SnoActiveSection
                    quizzes={quizzes}
                    onCreateQuiz={createQuiz}
                    events={events}
                    registrations={registrations}
                    registeredUsers={registeredUsersList}
                    onAwardPoints={awardPoints}
                    profile={profile}
                  />
                )}

                {activeTab === 'admin_dashboard' && profile.role === 'sno_activist' && (
                  <AdminDashboard />
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Footer bar */}
      <footer className="border-t border-slate-200/80 bg-white py-6 mt-12 print:hidden text-slate-500">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8 space-y-2">
          <p className="text-xs font-medium">
            © {new Date().getFullYear()} Студенческое научное общество ФЭМ БГЭУ (Белорусский государственный экономический университет)
          </p>
          <div className="flex justify-center space-x-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <span>Партизанский пр-т 22А, ауд. 302</span>
            <span>•</span>
            <span>sno_fem_bseu@mail.ru</span>
          </div>
        </div>
      </footer>

      {/* Dynamic Pop-up Push Notification Alerts */}
      {activeToast && (
        <div 
          className="fixed bottom-5 right-5 z-55 max-w-sm bg-slate-900 border border-slate-700/60 shadow-xl rounded-2xl p-4 flex flex-col space-y-1.5 cursor-pointer text-slate-100 animate-fade-in"
          onClick={() => setActiveToast(null)}
        >
          <div className="flex items-center justify-between text-[10px] font-extrabold uppercase text-indigo-200">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Новое оповещение SNO
            </span>
            <button className="text-slate-400 hover:text-white text-xs select-none">×</button>
          </div>
          <h4 className="text-xs font-bold font-sans text-white">{activeToast.title}</h4>
          <p className="text-[11px] text-slate-350 leading-relaxed font-sans">{activeToast.message}</p>
        </div>
      )}
    </div>
  );
}
