import { useState } from 'react';
import Header from './components/Header';
import NewsSection from './components/NewsSection';
import CalendarSection from './components/CalendarSection';
import QuizSection from './components/QuizSection';
import StoreSection from './components/StoreSection';
import TimelineSection from './components/TimelineSection';
import AdminSimulator from './components/AdminSimulator';
import AuthSection from './components/AuthSection'; 
import VerificationSection from './components/VerificationSection'; 
import SnoActiveSection from './components/SnoActiveSection'; 
import AdminDashboard from './components/AdminDashboard';
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
    resetAllDbData
  } = useFirebase();

  const [activeTab, setActiveTab] = useState<string>('news');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);

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
      {/* Dynamic Header Component */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile || { name: 'Гость', course: 3, group: 'ДНЗ-2', studentId: '', points: 0, exemptionCount: 0 }}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
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
              />
            )}

            {activeTab === 'store' && (
              <StoreSection
                profile={profile}
                certificates={certificates}
                onExchangeExemption={purchaseExemption}
                onNavigateToTab={setActiveTab}
              />
            )}

            {activeTab === 'timeline' && (
              <TimelineSection
                profile={profile}
                timelineItems={timelineItems}
                onNavigateToTab={setActiveTab}
              />
            )}

            {activeTab === 'verify' && (
              <VerificationSection
                certificates={certificates}
                profile={profile}
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
      </main>

      {/* Footer bar */}
      <footer className="border-t border-slate-200/80 bg-white py-6 mt-12 print:hidden text-slate-500">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8 space-y-2">
          <p className="text-xs font-medium">
            © {new Date().getFullYear()} Студенческое научное общество ФЭМ БГЭУ (Белорусский государственный экономический университет)
          </p>
          <div className="flex justify-center space-x-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <span>Проспект Партизанский 26, ауд. 214</span>
            <span>•</span>
            <span>fem@bseu.by</span>
          </div>
        </div>
      </footer>

      {/* Admin Panel Sliding Drawer */}
      <AdminSimulator
        profile={profile || { name: 'Гость', course: 3, group: 'ДНЗ-2', studentId: '', points: 0, exemptionCount: 0 }}
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onUpdateProfile={(updatedFields) => {
          if (profile) updateStudentProfileFromAdmin(profile.studentId, updatedFields);
        }}
        onResetAllData={resetAllDbData}
        onAddPoints={handleAddPointsLocalFallback}
      />
    </div>
  );
}
