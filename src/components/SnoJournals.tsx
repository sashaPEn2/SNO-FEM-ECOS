/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Student, Achievement, Course, ApplicationStatus } from "../types";
import { 
  BookOpen, 
  Search, 
  Printer, 
  Lock, 
  ShieldCheck, 
  FileText, 
  CheckCircle,
  TrendingUp, 
  Users, 
  Award,
  ArrowRight,
  GraduationCap
} from "lucide-react";

interface SnoJournalsProps {
  students: Student[];
  achievements: Achievement[];
  currentUser: Student | null;
  onOpenCertificate: (achievement: Achievement, student: Student) => void;
}

export const DEPARTMENTS = [
  { id: 1, name: "Кафедра экономики промышленных предприятий", code: "ЭПП" },
  { id: 2, name: "Кафедра экономики и управления предприятиями", code: "ЭУП" },
  { id: 3, name: "Кафедра национальной экономики и государственного управления", code: "НЭиГУ" },
  { id: 4, name: "Кафедра планирования и прогнозирования", code: "ПиП" }
];

export function getDepartmentInfo(specialty: string) {
  const spec = (specialty || "").toLowerCase();
  if (spec.includes("промыш") || spec.includes("предприят") || spec.includes("деу") || spec.includes("дэу")) {
    return DEPARTMENTS[0];
  } else if (spec.includes("менедж") || spec.includes("управлен") || spec.includes("жку") || spec.includes("инновац") || spec.includes("ку")) {
    return DEPARTMENTS[1];
  } else if (spec.includes("национал") || spec.includes("государствен") || spec.includes("мнэ") || spec.includes("дгп")) {
    return DEPARTMENTS[2];
  } else {
    return DEPARTMENTS[3];
  }
}

export default function SnoJournals({ students, achievements, currentUser, onOpenCertificate }: SnoJournalsProps) {
  const [selectedDeptId, setSelectedDeptId] = useState<number | "master">(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<number | "all">("all");

  // Only student role is blocked. curator, dean, deputy_dean, nirs_dept have access.
  // Master combined ledger is restricted to curator, dean, deputy_dean, admin.
  const hasMasterAccess = currentUser && (
    currentUser.role === "curator" ||
    currentUser.role === "dean" ||
    currentUser.role === "deputy_dean" ||
    currentUser.role === "admin"
  );

  // If user is a student, we block screen entirely
  const isAuthorized = currentUser && (
    currentUser.role === "curator" ||
    currentUser.role === "dean" ||
    currentUser.role === "deputy_dean" ||
    currentUser.role === "nirs_dept" ||
    currentUser.role === "admin" ||
    currentUser.role === "moderator"
  );

  // Filter approved achievements
  const approvedAchievements = useMemo(() => {
    return achievements.filter(ach => ach.status === ApplicationStatus.Approved);
  }, [achievements]);

  // Map students to their computed departments
  const studentsWithDept = useMemo(() => {
    return students.map(student => ({
      ...student,
      dept: getDepartmentInfo(student.specialty)
    }));
  }, [students]);

  // Map achievements to their respective department (based on student department)
  const achievementsWithDept = useMemo(() => {
    return approvedAchievements.map(ach => {
      const associatedStudent = students.find(s => s.id === ach.studentId);
      const studentDept = associatedStudent ? getDepartmentInfo(associatedStudent.specialty) : DEPARTMENTS[3];
      return {
        ...ach,
        dept: studentDept,
        studentObj: associatedStudent
      };
    });
  }, [approvedAchievements, students]);

  // Compute stats for each department
  const departmentStats = useMemo(() => {
    return DEPARTMENTS.map(dept => {
      const deptStudents = studentsWithDept.filter(s => s.dept.id === dept.id);
      const studentIds = deptStudents.map(s => s.id);
      
      const deptAchievements = achievementsWithDept.filter(ach => studentIds.includes(ach.studentId));
      const totalPoints = deptAchievements.reduce((sum, curr) => sum + curr.points, 0);

      return {
        ...dept,
        studentsCount: deptStudents.length,
        achievementsCount: deptAchievements.length,
        totalPoints
      };
    });
  }, [studentsWithDept, achievementsWithDept]);

  // Filter list of achievements to show in currently selected journal
  const activeJournalAchievements = useMemo(() => {
    let list = achievementsWithDept;
    if (selectedDeptId !== "master") {
      list = achievementsWithDept.filter(ach => ach.dept.id === selectedDeptId);
    }

    if (selectedMonth !== "all") {
      list = list.filter(ach => {
        const dateStr = ach.approvedDate || ach.date;
        if (!dateStr) return false;
        const date = new Date(dateStr);
        return date.getMonth() + 1 === selectedMonth;
      });
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      list = list.filter(item => 
        item.studentName.toLowerCase().includes(query) ||
        item.title.toLowerCase().includes(query) ||
        (item.supervisor && item.supervisor.toLowerCase().includes(query))
      );
    }

    return list;
  }, [achievementsWithDept, selectedDeptId, selectedMonth, searchQuery]);

  // Trigger print view of the active journal (or combined journal)
  const handlePrintJournal = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Пожалуйста, разрешите всплывающие окна для работы печати.");
      return;
    }

    const MONTH_LABELS = [
      "", "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
      "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    ];
    const monthSuffix = selectedMonth === "all" ? "" : ` за ${MONTH_LABELS[selectedMonth]} 2025 г.`;

    const titleText = (selectedDeptId === "master"
      ? "Сводный интегральный верификационный журнал научных достижений СНО ФЭМ БГЭУ"
      : `Кафедральный журнал достижений СНО ФЭМ - ${DEPARTMENTS.find(d => d.id === selectedDeptId)?.name}`) + monthSuffix;

    const rowsHtml = activeJournalAchievements.map((ach, idx) => `
      <tr>
        <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
        <td><strong>${ach.studentName}</strong><br/><span style="font-size: 10px; color: #555;">${ach.studentObj?.course || "N/A"} курс, гр. ${ach.studentObj?.group || "N/A"}</span></td>
        <td>${ach.dept.name} (${ach.dept.code})</td>
        <td style="font-weight: 500;">${ach.title}</td>
        <td>${ach.supervisor || "—"}</td>
        <td style="text-align: center; font-weight: bold; color: #0d9488;">+${ach.points}</td>
        <td style="text-align: center;">${ach.approvedDate || ach.date}</td>
      </tr>
    `).join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Верификационный Журнал СНО БГЭУ</title>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Times New Roman', Times, serif; padding: 40px; color: #111111; font-size: 13px; line-height: 1.4; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px double #15b78e; padding-bottom: 12px; }
            .title { font-size: 16px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; color: #0f766e; }
            .subtitle { font-size: 12px; color: #555555; font-style: italic; }
            .date { text-align: right; font-size: 11px; margin-bottom: 15px; font-family: sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #999999; padding: 8px 10px; text-align: left; }
            th { background-color: #f2fbf9; font-weight: bold; text-align: center; font-family: Arial, sans-serif; font-size: 11px; text-transform: uppercase; }
            .total-info { margin-top: 25px; text-align: right; font-weight: bold; font-family: Arial, sans-serif; font-size: 13px; border-top: 1px solid #ccc; padding-top: 10px; }
            .signatures { margin-top: 50px; display: flex; justify-content: space-between; font-family: Arial, sans-serif; font-size: 11px; }
            .sig-item { width: 45%; }
            .sig-line { border-bottom: 1px solid #111; height: 35px; width: 180px; margin-top: 5px; }
          </style>
        </head>
        <body onload="window.print()">
          <div class="header">
            <div class="title">${titleText}</div>
            <div class="subtitle">Единый электронный реестр Студенческого научного общества ФЭМ УО «БГЭУ»</div>
          </div>
          
          <div class="date">Дата формирования: ${new Date().toLocaleDateString("ru-RU")} | База: СНО ФЭМ БГЭУ НИРС</div>
          
          <table>
            <thead>
              <tr>
                <th style="width: 5%">№</th>
                <th style="width: 25%">Обучающийся</th>
                <th style="width: 20%">Кафедра</th>
                <th style="width: 25%">Зарегистрированная НИР / Достижение</th>
                <th style="width: 15%">Науч. рук.</th>
                <th style="width: 5%">Баллы</th>
                <th style="width: 10%">Верифицировано</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || '<tr><td colspan="7" style="text-align: center; color: #888;">В выбранном журнале на данный момент отсутствуют подтвержденные записи научных достижений.</td></tr>'}
            </tbody>
          </table>

          <div class="total-info">
            Всего зарегистрировано достижений: ${activeJournalAchievements.length} | Суммарные баллы по журналу научных заслуг: ${activeJournalAchievements.reduce((sum, curr) => sum + curr.points, 0)} б.
          </div>

          <div class="signatures">
            <div class="sig-item">
              <strong>Куратор СНО ФЭМ БГЭУ, зам. декана по научной работе</strong><br/>
              <span>к.э.н., доцент ______________ О.В. Гулина</span>
            </div>
            <div class="sig-item" style="text-align: right;">
              <strong>Председатель Совета СНО ФЭМ</strong><br/>
              <span>______________ А.В. Терро</span>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!isAuthorized) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center max-w-2xl mx-auto space-y-6 border border-slate-100 shadow-3xs my-8" id="sno-journals-locked">
        <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-3xs">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold font-serif text-slate-950 tracking-tight">Доступ ограничен</h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            Кафедральные верификационные журналы достижений предназначены исключительно для ответственных за НИРС кафедр факультета, заместителей декана и декана ФЭМ БГЭУ.
          </p>
        </div>
        <p className="text-[11px] font-mono text-slate-400">
          Студенческий доступ заблокирован согласно Положению о защите персональной информации НИРС БГЭУ.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="sno-academic-journals">
      
      {/* Upper informational banner card */}
      <div className="bg-gradient-to-r from-teal-800 to-emerald-950 rounded-3xl p-6 text-white shadow-md relative overflow-hidden border border-emerald-700/30">
        <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 opacity-10 font-serif font-bold text-[12rem] pointer-events-none select-none">
          БГЭУ
        </div>
        
        <div className="max-w-2xl space-y-2 relative z-10">
          <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold tracking-widest text-[10px] uppercase px-3 py-1 rounded-full">
            Академический Учет СНО
          </span>
          <h1 className="text-2xl font-black tracking-tight font-serif uppercase">
            Кафедральные верификационные журналы
          </h1>
          <p className="text-xs text-teal-100 leading-relaxed font-sans">
            Система структурированного учета публикационной и исследовательской активности студентов в разрезе специализированных кафедр Факультета экономики и менеджмента БГЭУ.
          </p>
        </div>
      </div>

      {/* Main split grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Left Side: Department navigation selector rail */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-3xs">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 mb-3">
              Академические Кафедры
            </h2>
            
            <div className="space-y-1.5" id="department-journals-menu">
              {DEPARTMENTS.map(dept => {
                const stats = departmentStats.find(s => s.id === dept.id);
                return (
                  <button
                    key={dept.id}
                    onClick={() => { setSelectedDeptId(dept.id); }}
                    id={`dept-tab-${dept.id}`}
                    className={`w-full text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer flex justify-between items-center ${selectedDeptId === dept.id ? "bg-emerald-50/70 text-emerald-900 border-emerald-200 font-bold" : "bg-white text-slate-650 border-slate-100 hover:bg-slate-50 :bg-slate-800 "}`}
                  >
                    <div className="space-y-0.5 pr-2 truncate">
                      <div className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-emerald-800">
                        Кафедра {dept.id} ({dept.code})
                      </div>
                      <div className="text-xs truncate font-medium">{dept.name}</div>
                    </div>
                    <span className="bg-slate-100 text-slate-500 font-mono text-[10px] px-2 py-0.5 rounded-md shrink-0">
                      {stats?.achievementsCount || 0}
                    </span>
                  </button>
                );
              })}

              {/* Master Combined SNO Journal Tab Option */}
              <div className="border-t border-slate-100 my-2 pt-2" />
              
              <button
                onClick={() => { setSelectedDeptId("master"); }}
                id="dept-tab-master"
                className={`w-full text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between ${selectedDeptId === "master" ? "bg-purple-50/70 text-purple-900 border-purple-200 font-extrabold shadow-3xs" : "bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100 :bg-slate-700 "}`}
              >
                <div className="flex items-center gap-2 pr-2">
                  <ShieldCheck className={`w-4 h-4 shrink-0 ${selectedDeptId === "master" ? "text-purple-700 animate-pulse" : "text-slate-500 "}`} />
                  <div className="space-y-0.5 truncate">
                    <div className="text-[9px] uppercase font-mono tracking-widest font-extrabold text-purple-700">ФЭМ Сводный Реестр</div>
                    <div className="text-xs font-bold truncate">Единый журнал СНО</div>
                  </div>
                </div>
                {!hasMasterAccess && (
                  <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Logged entries viewer table area */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Locked overlay state for students attempting to access combined SNO ledger */}
          {selectedDeptId === "master" && !hasMasterAccess ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center max-w-2xl mx-auto space-y-5 shadow-sm" id="sno-locked-master-overlay">
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-base font-black text-slate-900 ">Сводный реестр СНО ФЭМ заблокирован</h2>
                <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                  Объединенный верификационный журнал научных заслуг высшей категории доступен исключительно куратору СНО ФЭМ БГЭУ (зам. декана по науке <strong>Гулиной О.В.</strong>) и председателю Совета СНО <strong>Терро А.В.</strong> в целях защиты персональных данных согласно регламенту БГЭУ.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setSelectedDeptId(1)}
                  className="bg-slate-100 hover:bg-slate-200 transition text-slate-700 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  Вернуться на Кафедральные кафедры
                </button>
              </div>
            </div>
          ) : (
            
            // Standard Approved entries display
            <div className="bg-white border border-slate-150 rounded-2xl shadow-3xs overflow-hidden flex flex-col h-full">
              
              {/* Header inside table widget */}
              <div className="p-4 bg-slate-50/50 border-b border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    {selectedDeptId === "master" ? "Управление СНО БГЭУ" : "Академическая Кафедра"}
                  </span>
                  <h3 className="text-sm font-black text-slate-850">
                    {selectedDeptId === "master" 
                      ? "Объединенный (Сводный) Журнал СНО ФЭМ" 
                      : DEPARTMENTS.find(d => d.id === selectedDeptId)?.name
                    }
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Month Selection Dropdown */}
                  <select
                    value={selectedMonth}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedMonth(val === "all" ? "all" : parseInt(val));
                    }}
                    className="bg-white border border-slate-200 outline-hidden text-[11px] font-bold text-slate-700 px-2 py-1.5 rounded-xl cursor-pointer shadow-3xs hover:border-slate-300 transition focus:border-emerald-600"
                  >
                    <option value="all">📅 Все месяцы (2025)</option>
                    <option value="1">Январь</option>
                    <option value="2">Февраль</option>
                    <option value="3">Март</option>
                    <option value="4">Апрель</option>
                    <option value="5">Май</option>
                    <option value="6">Июнь</option>
                    <option value="7">Июль</option>
                    <option value="8">Август</option>
                    <option value="9">Сентябрь</option>
                    <option value="10">Октябрь</option>
                    <option value="11">Ноябрь</option>
                    <option value="12">Декабрь</option>
                  </select>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Поиск по ФИО..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-white border border-slate-250 focus:border-emerald-600 focus:outline-hidden text-xs rounded-xl pl-8 pr-3 py-1.5 w-32 transition"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>

                  <button
                    onClick={handlePrintJournal}
                    className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-55 shadow-3xs text-slate-750 hover:text-slate-900 font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer transition duration-200"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Печать</span>
                  </button>
                </div>
              </div>

              {/* Entries list or empty layout */}
              {activeJournalAchievements.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto" aria-hidden="true" />
                  <div className="text-xs font-bold text-slate-700 ">Достижений не зарегистрировано</div>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    В данном кафедральном верификационном списке пока нет подтвержденных записей о публикациях.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 uppercase text-[9px] font-bold text-slate-405 tracking-wider">
                        <th className="py-3 px-4 w-12 text-center">№</th>
                        <th className="py-3 px-4">Студент</th>
                        <th className="py-3 px-4">Достижение / НИР</th>
                        <th className="py-3 px-4">Руководитель</th>
                        <th className="py-3 px-4 text-center">Баллы</th>
                        <th className="py-3 px-4 text-center">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeJournalAchievements.map((item, idx) => {
                        const sObj = students.find(st => st.id === item.studentId);
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-400 text-center">
                              {idx + 1}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-extrabold text-slate-900 leading-tight">
                                {item.studentName}
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                {sObj?.course} очный, гр. {sObj?.group}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 max-w-xs leading-relaxed">
                              <span className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-[9px] font-semibold px-1.5 py-0.5 rounded-md uppercase tracking-wide inline-block mb-1">
                                {item.dept.code}
                              </span>
                              <div className="font-semibold text-slate-800 line-clamp-2">
                                {item.title}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                                Код: {item.dept.id}-СНО-ФЭМ/{item.id.slice(-4).toUpperCase()}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-650 leading-tight">
                              {item.supervisor || <span className="text-slate-350 italic">не указан</span>}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="bg-emerald-50 text-emerald-800 border border-emerald-100/60 font-black px-2 py-0.5 rounded-lg text-[10px]">
                                +{item.points} б.
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={() => {
                                  if (sObj) {
                                    onOpenCertificate(item, sObj);
                                  }
                                }}
                                className="inline-flex items-center gap-1 font-bold text-emerald-800 hover:text-white border border-emerald-700/40 hover:bg-emerald-750 px-2.5 py-1 rounded-lg text-[10px] cursor-pointer transition whitespace-nowrap"
                              >
                                <span>Справка</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
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

      </div>

    </div>
  );
}
