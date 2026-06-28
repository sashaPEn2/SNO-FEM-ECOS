/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { Student, Achievement, Notification, Course, ActivityCategory, ApplicationStatus, Quiz, QuizAttempt, Souvenir, SouvenirOrder } from "./types";
import { syncStudentsFromFirestore, saveStudentToFirestore, deleteStudentFromFirestore } from "./firebaseSync";
import {
  initializeStorage,
  getStoredStudents,
  getStoredAchievements,
  getStoredNotifications,
  getStoredQuizzes,
  getStoredQuizAttempts,
  getStoredSouvenirs,
  getStoredSouvenirOrders,
  saveStoredStudents,
  saveStoredAchievements,
  saveStoredNotifications,
  saveStoredQuizzes,
  saveStoredQuizAttempts,
  saveStoredSouvenirs,
  saveStoredSouvenirOrders,
  recalculateStudentPoints
} from "./data/mockData";
import Dashboard from "./components/Dashboard";
import StatsDashboard from "./components/StatsDashboard";
import StudentProfile from "./components/StudentProfile";
import AdminPanel from "./components/AdminPanel";
import AchievementForm from "./components/AchievementForm";
import CertificateModal from "./components/CertificateModal";
import SnoJournals from "./components/SnoJournals";
import AuthScreen from "./components/AuthScreen";
import { BookOpen, Award, BarChart3, User, Shield, Layers, ChevronRight, GraduationCap, Sparkles, Home, BellRing, HelpCircle, LogOut, Menu, X } from "lucide-react";

export default function App() {
  const { user, isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();
  
  // 1. Storage bootstrapping on startup
  useEffect(() => {
    initializeStorage();
  }, []);

  // 2. React Global States
  const [students, setStudents] = useState<Student[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [souvenirs, setSouvenirs] = useState<Souvenir[]>([]);
  const [souvenirOrders, setSouvenirOrders] = useState<SouvenirOrder[]>([]);
  
  const [currentTab, setCurrentTab] = useState<"registry" | "stats" | "profile" | "admin" | "journals">("profile");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Student | null>(null);
  
  // Initialize and Sync from Firestore
  useEffect(() => {
    async function sync() {
      const fbStudents = await syncStudentsFromFirestore();
      setStudents(fbStudents);
      
      if (isLoaded && isSignedIn && user?.primaryEmailAddress?.emailAddress) {
        const matched = fbStudents.find(
          (s) => s.email.toLowerCase() === user.primaryEmailAddress!.emailAddress!.toLowerCase()
        );
        if (matched) {
          setCurrentUser(matched);
        }
      } else if (isLoaded && !isSignedIn) {
        setCurrentUser(null);
        setCurrentTab("registry");
      }
    }
    sync();
  }, [isLoaded, isSignedIn, user]);
  
  const activeStudent = currentUser;
  const currentLoggedUser = currentUser;
  const activeModerator = currentUser || students.find(s => s.role === "admin" || s.role === "curator") || students[0];
  
  // Tracking submitted forms
  const [showSubForm, setShowSubForm] = useState(false);
  const [formCategory, setFormCategory] = useState<ActivityCategory | undefined>(undefined);

  // Tracking certified modal popups
  const [activeCertData, setActiveCertData] = useState<{ achievement: Achievement; student: Student } | null>(null);

  // Verification detection state for QR scan redirection
  const [verifyId, setVerifyId] = useState<string | null>(null);
  const [verifyPortfolioId, setVerifyPortfolioId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vParam = params.get("verify");
    const pParam = params.get("verify_portfolio");
    if (vParam) {
      setVerifyId(vParam);
    }
    if (pParam) {
      setVerifyPortfolioId(pParam);
    }
  }, []);

  // Load state from local storage on mount
  useEffect(() => {
    initializeStorage();

    // One-time wipe for all Verified Achievements as requested
    if (localStorage.getItem("bseu_wipe_verified_temp_v1") !== "done") {
      const achs = getStoredAchievements();
      const nonVerified = achs.filter(a => a.status !== ApplicationStatus.Approved);
      saveStoredAchievements(nonVerified);
      
      const st = getStoredStudents();
      st.forEach(s => {
        recalculateStudentPoints(s.id);
      });

      localStorage.setItem("bseu_wipe_verified_temp_v1", "done");
    }

    setAchievements(getStoredAchievements());
    setNotifications(getStoredNotifications());
    setQuizzes(getStoredQuizzes());
    setQuizAttempts(getStoredQuizAttempts());
    setSouvenirs(getStoredSouvenirs());
    setSouvenirOrders(getStoredSouvenirOrders());
  }, []);

  const handleLogout = async () => {
    await signOut();
  };

  // Sync back state helpers
  const updateAchievementsStateAndStore = (newAchievements: Achievement[]) => {
    setAchievements(newAchievements);
    saveStoredAchievements(newAchievements);
  };

  const updateNotificationsStateAndStore = (newNotifications: Notification[]) => {
    setNotifications(newNotifications);
    saveStoredNotifications(newNotifications);
  };

  const updateStudentsStateAndStore = (newStudents: Student[]) => {
    setStudents(newStudents);
    saveStoredStudents(newStudents);
    // synchronize logged in user state too if changed
    if (currentUser) {
      const match = newStudents.find(s => s.id === currentUser.id);
      if (match) {
        setCurrentUser(match);
        localStorage.setItem("bseu_logged_user", JSON.stringify(match));
      }
    }
  };

  const handleUpdateAvatar = (studentId: string, avatarUrl: string) => {
    const updated = students.map(s => s.id === studentId ? { ...s, avatarUrl } : s);
    updateStudentsStateAndStore(updated);
  };

  // 3. Operational Engines & Handlers
  
  // Student submits a new achievement
  const handleAddNewAchievement = (formValues: Omit<Achievement, "id" | "status" | "studentId" | "studentName">) => {
    if (!currentUser) return;
    const newId = `ach_${Date.now()}`;
    const newRecord: Achievement = {
      ...formValues,
      id: newId,
      studentId: currentUser.id,
      studentName: currentUser.fullName,
      status: ApplicationStatus.Pending
    };

    const updatedAchievements = [newRecord, ...achievements];
    updateAchievementsStateAndStore(updatedAchievements);

    // Create SSS moderator alert note for all registered admins and curators
    const adminList = students.filter(s => s.role === "admin" || s.role === "curator");
    const newNotifications = [...notifications];
    
    adminList.forEach(adm => {
      newNotifications.unshift({
        id: `not_mod_${Date.now()}_${adm.id}`,
        studentId: adm.id,
        title: "Новая заявка на модерацию",
        message: `Студент ${currentUser.fullName} (${currentUser.group}) подал новое достижение на верификацию: "${formValues.title.slice(0, 45)}..."`,
        date: new Date().toLocaleString("ru-RU", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }),
        isRead: false,
        achievementId: newId,
        status: "info"
      });
    });

    updateNotificationsStateAndStore(newNotifications);
    
    // Switch view
    setShowSubForm(false);
    setCurrentTab("profile");
    alert("Ваше достижение успешно отправлено на рассмотрение модераторам СНО ФЭМ БГЭУ!");
  };

  // Admin approves achievement
  const handleApproveAchievement = (achievementId: string, moderatorName: string) => {
    const updatedAchievements = achievements.map((a) => {
      if (a.id === achievementId) {
        return {
          ...a,
          status: ApplicationStatus.Approved,
          approvedBy: `${moderatorName} (СНО)`,
          approvedDate: new Date().toLocaleDateString("ru-RU")
        };
      }
      return a;
    });

    // Recalculate student points
    const targetAchievement = achievements.find(a => a.id === achievementId);
    if (targetAchievement) {
      // Save achievements first
      saveStoredAchievements(updatedAchievements);
      setAchievements(updatedAchievements);

      // Recalculate scores and save
      const updatedStudents = recalculateStudentPoints(targetAchievement.studentId);
      setStudents(updatedStudents);

      // Create student award alert notification
      const studentName = students.find(s => s.id === targetAchievement.studentId)?.fullName || targetAchievement.studentName;
      const studentNotification: Notification = {
        id: `not_app_${Date.now()}`,
        studentId: targetAchievement.studentId,
        title: "Заявка одобрена СНО",
        message: `Поздравляем! Ваша заявка "${targetAchievement.title.slice(0, 50)}..." верифицирована. Начислено +${targetAchievement.points} баллов в рейтинг!`,
        date: new Date().toLocaleString("ru-RU", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }),
        isRead: false,
        achievementId: achievementId,
        status: "success"
      };

      updateNotificationsStateAndStore([studentNotification, ...notifications]);
    }
  };

  // Admin rejects achievement
  const handleRejectAchievement = (achievementId: string, reason: string, moderatorName: string) => {
    const updatedAchievements = achievements.map((a) => {
      if (a.id === achievementId) {
        return {
          ...a,
          status: ApplicationStatus.Rejected,
          rejectReason: reason,
          approvedBy: moderatorName,
          approvedDate: new Date().toLocaleDateString("ru-RU")
        };
      }
      return a;
    });

    const targetAchievement = achievements.find(a => a.id === achievementId);
    if (targetAchievement) {
      saveStoredAchievements(updatedAchievements);
      setAchievements(updatedAchievements);

      // Recalculate scores (in case it was previously approved - for correction)
      const updatedStudents = recalculateStudentPoints(targetAchievement.studentId);
      setStudents(updatedStudents);

      // Student reject correction alert notification
      const studentNotification: Notification = {
        id: `not_rej_${Date.now()}`,
        studentId: targetAchievement.studentId,
        title: "Необходимы исправления",
        message: `Заявление "${targetAchievement.title.slice(0, 45)}..." не прошло модерацию СНО ФЭМ. Причина: "${reason}"`,
        date: new Date().toLocaleString("ru-RU", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }),
        isRead: false,
        achievementId: achievementId,
        status: "error"
      };

      updateNotificationsStateAndStore([studentNotification, ...notifications]);
    }
  };

  // Clear or dismiss unread student alert notifications
  const handleMarkAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map(n => {
      if (n.id === notificationId) {
        return { ...n, isRead: true };
      }
      return n;
    });
    updateNotificationsStateAndStore(updatedNotifications);
  };

  // Register a new profile
  const handleAddStudent = async (profileValues: Omit<Student, "id" | "totalPoints">) => {
    const newId = `stud_${Date.now()}`;
    const newStudent: Student = {
      ...profileValues,
      id: newId,
      totalPoints: 0
    };

    // Persist to Firestore
    await saveStudentToFirestore(newStudent);

    const updatedStudents = [...students, newStudent];
    updateStudentsStateAndStore(updatedStudents);
  };

  // Exclude a profile from faculty database
  const handleDeleteStudent = (studentId: string) => {
    // Exclude student
    const updatedStudents = students.filter(s => s.id !== studentId);
    updateStudentsStateAndStore(updatedStudents);
    deleteStudentFromFirestore(studentId).catch(console.error);

    // Wipe their achievements as well
    const updatedAchievements = achievements.filter(a => a.studentId !== studentId);
    updateAchievementsStateAndStore(updatedAchievements);
  };

  const handleUpdateUserRoleAndPosition = (
    studentId: string,
    role: 'student' | 'moderator' | 'admin' | 'curator' | 'dean' | 'deputy_dean' | 'nirs_dept',
    position: string,
    group: string,
    specialty: string
  ) => {
    const updatedStudents = students.map((s) => {
      if (s.id === studentId) {
        return {
          ...s,
          role,
          position: role !== "student" ? position : undefined,
          group: group || s.group,
          specialty: specialty || s.specialty
        };
      }
      return s;
    });
    updateStudentsStateAndStore(updatedStudents);
    alert("Роль и реквизиты пользователя успешно обновлены в едином реестре СНО БГЭУ!");
  };

  const handleCreateQuiz = (newQuiz: Quiz) => {
    const updatedQuizzes = [newQuiz, ...quizzes];
    setQuizzes(updatedQuizzes);
    saveStoredQuizzes(updatedQuizzes);
    
    // Create notification alert for all students
    const activeStudents = students.filter(s => s.role === 'student');
    const newNotifications = [...notifications];
    activeStudents.forEach(st => {
      newNotifications.unshift({
        id: `not_quiz_${Date.now()}_${st.id}`,
        studentId: st.id,
        title: "Новая викторина СНО! 🔥",
        message: `Создана новая интерактивная викторина: "${newQuiz.title}". Пройдите ее и получите +${newQuiz.pointsAwarded} баллов СНО!`,
        date: new Date().toLocaleString("ru-RU", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }),
        isRead: false,
        status: "info"
      });
    });
    updateNotificationsStateAndStore(newNotifications);
  };

  const handleCompleteQuiz = (attempt: QuizAttempt) => {
    const updatedAttempts = [attempt, ...quizAttempts];
    setQuizAttempts(updatedAttempts);
    saveStoredQuizAttempts(updatedAttempts);

    // Recalculate student scores
    const updatedStudents = recalculateStudentPoints(attempt.studentId);
    setStudents(updatedStudents);

    // Add alert notification
    const studentNotification: Notification = {
      id: `not_quiz_at_${Date.now()}`,
      studentId: attempt.studentId,
      title: "Викторина пройдена! 🎓",
      message: `Вы завершили викторину "${attempt.quizTitle}" на результат ${attempt.score}/${attempt.totalQuestions}. Начислено +${attempt.pointsEarned} баллов в портфолио!`,
      date: new Date().toLocaleString("ru-RU", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }),
      isRead: false,
      status: "success"
    };
    updateNotificationsStateAndStore([studentNotification, ...notifications]);
  };

  const handleOrderSouvenir = (souvenirId: string, studentId: string) => {
    const sList = souvenirs.length > 0 ? souvenirs : getStoredSouvenirs();
    const item = sList.find(s => s.id === souvenirId);
    const stud = students.find(s => s.id === studentId);
    if (!item || !stud) return;

    if (stud.totalPoints < item.cost) {
      alert("Недостаточно баллов для обмена на этот сувенир!");
      return;
    }

    const orderId = `ord_${Date.now()}`;
    const newOrder: SouvenirOrder = {
      id: orderId,
      studentId: stud.id,
      studentName: stud.fullName,
      souvenirId: item.id,
      souvenirName: item.name,
      cost: item.cost,
      date: new Date().toLocaleString("ru-RU", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }),
      status: 'pending'
    };

    const updatedOrders = [newOrder, ...souvenirOrders];
    setSouvenirOrders(updatedOrders);
    saveStoredSouvenirOrders(updatedOrders);

    // Recalculate points with small delay to prevent batching race
    setTimeout(() => {
      const updatedStudents = recalculateStudentPoints(studentId);
      setStudents(updatedStudents);
    }, 50);

    // Alerts
    const studentNotification: Notification = {
      id: `not_order_${Date.now()}`,
      studentId: studentId,
      title: "Заказ оформлен! 🛍️",
      message: `Вы обменяли баллы на "${item.name}" за ${item.cost} баллов. Заберите в кабинете СНО ФЭМ (ауд. 320, корп. 4)!`,
      date: new Date().toLocaleString("ru-RU", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }),
      isRead: false,
      status: "info"
    };

    const adminList = students.filter(s => s.role === "admin" || s.role === "curator");
    const newNotifications = [studentNotification, ...notifications];
    adminList.forEach(adm => {
      newNotifications.unshift({
        id: `not_order_mod_${Date.now()}_${adm.id}`,
        studentId: adm.id,
        title: "Новый заказ сувенира 🎁",
        message: `Студент ${stud.fullName} обменял баллы на "${item.name}". Требуется выдача.`,
        date: new Date().toLocaleString("ru-RU", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }),
        isRead: false,
        status: "info"
      });
    });

    updateNotificationsStateAndStore(newNotifications);
    alert(`Обмен успешно произведен! С Вашего баланса списано ${item.cost} баллов. Вы можете получить '${item.name}' в кабинете активистов СНО.`);
  };

  const handleUpdateOrderStatus = (orderId: string, status: 'completed' | 'cancelled') => {
    const updatedOrders = souvenirOrders.map(o => {
      if (o.id === orderId) {
        return { ...o, status };
      }
      return o;
    });
    setSouvenirOrders(updatedOrders);
    saveStoredSouvenirOrders(updatedOrders);

    const targetOrder = souvenirOrders.find(o => o.id === orderId);
    if (targetOrder) {
      setTimeout(() => {
        const updatedStudents = recalculateStudentPoints(targetOrder.studentId);
        setStudents(updatedStudents);
      }, 50);

      const title = status === 'completed' ? "Сувенир выдан! 🎉" : "Заказ отменен ❌";
      const message = status === 'completed'
        ? `Вы успешно получили сувенир "${targetOrder.souvenirName}". Спасибо за участие в жизни СНО!`
        : `Куратором отклонен или отменен заказ "${targetOrder.souvenirName}". ${targetOrder.cost} баллов возвращены на Ваш счет.`;

      const studentNotification: Notification = {
        id: `not_ord_upd_${Date.now()}`,
        studentId: targetOrder.studentId,
        title,
        message,
        date: new Date().toLocaleString("ru-RU", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }),
        isRead: false,
        status: status === 'completed' ? 'success' : 'warning'
      };
      updateNotificationsStateAndStore([studentNotification, ...notifications]);
    }
  };

  const handleAwardConferencePoints = (studentId: string, type: 'participation' | 'win') => {
    const stud = students.find(s => s.id === studentId);
    if (!stud) return;

    const isWin = type === 'win';
    const points = isWin ? 50 : 20;
    const title = isWin ? "Победа в научной конференции! 🏆" : "Участие в научной конференции 📝";
    const description = isWin 
      ? `Награждение за победу (диплом 1-3 степени) на международной / республиканской научной конференции БГЭУ.`
      : `Поощрение за выступление с научно-исследовательским докладом на конференции СНО ФЭМ БГЭУ.`;

    // Create an approved virtual achievement
    const newId = `ach_conf_${Date.now()}`;
    const newRecord: Achievement = {
      id: newId,
      studentId: stud.id,
      studentName: stud.fullName,
      course: stud.course,
      title: title,
      category: ActivityCategory.Science,
      description: description,
      points: points,
      date: new Date().toISOString().split('T')[0],
      status: ApplicationStatus.Approved,
      supervisor: "Верифицировано СНО ФЭМ",
      proofText: "Протокол очного выступления СНО",
      approvedBy: `${activeModerator.fullName} (Куратор СНО)`,
      approvedDate: new Date().toLocaleDateString("ru-RU")
    };

    const updatedAchievements = [newRecord, ...achievements];
    saveStoredAchievements(updatedAchievements);
    setAchievements(updatedAchievements);

    // Dynamic points update
    setTimeout(() => {
      const updatedStudents = recalculateStudentPoints(stud.id);
      setStudents(updatedStudents);
    }, 50);

    // Alerts
    const studentNotification: Notification = {
      id: `not_conf_${Date.now()}`,
      studentId: stud.id,
      title,
      message: `Куратором СНО вам начислено +${points} баллов за ${isWin ? "победу (диплом)" : "выступление с докладом"} на научной конференции!`,
      date: new Date().toLocaleString("ru-RU", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }),
      isRead: false,
      status: "success"
    };
    updateNotificationsStateAndStore([studentNotification, ...notifications]);
    
    alert(`Студенту ${stud.fullName} успешно начислено +${points} баллов за конференцию (${isWin ? "Победа" : "Участие"})!`);
  };

  // System hard restore tool
  const handleResetDatabase = () => {
    localStorage.removeItem("bseu_students");
    localStorage.removeItem("bseu_achievements");
    localStorage.removeItem("bseu_notifications");
    localStorage.removeItem("bseu_quizzes");
    localStorage.removeItem("bseu_quiz_attempts");
    localStorage.removeItem("bseu_souvenirs");
    localStorage.removeItem("bseu_souvenir_orders");
    
    initializeStorage();
    setStudents(getStoredStudents());
    setAchievements(getStoredAchievements());
    setNotifications(getStoredNotifications());
    setQuizzes(getStoredQuizzes());
    setQuizAttempts(getStoredQuizAttempts());
    setSouvenirs(getStoredSouvenirs());
    setSouvenirOrders(getStoredSouvenirOrders());
    
    setCurrentTab("registry");
    setShowSubForm(false);
    alert("База данных БГЭУ СНО полностью сброшена к начальным тестовым значениям факультета.");
  };

  // Check unread count for current view
  const currentUnreadNotificationCount = currentLoggedUser
    ? notifications.filter(n => n.studentId === currentLoggedUser.id && !n.isRead).length
    : 0;

  // On-screen Verification view if checking full portfolio QR code
  if (verifyPortfolioId) {
    const matchedStudent = students.find(s => s.id === verifyPortfolioId);
    const studentApprovedAchievements = achievements.filter(
      a => a.studentId === verifyPortfolioId && a.status === ApplicationStatus.Approved
    );
    const isReal = !!matchedStudent;

    const totalApprovedPoints = studentApprovedAchievements.reduce((sum, a) => sum + a.points, 0);
    const verificationCodeStr = matchedStudent 
      ? `БГЭУ-ФЭМ-СВОД-${matchedStudent.id.toUpperCase().split("_")[1] || matchedStudent.id.toUpperCase()}-${studentApprovedAchievements.length}`
      : "БГЭУ-ФЭМ-INVALID";

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-12 antialiased font-sans flex-col select-none">
        <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-250 shadow-xl overflow-hidden pb-4">
          
          <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 p-6 text-center text-white border-b border-emerald-700 relative">
            <div className="absolute right-4 top-4 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white font-serif font-black text-xs uppercase shadow-inner">
              БГЭУ
            </div>
            <div className="text-xs uppercase font-bold tracking-widest text-[#a7f3d0]">Реестр СНО БГЭУ</div>
            <h1 className="text-base font-black uppercase mt-1 leading-tight tracking-tight">Верификация сводного портфолио</h1>
          </div>

          <div className="p-6 space-y-6">
            {isReal ? (
              <>
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-lg">
                    ✔
                  </div>
                  <div className="min-w-0">
                    <div className="font-extrabold text-[#064e3b] text-sm tracking-tight uppercase">Сводные данные подтверждены</div>
                    <p className="text-xs text-emerald-800 font-medium leading-normal">
                      Единый академический реестр подтверждает подлинность всех ({studentApprovedAchievements.length}) научных заслуг студента.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-150 space-y-3">
                  <h3 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-200/60 pb-1.5">
                    Личные данные обучающегося
                  </h3>
                  
                  <div className="grid grid-cols-3 text-xs gap-y-1 pb-1">
                    <span className="text-slate-500 font-medium">Обучающийся:</span>
                    <span className="col-span-2 text-slate-900 font-bold">{matchedStudent.fullName}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 text-xs gap-y-1 pb-1">
                    <span className="text-slate-500 font-medium">Курс, Группа:</span>
                    <span className="col-span-2 text-slate-850 font-semibold">{matchedStudent.course}, академическая группа {matchedStudent.group}</span>
                  </div>

                  <div className="grid grid-cols-3 text-xs gap-y-1 pb-1">
                    <span className="text-slate-500 font-medium">Специальность:</span>
                    <span className="col-span-2 text-slate-850 italic">{matchedStudent.specialty}</span>
                  </div>

                  <div className="grid grid-cols-3 text-xs gap-y-1 pb-1 border-t border-slate-200 pt-2.5">
                    <span className="text-slate-500 font-medium">Суммарный рейтинг:</span>
                    <span className="col-span-2 text-emerald-800 font-black">+{totalApprovedPoints} баллов СНО (Наука)</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest pl-1">
                    Одобренные научные достижения
                  </h3>

                  {studentApprovedAchievements.length === 0 ? (
                    <p className="text-xs text-slate-500 italic pl-1">Научные работы в системе отсутствуют или еще не одобрены.</p>
                  ) : (
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {studentApprovedAchievements.map((item, index) => (
                        <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-3 flex justify-between gap-3 text-xs">
                          <div>
                            <div className="font-extrabold text-slate-950 leading-tight">
                              {index + 1}. {item.title}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1">
                              Категория: {item.category}
                            </div>
                          </div>
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 font-black text-[10px] px-2 py-0.5 rounded-lg shrink-0 h-max">
                            +{item.points} б.
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-center border-t border-slate-100 pt-4">
                  <div className="text-[10px] text-slate-400 font-mono">
                    Сводный хэш верификации: <span className="font-bold text-slate-700 ">{verificationCodeStr}</span>
                  </div>
                  <div className="text-[9.5px] text-slate-500 leading-relaxed font-semibold">
                    Официально верифицировано Советом молодых ученых и СНО ФЭМ БГЭУ 2026.
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 text-red-650 flex items-center justify-center mx-auto shadow-xs">
                  <span className="font-bold text-xl">!</span>
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-base font-black text-slate-900 font-sans">Ошибка сверки портфолио</h2>
                  <p className="text-xs text-slate-505">
                    Студент с идентификатором <strong>{verifyPortfolioId}</strong> не зарегистрирован.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                window.history.pushState({}, "", window.location.pathname);
                setVerifyPortfolioId(null);
              }}
              className="w-full bg-emerald-800 hover:bg-emerald-900 transition text-white text-xs font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Войти в Единый портал СНО</span>
              <ChevronRight className="w-4 h-4" />
            </button>

          </div>
        </div>
      </div>
    );
  }

  // On-screen Verification view if checking achievement QR code
  if (verifyId) {
    const matchedAch = achievements.find(a => a.id === verifyId);
    const matchedStudent = matchedAch ? students.find(s => s.id === matchedAch.studentId) : null;
    const isReal = !!matchedAch && !!matchedStudent;
    
    // Compute department
    let dCode = 1;
    let dName = "Кафедра экономики промышленных предприятий";
    if (matchedStudent) {
      const specLow = matchedStudent.specialty.toLowerCase();
      if (specLow.includes("промыш") || specLow.includes("предприят") || specLow.includes("деу") || specLow.includes("дэу")) {
        dCode = 1;
        dName = "Кафедра экономики промышленных предприятий";
      } else if (specLow.includes("менедж") || specLow.includes("управлен") || specLow.includes("жку") || specLow.includes("инновац") || specLow.includes("ку")) {
        dCode = 2;
        dName = "Кафедра экономики и управления предприятиями";
      } else if (specLow.includes("национал") || specLow.includes("государствен") || specLow.includes("мнэ") || specLow.includes("дгп")) {
        dCode = 3;
        dName = "Кафедра национальной экономики и государственного управления";
      } else if (specLow.includes("политик")) {
        dCode = 4;
        dName = "Кафедра экономической политики";
      } else if (specLow.includes("информатик") || specLow.includes("дэи") || specLow.includes("компьютер")) {
        dCode = 5;
        dName = "Кафедра экономической информатики";
      } else {
        dCode = 6;
        dName = "Кафедра планирования и прогнозирования";
      }
    }

    const verificationCodeStr = matchedAch && matchedStudent 
      ? `БГЭУ-ФЭМ-${matchedAch.id.toUpperCase().split("_")[1] || matchedAch.id.toUpperCase()}-${matchedStudent.id.toUpperCase().split("_")[1]}`
      : "БГЭУ-ФЭМ-INVALID";

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-12 antialiased font-sans flex-col select-none">
        <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-250 shadow-xl overflow-hidden">
          
          <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 p-6 text-center text-white border-b border-emerald-700 relative">
            <div className="absolute right-4 top-4 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white font-serif font-black text-xs uppercase shadow-inner">
              БГЭУ
            </div>
            <div className="text-xs uppercase font-bold tracking-widest text-[#a7f3d0]">Реестр СНО БГЭУ</div>
            <h1 className="text-lg font-black uppercase mt-1 leading-tight tracking-tight">Электронная верификация</h1>
          </div>

          <div className="p-6 space-y-6">
            {isReal ? (
              <>
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-lg">
                    ✔
                  </div>
                  <div>
                    <div className="font-extrabold text-[#064e3b] text-sm tracking-tight uppercase">Документ подлинный</div>
                    <p className="text-xs text-emerald-800 font-medium">Справка подтверждена верификационной комиссией Совета СНО ФЭМ БГЭУ.</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                  <h3 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-200/60 pb-1.5">
                    Верифицированные реквизиты
                  </h3>
                  
                  <div className="grid grid-cols-3 text-xs gap-y-1 pb-1">
                    <span className="text-slate-500 font-medium">Обучающийся:</span>
                    <span className="col-span-2 text-slate-900 font-bold">{matchedStudent?.fullName}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 text-xs gap-y-1 pb-1">
                    <span className="text-slate-500 font-medium">Курс, Группа:</span>
                    <span className="col-span-2 text-slate-800 font-semibold">{matchedStudent?.course}, академическая группа {matchedStudent?.group}</span>
                  </div>

                  <div className="grid grid-cols-3 text-xs gap-y-1 pb-1">
                    <span className="text-slate-500 font-medium font-sans">Специальность:</span>
                    <span className="col-span-2 text-slate-800 italic">{matchedStudent?.specialty}</span>
                  </div>

                  <div className="grid grid-cols-3 text-xs gap-y-1 pb-1 border-t border-slate-100 pt-2.5">
                    <span className="text-slate-500 font-medium">Аффилиация:</span>
                    <span className="col-span-2 text-slate-800 font-semibold">{dName} (Кафедра {dCode})</span>
                  </div>

                  <div className="grid grid-cols-3 text-xs gap-y-1 pb-1">
                    <span className="text-slate-500 font-medium">Вид НИР / Тема:</span>
                    <span className="col-span-2 text-emerald-900 font-extrabold leading-tight">{matchedAch?.title}</span>
                  </div>

                  {matchedAch?.supervisor && (
                    <div className="grid grid-cols-3 text-xs gap-y-1 pb-1">
                      <span className="text-slate-500 font-medium">Руководитель:</span>
                      <span className="col-span-2 text-slate-800 font-semibold">{matchedAch.supervisor}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-3 text-xs gap-y-1 pb-1 border-t border-slate-100 pt-2.5">
                    <span className="text-slate-500 font-medium">Оценка СНО:</span>
                    <span className="col-span-2 text-emerald-800 font-black">+{matchedAch?.points} баллов рейтинговой шкалы</span>
                  </div>

                  <div className="grid grid-cols-3 text-xs gap-y-1">
                    <span className="text-slate-500 font-medium">Дата одобрения:</span>
                    <span className="col-span-2 text-slate-800 font-medium">{matchedAch?.approvedDate || matchedAch?.date}</span>
                  </div>
                </div>

                <div className="space-y-2 text-center border-t border-slate-100 pt-4">
                  <div className="text-[10px] text-slate-400 font-mono">
                    Хэш верификации: <span className="font-bold text-slate-700 ">{verificationCodeStr}</span>
                  </div>
                  <div className="text-[9px] text-slate-450 leading-snug">
                    Документ сгенерирован автоматически на основании протокола Совета НИРС ФЭМ БГЭУ.<br/>
                    Официальные подписанты: зам. декана по науке к.э.н., доцент <strong>Гулина О.В.</strong> и председатель Совета СНО <strong>Терро А.В.</strong>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 text-red-650 flex items-center justify-center mx-auto shadow-xs">
                  <span className="font-bold text-xl">!</span>
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-base font-black text-slate-900 font-sans">Ошибка сверки реестра</h2>
                  <p className="text-xs text-slate-500 ">
                    Достижение с кодом <strong>{verifyId}</strong> не зарегистрировано во внутренней бд СНО ФЭМ БГЭУ либо было отозвано верификационной комиссией.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                window.history.pushState({}, "", window.location.pathname);
                setVerifyId(null);
              }}
              className="w-full bg-emerald-800 hover:bg-emerald-900 transition text-white text-xs font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Войти на Единый портал СНО ФЭМ БГЭУ</span>
              <ChevronRight className="w-4 h-4" />
            </button>

          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans flex flex-col selection:bg-emerald-200">
        <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-2xs backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 border border-emerald-500 flex items-center justify-center text-white font-serif font-black shadow-inner leading-none tracking-tighter text-sm uppercase">
                БГЭУ
              </div>
              <div>
                <span className="font-extrabold text-slate-900 tracking-tight text-sm uppercase">СНО ФЭМ БГЭУ</span>
                <p className="text-[10px] text-slate-400 font-medium">Реестр достижений</p>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1">
          <AuthScreen 
            students={students}
            onRegister={(newStud) => {
              handleAddStudent(newStud);
            }}
          />
        </main>
        <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400">
          © 2026 Белорусский государственный экономический университет (БГЭУ)
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans flex flex-col selection:bg-emerald-200">
      
      {/* 1. Academic Header & Main Navigation Menu */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-2xs backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-row items-center justify-between gap-4">
          
          {/* Logo \& Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 border border-emerald-500 flex items-center justify-center text-white font-serif font-black shadow-inner leading-none tracking-tighter text-sm uppercase shrink-0">
              БГЭУ
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-sm uppercase">СНО ФЭМ БГЭУ</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50">РЕЕСТР ДОСТИЖЕНИЙ</span>
              </div>
              <p className="text-[11px] text-slate-450 font-medium truncate max-w-sm">Белорусский государственный экономический университет</p>
            </div>
            <div className="sm:hidden flex flex-col">
              <span className="font-extrabold text-slate-900 tracking-tight text-[13px] uppercase">СНО ФЭМ</span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded-md border border-emerald-200/50 w-fit mt-0.5">РЕЕСТР ДОСТИЖЕНИЙ</span>
            </div>
          </div>

          {/* Desktop User profile & logout controls */}
          <div className="hidden lg:flex items-center gap-3 bg-slate-50 border border-slate-150 rounded-2xl p-2 px-3">
            {currentUser.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="" className="w-8 h-8 rounded-xl object-cover border border-emerald-200 shadow-sm" />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200/50 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                {currentUser.fullName.slice(0, 2)}
              </div>
            )}
            <div className="text-right">
              <div className="text-xs font-extrabold text-slate-900 ">{currentUser.fullName}</div>
              <div className="text-[10px] text-slate-500 font-medium leading-none mt-0.5">
                {currentUser.role === 'student' ? `${currentUser.course} курс, гр. ${currentUser.group}` : (currentUser.position || 'Член Комитета СНО')}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1 px-3 bg-red-50 hover:bg-red-100 :bg-red-900/50 text-red-750 text-xs font-bold rounded-lg border border-red-200 transition flex items-center gap-1.5 cursor-pointer ml-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Выйти</span>
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -mr-2 text-slate-600 hover:text-slate-900 transition focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Global tab options */}
        <div className={`bg-slate-50/50 border-t border-slate-100 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center justify-between overflow-x-auto no-scrollbar py-1 gap-2 lg:gap-0">
            {/* Mobile User Profile (Visible when menu open on small screens) */}
            <div className="lg:hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white border border-slate-150 rounded-xl p-3 mt-2 mb-1 shadow-sm">
              <div className="flex items-center gap-3">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="" className="w-10 h-10 rounded-xl object-cover border border-emerald-200 shadow-sm" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200/50 flex items-center justify-center font-bold text-sm uppercase shadow-sm">
                    {currentUser.fullName.slice(0, 2)}
                  </div>
                )}
                <div>
                  <div className="text-sm font-extrabold text-slate-900">{currentUser.fullName}</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">
                    {currentUser.role === 'student' ? `${currentUser.course} курс, гр. ${currentUser.group}` : (currentUser.position || 'Член Комитета СНО')}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full sm:w-auto p-2 px-4 justify-center bg-red-50 hover:bg-red-100 text-red-750 text-sm font-bold rounded-lg border border-red-200 transition flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Выйти</span>
              </button>
            </div>

            <nav className="flex flex-col lg:flex-row gap-1 lg:gap-1" id="global-nav-tabs">
              
              <button
                onClick={() => { setCurrentTab("registry"); setShowSubForm(false); setIsMobileMenuOpen(false); }}
                id="nav-tab-registry"
                className={`flex items-center gap-2 lg:gap-1.5 py-3 lg:py-3 px-4 text-sm lg:text-xs font-extrabold uppercase lg:border-b-2 rounded-xl lg:rounded-none tracking-wider transition whitespace-nowrap cursor-pointer ${currentTab === "registry" && !showSubForm ? "bg-emerald-50 lg:bg-transparent border-emerald-700 text-emerald-800" : "lg:border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hover:bg-transparent"}`}
              >
                <Layers className="w-5 h-5 lg:w-4 lg:h-4 shrink-0 text-slate-550" />
                <span>Реестр достижений</span>
              </button>

              <button
                onClick={() => { setCurrentTab("journals"); setShowSubForm(false); setIsMobileMenuOpen(false); }}
                id="nav-tab-journals"
                className={`flex items-center gap-2 lg:gap-1.5 py-3 lg:py-3 px-4 text-sm lg:text-xs font-extrabold uppercase lg:border-b-2 rounded-xl lg:rounded-none tracking-wider transition whitespace-nowrap cursor-pointer ${currentTab === "journals" ? "bg-emerald-50 lg:bg-transparent border-emerald-700 text-emerald-800" : "lg:border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hover:bg-transparent"}`}
              >
                <BookOpen className="w-5 h-5 lg:w-4 lg:h-4 shrink-0 text-slate-550" />
                <span>Журналы кафедр</span>
              </button>

              <button
                onClick={() => { setCurrentTab("stats"); setShowSubForm(false); setIsMobileMenuOpen(false); }}
                id="nav-tab-stats"
                className={`flex items-center gap-2 lg:gap-1.5 py-3 lg:py-3 px-4 text-sm lg:text-xs font-extrabold uppercase lg:border-b-2 rounded-xl lg:rounded-none tracking-wider transition whitespace-nowrap cursor-pointer ${currentTab === "stats" ? "bg-emerald-50 lg:bg-transparent border-emerald-700 text-emerald-800" : "lg:border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hover:bg-transparent"}`}
              >
                <BarChart3 className="w-5 h-5 lg:w-4 lg:h-4 shrink-0 text-slate-550" />
                <span>Аналитика и Графики</span>
              </button>

              <button
                onClick={() => { setCurrentTab("profile"); setShowSubForm(false); setIsMobileMenuOpen(false); }}
                id="nav-tab-profile"
                className={`flex items-center gap-2 lg:gap-1.5 py-3 lg:py-3 px-4 text-sm lg:text-xs font-extrabold uppercase lg:border-b-2 rounded-xl lg:rounded-none tracking-wider transition whitespace-nowrap cursor-pointer ${currentTab === "profile" || showSubForm ? "bg-emerald-50 lg:bg-transparent border-emerald-700 text-emerald-800" : "lg:border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hover:bg-transparent"}`}
              >
                <User className="w-5 h-5 lg:w-4 lg:h-4 shrink-0 text-slate-550" />
                <span>Личный кабинет</span>
                {currentUnreadNotificationCount > 0 && currentUser?.role === "student" && (
                  <span className="bg-red-500 text-white font-bold leading-none text-xs lg:text-[9px] px-2 py-1 lg:px-1.5 lg:py-0.5 rounded-full ml-auto lg:ml-0">
                    {currentUnreadNotificationCount}
                  </span>
                )}
              </button>

              {/* SSS Activist admin view (Visible only in admin mode) */}
              {(currentUser?.role === "admin" || currentUser?.role === "curator" || currentUser?.role === "moderator") && (
                <button
                  onClick={() => { setCurrentTab("admin"); setShowSubForm(false); setIsMobileMenuOpen(false); }}
                  id="nav-tab-admin"
                  className={`flex items-center gap-2 lg:gap-1.5 py-3 lg:py-3 px-4 text-sm lg:text-xs font-extrabold uppercase lg:border-b-2 rounded-xl lg:rounded-none tracking-wider transition whitespace-nowrap cursor-pointer ${currentTab === "admin" ? "bg-purple-50 lg:bg-transparent border-purple-650 text-purple-800" : "lg:border-transparent text-slate-500 hover:text-slate-850 hover:bg-slate-100 lg:hover:bg-transparent"}`}
                >
                  <Shield className="w-5 h-5 lg:w-4 lg:h-4 shrink-0" />
                  <span>Модерация СНО</span>
                  {notifications.filter(n => n.studentId === activeModerator?.id && !n.isRead).length > 0 && (
                    <span className="bg-red-500 text-white font-bold leading-none text-xs lg:text-[9px] px-2 py-1 lg:px-1.5 lg:py-0.5 rounded-full ml-auto lg:ml-1">
                      {notifications.filter(n => n.studentId === activeModerator?.id && !n.isRead).length}
                    </span>
                  )}
                </button>
              )}

            </nav>

            {/* Print trigger guide info */}
            <div className="hidden lg:flex items-center gap-1 text-[10px] text-slate-400 italic">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Справки СНО БГЭУ формируются мгновенно</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Container Stage Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        
        {/* Conditional Stage Selection */}
        {showSubForm ? (
          // Student achievement application submission form page
          <AchievementForm
            currentUser={activeStudent}
            initialCategory={formCategory}
            onCancel={() => { setShowSubForm(false); setFormCategory(undefined); }}
            onSubmit={handleAddNewAchievement}
          />
        ) : (
          <>
            {currentTab === "registry" && (
              <Dashboard
                students={students}
                achievements={achievements}
                currentUser={currentUser}
                onOpenCertificate={(ach, stud) => setActiveCertData({ achievement: ach, student: stud })}
              />
            )}

            {currentTab === "journals" && (
              <SnoJournals
                students={students}
                achievements={achievements}
                currentUser={currentLoggedUser}
                onOpenCertificate={(ach, stud) => setActiveCertData({ achievement: ach, student: stud })}
              />
            )}

            {currentTab === "stats" && (
              <StatsDashboard
                students={students}
                achievements={achievements}
              />
            )}

            {currentTab === "profile" && (
              <StudentProfile
                currentUser={activeStudent}
                achievements={achievements}
                notifications={notifications}
                students={students}
                quizzes={quizzes}
                quizAttempts={quizAttempts}
                souvenirs={souvenirs}
                souvenirOrders={souvenirOrders}
                onOpenCertificate={(ach, stud) => setActiveCertData({ achievement: ach, student: stud })}
                onMarkNotificationRead={handleMarkAsRead}
                onAddNewClick={() => { setShowSubForm(true); setFormCategory(undefined); }}
                onAddNewScienceClick={() => { setShowSubForm(true); setFormCategory(ActivityCategory.Science); }}
                onCompleteQuiz={handleCompleteQuiz}
                onOrderSouvenir={handleOrderSouvenir}
                onUpdateAvatar={handleUpdateAvatar}
              />
            )}

            {currentTab === "admin" && (
              <AdminPanel
                students={students}
                achievements={achievements}
                quizzes={quizzes}
                quizAttempts={quizAttempts}
                souvenirs={souvenirs}
                souvenirOrders={souvenirOrders}
                onApprove={handleApproveAchievement}
                onReject={handleRejectAchievement}
                onAddStudent={handleAddStudent}
                onDeleteStudent={handleDeleteStudent}
                onResetDatabase={handleResetDatabase}
                currentModerator={activeModerator}
                onCreateQuiz={handleCreateQuiz}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onAwardConferencePoints={handleAwardConferencePoints}
                onUpdateUserRoleAndPosition={handleUpdateUserRoleAndPosition}
              />
            )}
          </>
        )}

      </main>

      {/* 3. Certificate viewer Modal overlay */}
      {activeCertData && (
        <CertificateModal
          achievement={activeCertData.achievement}
          student={activeCertData.student}
          onClose={() => setActiveCertData(null)}
        />
      )}

      {/* 4. Elegant Footer Info */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-1.5 leading-snug">
          <div>© 2026 Белорусский государственный экономический университет (БГЭУ)</div>
          <div>Единая информационная система учета достижений и научно-исследовательских работ СНО ФЭМ БГЭУ</div>
          <div className="text-[10px] text-slate-400 font-medium">Куратор: Совет молодых ученых БГЭУ | Кафедра экономики промышленных предприятий</div>
        </div>
      </footer>

    </div>
  );
}
