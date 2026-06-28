/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Student, Achievement, Notification, ApplicationStatus, Course, ActivityCategory, Quiz, QuizQuestion, QuizAttempt, Souvenir, SouvenirOrder } from "../types";
import { 
  CheckCircle2, XCircle, AlertCircle, Users, ClipboardList, 
  Shield, Trash2, UserPlus, RefreshCw, Trophy, Award, Gift, 
  HelpCircle, Plus, ChevronRight, FileText, Check, Volume2, Video, Sparkles, Sliders, Edit, Menu, X
} from "lucide-react";

interface AdminPanelProps {
  students: Student[];
  achievements: Achievement[];
  quizzes: Quiz[];
  quizAttempts: QuizAttempt[];
  souvenirs: Souvenir[];
  souvenirOrders: SouvenirOrder[];
  onApprove: (achievementId: string, moderatorName: string) => void;
  onReject: (achievementId: string, reason: string, moderatorName: string) => void;
  onAddStudent: (student: Omit<Student, "id" | "totalPoints">) => void;
  onDeleteStudent: (studentId: string) => void;
  onResetDatabase: () => void;
  currentModerator: Student;
  onCreateQuiz: (newQuiz: Quiz) => void;
  onUpdateOrderStatus: (orderId: string, status: 'completed' | 'cancelled') => void;
  onAwardConferencePoints: (studentId: string, type: 'participation' | 'win') => void;
  onUpdateUserRoleAndPosition: (studentId: string, role: 'student' | 'moderator' | 'admin' | 'curator' | 'dean' | 'deputy_dean' | 'nirs_dept', position: string, group: string, specialty: string) => void;
}

export default function AdminPanel({
  students = [],
  achievements = [],
  quizzes = [],
  quizAttempts = [],
  souvenirs = [],
  souvenirOrders = [],
  onApprove,
  onReject,
  onAddStudent,
  onDeleteStudent,
  onResetDatabase,
  currentModerator,
  onCreateQuiz,
  onUpdateOrderStatus,
  onAwardConferencePoints,
  onUpdateUserRoleAndPosition,
}: AdminPanelProps) {
  // Navigation tabs in moderator workspace
  const [activeTab, setActiveTab] = useState<"moderation" | "users" | "quiz-builder" | "souvenir-orders">("moderation");
  const [isMobileTabsOpen, setIsMobileTabsOpen] = useState(false);
  
  // States for Reject flow
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  // States for Add Student flow
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentCourse, setNewStudentCourse] = useState<Course>(Course.First);
  const [newStudentGroup, setNewStudentGroup] = useState("");
  const [newStudentSpecialty, setNewStudentSpecialty] = useState("Экономика и управление на предприятии");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentRole, setNewStudentRole] = useState<'student' | 'moderator' | 'admin' | 'curator' | 'dean' | 'deputy_dean' | 'nirs_dept'>("student");
  const [newStudentPosition, setNewStudentPosition] = useState("");
  const [newStudentDeptId, setNewStudentDeptId] = useState<number>(1);
  const [newStudentPassword, setNewStudentPassword] = useState("admin");
  const [userFormError, setUserFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Dynamic States for Quiz Builder
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDesc, setQuizDesc] = useState("");
  const [quizPointsAwarded, setQuizPointsAwarded] = useState<number>(30);
  const [tempQuestionsList, setTempQuestionsList] = useState<QuizQuestion[]>([]);
  const [quizBuilderError, setQuizBuilderError] = useState("");
  const [quizBuilderSuccess, setQuizBuilderSuccess] = useState("");

  // Current temp question builder state
  const [qText, setQText] = useState("");
  const [qOpt1, setQOpt1] = useState("");
  const [qOpt2, setQOpt2] = useState("");
  const [qOpt3, setQOpt3] = useState("");
  const [qOpt4, setQOpt4] = useState("");
  const [qCorrectIdx, setQCorrectIdx] = useState<number>(0);
  const [qExplanation, setQExplanation] = useState("");
  const [qMediaUrl, setQMediaUrl] = useState("");
  const [qMediaType, setQMediaType] = useState<'image' | 'video' | 'audio' | 'none'>('none');

  // Confirmation state overrides to bypass sandboxed iFrame native confirm dialog blocks
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [confirmingConfPoints, setConfirmingConfPoints] = useState<{ studentId: string; type: 'participation' | 'win' } | null>(null);
  const [confirmingDeleteStudentId, setConfirmingDeleteStudentId] = useState<string | null>(null);
  const [confirmingOrderId, setConfirmingOrderId] = useState<{ id: string; action: 'completed' | 'cancelled' } | null>(null);

  // User editing states
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<'student' | 'moderator' | 'admin' | 'curator' | 'dean' | 'deputy_dean' | 'nirs_dept'>('student');
  const [editPosition, setEditPosition] = useState("");
  const [editGroup, setEditGroup] = useState("");
  const [editSpecialty, setEditSpecialty] = useState("");

  // Filter pending items for achievement moderation tab
  const pendingAchievements = achievements.filter(a => a.status === ApplicationStatus.Pending);

  const handleApprove = (id: string) => {
    onApprove(id, currentModerator.fullName);
  };

  const startReject = (id: string) => {
    setRejectId(id);
    setRejectReason("");
    setRejectError("");
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      setRejectError("Укажите конкретную причину отклонения, чтобы студент исправил.");
      return;
    }
    if (rejectId) {
      onReject(rejectId, rejectReason, currentModerator.fullName);
      setRejectId(null);
      setRejectReason("");
    }
  };

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError("");
    setSuccessMsg("");

    if (!newStudentName.trim() || !newStudentGroup.trim() || !newStudentEmail.trim()) {
      setUserFormError("Пожалуйста, заполните все обязательные поля.");
      return;
    }

    if (!newStudentEmail.includes("@") || newStudentEmail.length < 5) {
      setUserFormError("Введите корректный академический адрес электронной почты.");
      return;
    }

    onAddStudent({
      fullName: newStudentName.trim(),
      course: newStudentCourse,
      group: newStudentGroup.trim(),
      specialty: newStudentSpecialty,
      email: newStudentEmail.toLowerCase().trim(),
      role: newStudentRole,
      position: newStudentPosition.trim() || undefined,
      departmentId: newStudentRole === "nirs_dept" ? newStudentDeptId : undefined,
      password: newStudentPassword.trim() || "admin"
    });

    setNewStudentName("");
    setNewStudentGroup("");
    setNewStudentEmail("");
    setNewStudentPosition("");
    setNewStudentPassword("admin");
    const roleLabel = newStudentRole === "student" ? "Студент" : "Академический сотрудник";
    setSuccessMsg(`${roleLabel} успешно занесен в реестр ФЭМ БГЭУ!`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // Add Question to Draft list
  const handleAddQuestionToQuizDraft = () => {
    if (!qText.trim() || !qOpt1.trim() || !qOpt2.trim() || !qOpt3.trim() || !qOpt4.trim()) {
      alert("Заполните текст вопроса и все 4 варианта ответа!");
      return;
    }
    if (!qExplanation.trim()) {
      alert("Пожалуйста, заполните разъяснение СНО для ответивших студентов.");
      return;
    }

    const newQ: QuizQuestion = {
      id: `question_${Date.now()}`,
      text: qText.trim(),
      options: [qOpt1.trim(), qOpt2.trim(), qOpt3.trim(), qOpt4.trim()],
      correctOptionIdx: qCorrectIdx,
      explanation: qExplanation.trim(),
      mediaUrl: qMediaUrl.trim() || undefined,
      mediaType: qMediaType !== 'none' ? qMediaType : undefined
    };

    setTempQuestionsList([...tempQuestionsList, newQ]);

    // Clear question builder fields for next input
    setQText("");
    setQOpt1("");
    setQOpt2("");
    setQOpt3("");
    setQOpt4("");
    setQCorrectIdx(0);
    setQExplanation("");
    setQMediaUrl("");
    setQMediaType('none');
  };

  // Remove question from draft
  const handleRemoveQuestionFromDraft = (index: number) => {
    const updated = [...tempQuestionsList];
    updated.splice(index, 1);
    setTempQuestionsList(updated);
  };

  // Publish Entire Quiz
  const handlePublishQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuizBuilderError("");
    setQuizBuilderSuccess("");

    if (!quizTitle.trim() || !quizDesc.trim()) {
      setQuizBuilderError("Пожалуйста, заполните заголовок и описание новой викторины СНО.");
      return;
    }

    if (tempQuestionsList.length === 0) {
      setQuizBuilderError("Добавьте хотя бы 1 заполненный вопрос в викторину!");
      return;
    }

    const newQuiz: Quiz = {
      id: `quiz_${Date.now()}`,
      title: quizTitle.trim(),
      description: quizDesc.trim(),
      pointsAwarded: quizPointsAwarded,
      questions: tempQuestionsList,
      createdAt: new Date().toISOString()
    };

    onCreateQuiz(newQuiz);
    
    // Reset builder states
    setQuizTitle("");
    setQuizDesc("");
    setQuizPointsAwarded(30);
    setTempQuestionsList([]);
    setQuizBuilderSuccess(`Викторина "${newQuiz.title}" успешно опубликована для всех студентов ФЭМ! Всем выслано уведомление. 🔥`);
    setTimeout(() => setQuizBuilderSuccess(""), 6000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Admin header */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 p-6 md:p-8 rounded-2xl text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-700/60 text-emerald-100 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-emerald-500/40">
              Куратор СНО ФЭМ БГЭУ
            </span>
          </div>
          <h1 id="admin-panel-title" className="text-2xl font-black mt-2">Панель управления деканата & СНО</h1>
          <p className="text-xs text-emerald-150 mt-1 max-w-xl">
            Вы вошли как <strong>{currentModerator.fullName}</strong>. Модерируйте заявки студентов на достижения, начисляйте баллы за научные конференции, публикуйте новые викторины и выдавайте мерч.
          </p>
        </div>
        
        {/* Reset tool */}
        {confirmingReset ? (
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 p-2 rounded-xl text-xs shrink-0">
            <span className="font-semibold text-amber-200">Сбросить всю базу?</span>
            <button
              onClick={() => {
                onResetDatabase();
                setConfirmingReset(false);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-md cursor-pointer text-[11px]"
            >
              Да
            </button>
            <button
              onClick={() => setConfirmingReset(false)}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-2.5 py-1 rounded-md cursor-pointer text-[11px]"
            >
              Отмена
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmingReset(true)}
            id="btn-reset-db"
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Сбросить БД к тестовой</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="md:hidden flex items-center justify-between bg-emerald-50 px-4 py-2 mt-2 rounded-xl border border-emerald-100 mb-2">
        <span className="text-sm font-bold text-emerald-800 uppercase tracking-widest">Разделы управления</span>
        <button 
          onClick={() => setIsMobileTabsOpen(!isMobileTabsOpen)}
          className="text-emerald-700 hover:text-emerald-900 focus:outline-none p-1"
        >
          {isMobileTabsOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div id="admin-tabs" className={`flex-col md:flex-row md:flex border-b border-slate-200 gap-1 ${isMobileTabsOpen ? 'flex' : 'hidden md:flex'}`}>
        <button
          onClick={() => { setActiveTab("moderation"); setIsMobileTabsOpen(false); }}
          className={`flex items-center gap-2 py-3 px-4 text-sm md:text-xs font-bold uppercase tracking-wider md:border-b-2 rounded-xl md:rounded-none whitespace-nowrap transition cursor-pointer ${activeTab === "moderation" ? "bg-emerald-50 md:bg-transparent border-emerald-700 text-emerald-800" : "md:border-transparent text-slate-500 hover:text-slate-850 hover:bg-slate-50 md:hover:bg-transparent"}`}
        >
          <ClipboardList className="w-5 h-5 md:w-4 md:h-4 text-emerald-600" />
          <span>Модерация заявок</span>
          {pendingAchievements.length > 0 && (
            <span id="badge-pending-count" className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full ml-auto md:ml-0">
              {pendingAchievements.length}
            </span>
          )}
        </button>
        
        <button
          onClick={() => { setActiveTab("users"); setIsMobileTabsOpen(false); }}
          className={`flex items-center gap-2 py-3 px-4 text-sm md:text-xs font-bold uppercase tracking-wider md:border-b-2 rounded-xl md:rounded-none whitespace-nowrap transition cursor-pointer ${activeTab === "users" ? "bg-emerald-50 md:bg-transparent border-emerald-700 text-emerald-800" : "md:border-transparent text-slate-500 hover:text-slate-850 hover:bg-slate-50 md:hover:bg-transparent"}`}
        >
          <Users className="w-5 h-5 md:w-4 md:h-4 text-emerald-600" />
          <span>Картотека & Конференции</span>
        </button>

        <button
          onClick={() => { setActiveTab("quiz-builder"); setIsMobileTabsOpen(false); }}
          className={`flex items-center gap-2 py-3 px-4 text-sm md:text-xs font-bold uppercase tracking-wider md:border-b-2 rounded-xl md:rounded-none whitespace-nowrap transition cursor-pointer ${activeTab === "quiz-builder" ? "bg-emerald-50 md:bg-transparent border-emerald-700 text-emerald-800" : "md:border-transparent text-slate-500 hover:text-slate-850 hover:bg-slate-50 md:hover:bg-transparent"}`}
        >
          <HelpCircle className="w-5 h-5 md:w-4 md:h-4 text-emerald-600" />
          <span>Конструктор Викторин</span>
          <span className="bg-amber-100 text-amber-900 border border-amber-250 text-[9px] font-bold px-1.5 rounded-full ml-auto md:ml-0">Создать</span>
        </button>

        <button
          onClick={() => { setActiveTab("souvenir-orders"); setIsMobileTabsOpen(false); }}
          className={`flex items-center gap-2 py-3 px-4 text-sm md:text-xs font-bold uppercase tracking-wider md:border-b-2 rounded-xl md:rounded-none whitespace-nowrap transition cursor-pointer ${activeTab === "souvenir-orders" ? "bg-emerald-50 md:bg-transparent border-emerald-700 text-emerald-800" : "md:border-transparent text-slate-500 hover:text-slate-850 hover:bg-slate-50 md:hover:bg-transparent"}`}
        >
          <Gift className="w-5 h-5 md:w-4 md:h-4 text-emerald-600" />
          <span>Выдача Сувениров</span>
          {souvenirOrders.filter(o => o.status === 'pending').length > 0 && (
            <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full ml-auto md:ml-0">
              {souvenirOrders.filter(o => o.status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      {/* MODERATION TAB CONTENT: APPROVED VS REJECTED */}
      {activeTab === "moderation" && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 px-1">Заявки студентов, ожидающие проверки ({pendingAchievements.length})</h2>

          {pendingAchievements.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400 space-y-3 shadow-3xs">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <div className="text-sm font-bold text-slate-805">Все заявки проверены комитетом СНО!</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">Нет входящих запросов от студентов факультета экономики и менеджмента на данный момент.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4" id="admin-applications-list">
              {pendingAchievements.map((item) => (
                <div key={item.id} className="bg-white border border-slate-100 rounded-2xl p-6 transition shadow-3xs hover:shadow-2xs flex flex-col justify-between gap-4 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
                  <div className="space-y-2">
                    
                    {/* Header bar of card */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-50 pb-3 pl-1">
                      <div>
                        <span className="text-xs font-semibold text-slate-400 block">Заявитель-соискатель СНО:</span>
                        <strong className="text-sm text-slate-800 ">{item.studentName}</strong>
                        <span className="text-xs text-slate-500 ml-2">({item.course}, гр. {students.find(s => s.id === item.studentId)?.group || "N/A"})</span>
                      </div>
                      <span className="bg-emerald-50 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-150 uppercase font-mono tracking-wider">
                        {item.category}
                      </span>
                    </div>

                    {/* Title and Content */}
                    <div className="pt-2 pl-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Тема научной работы / достижения</span>
                      <h3 className="font-extrabold text-slate-900 text-sm mt-0.5">{item.title}</h3>
                      {item.supervisor && (
                        <p className="text-xs text-slate-650 mt-1.5 bg-slate-50/70 p-2 rounded-lg border border-slate-100 italic">
                          <strong>Научный руководитель:</strong> {item.supervisor}
                        </p>
                      )}
                      
                      <div className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-xl p-3.5 mt-3">
                        <strong className="block text-[10px] text-slate-450 uppercase mb-1 tracking-wider font-bold">Краткая аннотация (для верификационной комиссии):</strong>
                        <p className="leading-relaxed font-sans">{item.description}</p>
                      </div>
                    </div>

                    {/* Proof Section */}
                    <div className="pt-2 flex flex-col sm:flex-row gap-3 text-xs text-slate-550 bg-amber-50/20 border border-amber-100/40 p-3.5 rounded-xl mt-2 pl-4">
                      <div className="flex-1">
                        <strong className="text-[11px] text-slate-700 ">Подтверждающие реквизиты (Скан-копия/Ссылка на ВАК):</strong>
                        <p className="text-slate-600 mt-1 font-mono text-[11px]">{item.proofText || "Не указаны реквизиты"}</p>
                      </div>
                      {item.proofUrl && (
                        <div className="shrink-0 pt-1 sm:pt-0">
                          <a 
                            href={item.proofUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-1.5 text-emerald-800 hover:text-white hover:bg-emerald-800 font-bold transition text-xs bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-3xs cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Открыть скрин-доказательство</span>
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Meta statistics bar */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 font-mono pl-1">
                      <span>Подано в систему: {item.date}</span>
                      <span className="text-emerald-950 bg-emerald-100 px-2.5 py-1 rounded-lg font-black border border-emerald-250">Оценка: +{item.points} баллов</span>
                    </div>

                  </div>

                  {/* Actions buttons */}
                  <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3">
                    {rejectId === item.id ? (
                      <form onSubmit={handleRejectSubmit} className="flex-1 flex flex-col gap-2">
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={(e) => { setRejectReason(e.target.value); setRejectError(""); }}
                          placeholder="Укажите замечание студенту (например, 'Замените архив на прямую ссылку-слайд презентации')"
                          className="w-full border border-red-200 focus:outline-hidden focus:border-red-500 rounded-xl px-4 py-2 text-xs text-slate-850"
                        />
                        {rejectError && <p className="text-red-500 text-[10px] font-semibold">{rejectError}</p>}
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setRejectId(null)}
                            className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:bg-slate-100 :bg-slate-700 transition cursor-pointer"
                          >
                            Отмена
                          </button>
                          <button
                            type="submit"
                            className="bg-red-650 hover:bg-red-750 text-white font-bold px-4 py-1.5 rounded-lg text-xs cursor-pointer transition"
                          >
                            Отклонить заявку
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <button
                          onClick={() => startReject(item.id)}
                          className="flex items-center justify-center gap-1.5 border border-red-200 hover:bg-red-50 text-red-650 font-bold py-2 px-4 rounded-xl text-xs transition cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>На доработку</span>
                        </button>
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="flex items-center justify-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-black py-2 px-4 rounded-xl text-xs shadow-xs transition cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Одобрить и Начислить баллы</span>
                        </button>
                      </>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB USERS AND QUICK CONFERENCE POINTS */}
      {activeTab === "users" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left panel: Add Student manually */}
          <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-6 h-fit shadow-3xs">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <UserPlus className="w-4.5 h-4.5 text-emerald-800" />
              <h3 className="font-extrabold text-slate-900 text-sm">Регистрация в реестре СНО</h3>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="space-y-4 text-xs">
              {userFormError && (
                <div className="bg-red-50 text-red-600 p-2.5 rounded-lg font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{userFormError}</span>
                </div>
              )}
              {successMsg && (
                <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-lg font-bold border border-emerald-150">
                  {successMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">ФИО Обучающегося</label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Например: Некрасов Илья Сидорович"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Курс</label>
                  <select
                    value={newStudentCourse}
                    onChange={(e) => setNewStudentCourse(e.target.value as Course)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 cursor-pointer focus:outline-hidden"
                  >
                    {Object.values(Course).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Группа</label>
                  <input
                    type="text"
                    value={newStudentGroup}
                    onChange={(e) => setNewStudentGroup(e.target.value)}
                    placeholder="25ДКС"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Специальность / Кафедра</label>
                <input
                  type="text"
                  value={newStudentSpecialty}
                  onChange={(e) => setNewStudentSpecialty(e.target.value)}
                  placeholder="Например: кафедра экономики промышленных предприятий"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Электронная почта</label>
                <input
                  type="email"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  placeholder="address@domain.com"
                  className="w-full border border-slate-200 bg-white rounded-xl px-3.5 py-2 text-xs focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Уровень доступа (Роль)</label>
                <div className="space-y-1.5 pt-1">
                  <label className="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer text-[11px]">
                    <input
                      type="radio"
                      name="role"
                      checked={newStudentRole === "student"}
                      onChange={() => setNewStudentRole("student")}
                    />
                    <span>Студент (Реестр НИРС)</span>
                  </label>
                  <label className="flex items-center gap-1.5 font-bold text-teal-800 cursor-pointer text-[11px]">
                    <input
                      type="radio"
                      name="role"
                      checked={newStudentRole === "nirs_dept"}
                      onChange={() => setNewStudentRole("nirs_dept")}
                    />
                    <span>Ответственный за НИРС кафедры</span>
                  </label>
                  <label className="flex items-center gap-1.5 font-bold text-blue-800 cursor-pointer text-[11px]">
                    <input
                      type="radio"
                      name="role"
                      checked={newStudentRole === "deputy_dean"}
                      onChange={() => setNewStudentRole("deputy_dean")}
                    />
                    <span>Заместитель декана ФЭМ</span>
                  </label>
                  <label className="flex items-center gap-1.5 font-bold text-red-800 cursor-pointer text-[11px]">
                    <input
                      type="radio"
                      name="role"
                      checked={newStudentRole === "dean"}
                      onChange={() => setNewStudentRole("dean")}
                    />
                    <span>Декан Факультета</span>
                  </label>
                  <label className="flex items-center gap-1.5 font-bold text-purple-900 cursor-pointer text-[11px]">
                    <input
                      type="radio"
                      name="role"
                      checked={newStudentRole === "curator"}
                      onChange={() => setNewStudentRole("curator")}
                    />
                    <span>Куратор СНО / Научный руководитель</span>
                  </label>
                </div>
              </div>

              {newStudentRole !== "student" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Официальная должность</label>
                    <input
                      type="text"
                      value={newStudentPosition}
                      onChange={(e) => setNewStudentPosition(e.target.value)}
                      placeholder="Например: зам. председателя СНО ФЭМ БГЭУ"
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-hidden"
                    />
                  </div>

                  {newStudentRole === "nirs_dept" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">ID Кафедры</label>
                      <input
                        type="number"
                        value={newStudentDeptId}
                        onChange={(e) => setNewStudentDeptId(Number(e.target.value))}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-hidden"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Пароль для входа</label>
                    <input
                      type="text"
                      value={newStudentPassword}
                      onChange={(e) => setNewStudentPassword(e.target.value)}
                      placeholder="Пароль"
                      className="w-full border border-slate-200 bg-white rounded-xl px-3.5 py-2 text-xs focus:outline-hidden font-mono"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-800 hover:bg-emerald-950 text-white font-bold py-2.5 rounded-xl transition duration-150 cursor-pointer shadow-xs text-xs"
              >
                Записать сотрудника в базу
              </button>
            </form>
          </div>

          {/* Right panel: Live Students Table & Conference Points Action Buttons */}
          <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-6 shadow-3xs overflow-x-auto">
            <div className="mb-4 border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">Сводная картотека факультета ({students.length})</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Начисляйте кураторские баллы за научные выступления и конференции (Win: +50б, Участие: +20б) мгновенно!
              </p>
            </div>

            <table className="w-full text-xs text-left border-collapse" id="admin-students-table">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-2">Студент</th>
                  <th className="py-2.5 px-2">Курс / Группа</th>
                  <th className="py-2.5 px-2 text-center">Свободный баланс</th>
                  <th className="py-2.5 px-2 text-center">Статус / Должность</th>
                  <th className="py-2.5 px-2 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students.map((student) => {
                  const isEditing = editingStudentId === student.id;
                  
                  if (isEditing) {
                    return (
                      <tr key={student.id} className="bg-slate-50/70">
                        <td colSpan={5} className="py-4 px-2">
                          <div className="bg-white border-2 border-emerald-700/35 rounded-2xl p-4 space-y-4 shadow-xs">
                            <div className="text-xs font-black text-emerald-950 flex items-center gap-2">
                              <Sliders className="w-4.5 h-4.5 text-emerald-700" />
                              <span>Редактирование прав доступа: {student.fullName}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">
                                  Академическая группа
                                </label>
                                <input
                                  type="text"
                                  value={editGroup}
                                  onChange={e => setEditGroup(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-700 rounded-xl px-3 py-2 text-xs focus:outline-hidden"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">
                                  Специальность / Кафедра
                                </label>
                                <input
                                  type="text"
                                  value={editSpecialty}
                                  onChange={e => setEditSpecialty(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-700 rounded-xl px-3 py-2 text-xs focus:outline-hidden"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">
                                  Роль доступа (Уровень прав)
                                </label>
                                <select
                                  value={editRole}
                                  onChange={e => setEditRole(e.target.value as any)}
                                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-700 rounded-xl px-2 py-2 text-xs focus:outline-hidden cursor-pointer"
                                >
                                  <option value="student">Студент ФЭМ (Реестр НИРС)</option>
                                  <option value="moderator">Член Комитета СНО (Админ права)</option>
                                  <option value="admin">Председатель СНО ФЭМ</option>
                                  <option value="curator">Куратор СНО / Деканат (Curator права)</option>
                                  <option value="nirs_dept">Ответственный за НИРС кафедры</option>
                                  <option value="dean">Декан</option>
                                  <option value="deputy_dean">Заместитель декана</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">
                                  Официальная Должность
                                </label>
                                <input
                                  type="text"
                                  value={editPosition}
                                  onChange={e => setEditPosition(e.target.value)}
                                  placeholder="Например: зам. председателя СНО ФЭМ БГЭУ"
                                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-700 rounded-xl px-3 py-2 text-xs focus:outline-hidden"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/40">
                              <button
                                type="button"
                                onClick={() => {
                                  onUpdateUserRoleAndPosition(student.id, editRole, editPosition, editGroup, editSpecialty);
                                  setEditingStudentId(null);
                                }}
                                className="bg-emerald-800 hover:bg-emerald-950 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs transition cursor-pointer"
                              >
                                Сохранить изменения
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingStudentId(null)}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs transition cursor-pointer"
                              >
                                Отменить
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-2">
                        <div className="font-black text-slate-900 ">{student.fullName}</div>
                        <div className="text-[10px] text-slate-400 italic max-w-2xs truncate">{student.specialty}</div>
                        <div className="text-[9px] text-slate-500 font-mono mt-0.5">{student.email}</div>
                      </td>
                      <td className="py-4 px-2 text-slate-700 whitespace-nowrap">
                        <div className="font-semibold">{student.course}</div>
                        <div className="text-[10px] font-mono text-slate-450">гр. {student.group}</div>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-150 px-2 rounded-lg font-black font-mono">
                          {student.totalPoints} б.
                        </span>
                      </td>
                      <td className="py-4 px-2 text-center">
                        {student.role === 'student' ? (
                          <div className="flex items-center justify-center">
                            {confirmingConfPoints?.studentId === student.id ? (
                              <div className="flex items-center gap-1.5 bg-amber-50 p-1.5 rounded-lg border border-amber-200/60 max-w-xs">
                                <span className="text-[9px] font-black text-amber-900 leading-tight">
                                  Начислить {confirmingConfPoints.type === 'win' ? "+50б" : "+20б"}?
                                </span>
                                <button
                                  onClick={() => {
                                    onAwardConferencePoints(student.id, confirmingConfPoints.type);
                                    setConfirmingConfPoints(null);
                                  }}
                                  className="bg-emerald-800 text-white font-extrabold px-2 py-0.5 rounded text-[9px] hover:bg-emerald-950 transition cursor-pointer"
                                >
                                  Да
                                </button>
                                <button
                                  onClick={() => setConfirmingConfPoints(null)}
                                  className="bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded text-[9px] hover:bg-slate-300 transition cursor-pointer"
                                >
                                  Нет
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setConfirmingConfPoints({ studentId: student.id, type: 'participation' })}
                                  className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold px-1.5 py-1 rounded-lg text-[10px] transition cursor-pointer"
                                  title="Участие с докладом"
                                >
                                  <span>+20б</span>
                                </button>
                                <button
                                  onClick={() => setConfirmingConfPoints({ studentId: student.id, type: 'win' })}
                                  className="bg-emerald-800 hover:bg-emerald-950 text-white font-black px-1.5 py-1 rounded-lg text-[10px] transition cursor-pointer"
                                  title="🏆 Победа / Диплом 1-3 степени"
                                >
                                  <span>🏆 +50б</span>
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="bg-purple-100 text-purple-800 border border-purple-200 rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-wide">
                            {student.position || "Сотрудник СНО"}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-2 text-right">
                        <div className="flex justify-end items-center gap-1">
                          
                          {/* Inline Sliders Edit Button */}
                          <button
                            onClick={() => {
                              setEditingStudentId(student.id);
                              setEditRole(student.role as any);
                              setEditPosition(student.position || "");
                              setEditGroup(student.group);
                              setEditSpecialty(student.specialty);
                            }}
                            className="text-slate-400 hover:text-emerald-800 hover:bg-emerald-50 p-1.5 rounded-lg transition shrink-0"
                            title="Редактировать роль и должность"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>

                          {student.id !== "admin_nevdah" && student.email !== "Sashanevdah2010@gmail.com" ? (
                            <>
                              {confirmingDeleteStudentId === student.id ? (
                                <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-150">
                                  <span className="text-[9px] font-bold text-red-700">Исключить?</span>
                                  <button
                                    onClick={() => {
                                      onDeleteStudent(student.id);
                                      setConfirmingDeleteStudentId(null);
                                    }}
                                    className="bg-red-600 text-white font-bold px-2 py-0.5 rounded text-[9px] cursor-pointer"
                                  >
                                    Да
                                  </button>
                                  <button
                                    onClick={() => setConfirmingDeleteStudentId(null)}
                                    className="bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded text-[9px] cursor-pointer"
                                  >
                                    Нет
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmingDeleteStudentId(student.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition shrink-0"
                                  title="Удалить студента"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          ) : (
                            <span className="text-slate-350 text-[9px] font-mono select-none bg-slate-100 px-1.5 py-0.5 rounded">ЗамПредСНО</span>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* QUIZ BUILDER TAB - INTEGRATED DESIGN */}
      {activeTab === "quiz-builder" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left panel quiz master metadata and questions draft */}
          <form onSubmit={handlePublishQuizSubmit} className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-6 h-fit shadow-3xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
              <h3 className="font-extrabold text-slate-900 text-sm">Новая викторина СНО ФЭМ</h3>
            </div>

            {quizBuilderError && (
              <div className="bg-red-50 text-red-650 p-2.5 rounded-lg font-medium flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4" />
                <span>{quizBuilderError}</span>
              </div>
            )}

            {quizBuilderSuccess && (
              <div className="bg-emerald-50 text-emerald-800 p-4 border border-emerald-150 rounded-xl space-y-1.5 text-xs">
                <div className="font-black flex items-center gap-1 text-emerald-950">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-700" />
                  <span>Успех публикации!</span>
                </div>
                <p>{quizBuilderSuccess}</p>
              </div>
            )}

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Наименование викторины</label>
                <input
                  type="text"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="Например: Основы ВАК планирования"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Краткое описание / Требования</label>
                <textarea
                  value={quizDesc}
                  onChange={(e) => setQuizDesc(e.target.value)}
                  placeholder="Опишите цель викторины, количество вопросов и условия."
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 h-20 focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Очки за успешное прохождение (б.)</label>
                <input
                  type="number"
                  value={quizPointsAwarded}
                  onChange={(e) => setQuizPointsAwarded(Number(e.target.value))}
                  placeholder="30"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-hidden focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Questions Draft tracker list */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 ">
                <span>Вопросы в черновике ({tempQuestionsList.length})</span>
                {tempQuestionsList.length > 0 && (
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-250">Готово к ВАК</span>
                )}
              </div>

              {tempQuestionsList.length === 0 ? (
                <div className="border border-dashed border-slate-150 p-6 rounded-xl text-center text-slate-400 text-[11px] font-medium italic">
                  Черновик пуст. Наполните форму вопроса справа и добавьте её в этот список.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {tempQuestionsList.map((q, idx) => (
                    <div key={q.id} className="bg-slate-50 border border-slate-150 p-3 rounded-xl text-xs space-y-1.5">
                      <div className="flex justify-between items-start gap-1">
                        <strong className="text-slate-800 line-clamp-2">#{idx+1}: {q.text}</strong>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestionFromDraft(idx)}
                          className="text-red-500 hover:text-red-700 p-0.5"
                          title="Удалить"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Указан верный индекс: Option {q.correctOptionIdx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={tempQuestionsList.length === 0}
              className={`w-full py-2.5 rounded-xl text-xs font-black transition ${
                tempQuestionsList.length > 0 
                  ? "bg-emerald-800 hover:bg-emerald-950 text-white cursor-pointer" 
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              Опубликовать викторину для ФЭМ
            </button>
          </form>

          {/* Right panel question builder interface */}
          <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-6 shadow-3xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <HelpCircle className="w-4.5 h-4.5 text-emerald-700" />
              <h3 className="font-extrabold text-slate-900 text-sm">Интегрированный редактор вопросов</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* Question Text block */}
              <div className="space-y-3.5 md:col-span-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Формулировка вопроса</label>
                  <input
                    type="text"
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                    placeholder="Например: Какое ВАК-издание БГЭУ было основано в 1994 году?"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* 4 Choices Form */}
              <div className="space-y-2.5">
                <span className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-0.5">Разработка вариантов ответов:</span>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Вар. №1</label>
                  <input
                    type="text"
                    value={qOpt1}
                    onChange={(e) => setQOpt1(e.target.value)}
                    placeholder="Белорусский экономический журнал"
                    className="w-full border border-slate-250 rounded-lg px-3 py-1.5 text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Вар. №2</label>
                  <input
                    type="text"
                    value={qOpt2}
                    onChange={(e) => setQOpt2(e.target.value)}
                    placeholder="Вестник БГЭУ"
                    className="w-full border border-slate-250 rounded-lg px-3 py-1.5 text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Вар. №3</label>
                  <input
                    type="text"
                    value={qOpt3}
                    onChange={(e) => setQOpt3(e.target.value)}
                    placeholder="Труды БГЭУ"
                    className="w-full border border-slate-250 rounded-lg px-3 py-1.5 text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Вар. №4</label>
                  <input
                    type="text"
                    value={qOpt4}
                    onChange={(e) => setQOpt4(e.target.value)}
                    placeholder="Новая экономика ФЭМ"
                    className="w-full border border-slate-250 rounded-lg px-3 py-1.5 text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Core validator configuration */}
              <div className="space-y-3">
                <span className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-0.5">Настройки правильного ключа & ВАК:</span>
                
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Индекс правильного ответа</label>
                  <select
                    value={qCorrectIdx}
                    onChange={(e) => setQCorrectIdx(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 cursor-pointer focus:outline-hidden"
                  >
                    <option value={0}>Выбор №1 (Верный)</option>
                    <option value={1}>Выбор №2 (Верный)</option>
                    <option value={2}>Выбор №3 (Верный)</option>
                    <option value={3}>Выбор №4 (Верный)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Медиа контент (Ссылка на файл)</label>
                  <input
                    type="text"
                    value={qMediaUrl}
                    onChange={(e) => setQMediaUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-example..."
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Тип медиафайла</label>
                  <div className="flex gap-3 pt-1">
                    <label className="flex items-center gap-1 cursor-pointer font-medium text-slate-650">
                      <input type="radio" name="media" checked={qMediaType === 'none'} onChange={() => setQMediaType('none')} />
                      <span>Без медиа</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer font-medium text-slate-650">
                      <input type="radio" name="media" checked={qMediaType === 'image'} onChange={() => setQMediaType('image')} />
                      <span>Фото</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer font-medium text-slate-650">
                      <input type="radio" name="media" checked={qMediaType === 'video'} onChange={() => setQMediaType('video')} />
                      <span>Видео</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer font-medium text-slate-650">
                      <input type="radio" name="media" checked={qMediaType === 'audio'} onChange={() => setQMediaType('audio')} />
                      <span>Звук</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Educational Explanation Box */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1">Разъяснение правильности ответа СНО (студент увидит после клика)</label>
                <textarea
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  placeholder="Пример: Белорусский экономический журнал был учрежден совместно Министерством экономики, БГЭУ и Академией наук в 1994 году с целью популяризации академической науки."
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 h-18 text-xs focus:outline-hidden focus:border-emerald-600"
                />
              </div>

            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-end">
              <button
                type="button"
                onClick={handleAddQuestionToQuizDraft}
                className="bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition shadow-3xs"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить вопрос в черновик ({tempQuestionsList.length + 1})</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* SHOP SOUVENIRS ORDERS HUB TAB */}
      {activeTab === "souvenir-orders" && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 px-1">Заказы сувениров на выдачу в Совете СНО ФЭМ БГЭУ</h2>

          {souvenirOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400 space-y-3 shadow-3xs">
              <Gift className="w-12 h-12 text-emerald-500 mx-auto" />
              <div className="text-sm font-bold text-slate-805">История обменов чиста</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">На данный момент студенты еще не производили обмен баллов на ручки СНО ФЭМ, флешки или блокноты.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-3xs overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-650 min-w-[600px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Код обмена</th>
                    <th className="py-3 px-3">Студент ФЭМ</th>
                    <th className="py-3 px-3">Наименование сувенира</th>
                    <th className="py-3 px-3">Стоимость</th>
                    <th className="py-3 px-3">Дата заказа</th>
                    <th className="py-3 px-3">Текущий статус</th>
                    <th className="py-3 px-3 text-right">Модерация выдачи</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-105">
                  {souvenirOrders.map((ord) => {
                    let statusLabel = null;
                    if (ord.status === 'pending') {
                      statusLabel = <span className="bg-amber-50 text-amber-700 font-bold border border-amber-200 px-2 py-0.5 rounded-md text-[10px]">⌛ Требуется выдача</span>;
                    } else if (ord.status === 'completed') {
                      statusLabel = <span className="bg-emerald-50 text-emerald-800 font-bold border border-emerald-150 px-2 py-0.5 rounded-md text-[10px]">✅ Выдано в СНО</span>;
                    } else if (ord.status === 'cancelled') {
                      statusLabel = <span className="bg-red-50 text-red-700 font-bold border border-red-150 px-2 py-0.5 rounded-md text-[10px] line-through">❌ Возвращено</span>;
                    }

                    return (
                      <tr key={ord.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-3 font-mono text-[10px] text-slate-400">{ord.id}</td>
                        <td className="py-3.5 px-3 font-bold text-slate-800 ">{ord.studentName}</td>
                        <td className="py-3.5 px-3 font-semibold text-slate-800 ">{ord.souvenirName}</td>
                        <td className="py-3.5 px-3 font-bold text-emerald-800 font-mono">{ord.cost} б.</td>
                        <td className="py-3.5 px-3 text-slate-450">{ord.date}</td>
                        <td className="py-3.5 px-3">{statusLabel}</td>
                        <td className="py-3.5 px-3 text-right">
                          {ord.status === 'pending' ? (
                            <div className="flex justify-end items-center">
                              {confirmingOrderId?.id === ord.id ? (
                                <div className="flex items-center gap-1.5 bg-amber-50 p-1 rounded-md border border-amber-200">
                                  <span className="text-[10px] text-amber-900 font-bold leading-tight">
                                    {confirmingOrderId.action === 'completed' ? "Выдать?" : "Отменить?"}
                                  </span>
                                  <button
                                    onClick={() => {
                                      onUpdateOrderStatus(ord.id, confirmingOrderId.action);
                                      setConfirmingOrderId(null);
                                    }}
                                    className="bg-emerald-800 hover:bg-emerald-950 text-white font-bold px-2 py-0.5 rounded text-[10px] cursor-pointer transition"
                                  >
                                    Да
                                  </button>
                                  <button
                                    onClick={() => setConfirmingOrderId(null)}
                                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px] cursor-pointer transition"
                                  >
                                    Нет
                                  </button>
                                </div>
                              ) : (
                                <div className="flex gap-1 justify-end">
                                  <button
                                    onClick={() => setConfirmingOrderId({ id: ord.id, action: 'cancelled' })}
                                    className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold px-2.5 py-1 rounded-lg text-[10px] transition cursor-pointer"
                                  >
                                    <span>Отменить</span>
                                  </button>
                                  <button
                                    onClick={() => setConfirmingOrderId({ id: ord.id, action: 'completed' })}
                                    className="bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold px-2.5 py-1 rounded-lg text-[10px] transition cursor-pointer"
                                  >
                                    <span>✔ Выдать</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[10px] italic">Операция завершена БГЭУ</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
