/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Student, Achievement, ActivityCategory, Course, ApplicationStatus } from "../types";
import { BarChart3, PieChart, FileDown, TrendingUp, Users, Award, BookOpen, GraduationCap, CheckCircle } from "lucide-react";

interface StatsDashboardProps {
  students: Student[];
  achievements: Achievement[];
}

export default function StatsDashboard({ students, achievements }: StatsDashboardProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const approvedAchievements = achievements.filter(a => a.status === ApplicationStatus.Approved);
  const pendingAchievements = achievements.filter(a => a.status === ApplicationStatus.Pending);

  // 1. Core aggregates
  const totalPoints = approvedAchievements.reduce((acc, curr) => acc + curr.points, 0);
  const avgPointsPerStudent = students.length > 0 ? Math.round(totalPoints / students.length) : 0;
  const scienceCount = approvedAchievements.filter(a => a.category === ActivityCategory.Science).length;

  // 2. Specialty breakdown
  const specialtyStats: Record<string, { count: number; points: number }> = {};
  students.forEach(s => {
    specialtyStats[s.specialty] = { count: 0, points: 0 };
  });

  approvedAchievements.forEach(a => {
    const student = students.find(s => s.id === a.studentId);
    if (student) {
      if (!specialtyStats[student.specialty]) {
        specialtyStats[student.specialty] = { count: 0, points: 0 };
      }
      specialtyStats[student.specialty].count += 1;
      specialtyStats[student.specialty].points += a.points;
    }
  });

  const sortedSpecialties = Object.entries(specialtyStats)
    .map(([name, stat]) => ({ name, count: stat.count, points: stat.points }))
    .sort((a, b) => b.points - a.points);

  // 3. Category Breakdown for SVG Pie Chart
  const categoryCount = Object.values(ActivityCategory).map(cat => {
    const records = approvedAchievements.filter(a => a.category === cat);
    const count = records.length;
    const points = records.reduce((sum, curr) => sum + curr.points, 0);
    return {
      category: cat,
      count,
      points,
      shortName: cat.split(" (")[0].split(" ")[0] // Simplified label
    };
  });

  const totalCatPoints = categoryCount.reduce((sum, c) => sum + c.points, 0) || 1;

  // Colors for charts
  const colors = ["#047857", "#0284c7", "#7c3aed", "#db2777", "#d97706"];

  // 4. Course breakdown for SVG Bar Chart
  const courseStats = Object.values(Course).map(course => {
    const count = approvedAchievements.filter(a => a.course === course).length;
    const points = approvedAchievements.filter(a => a.course === course).reduce((sum, curr) => sum + curr.points, 0);
    return { course, count, points };
  });

  const maxCoursePoints = Math.max(...courseStats.map(c => c.points)) || 1;

  // 5. Scientific supervisors count
  const supervisorStats: Record<string, number> = {};
  approvedAchievements.forEach(a => {
    if (a.category === ActivityCategory.Science && a.supervisor) {
      const cleanSupervisor = a.supervisor.split(" (")[0].replace("д.э.н., ", "").replace("к.э.н., ", "ия ").replace("профессор ", "").replace("доцент ", "");
      supervisorStats[cleanSupervisor] = (supervisorStats[cleanSupervisor] || 0) + 1;
    }
  });
  const topSupervisors = Object.entries(supervisorStats)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  // 6. CSV Exporter
  const exportToCSV = () => {
    const headers = ["ФИО Студента", "Курс", "Группа", "Специальность", "Достижение", "Категория", "Дата", "Научный руководитель", "Рейтинговые Баллы", "Статус модерации"];
    
    const rows = achievements.map(a => {
      const student = students.find(s => s.id === a.studentId);
      return [
        student?.fullName || a.studentName,
        student?.course || a.course,
        student?.group || "N/A",
        student?.specialty || "N/A",
        `"${a.title.replace(/"/g, '""')}"`,
        a.category,
        a.date,
        a.supervisor ? `"${a.supervisor.replace(/"/g, '""')}"` : "",
        a.points,
        a.status
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `BSEU_FEM_SSS_Achievements_Report_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 7. Visual Print Exporter
  const handlePrintFacultyReport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const specialtyRows = sortedSpecialties.map((s, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px; font-weight: bold;">${idx + 1}</td>
        <td style="padding: 10px;">${s.name}</td>
        <td style="padding: 10px; text-align: center;">${s.count}</td>
        <td style="padding: 10px; text-align: center; font-weight: bold; color: #047857;">${s.points} б.</td>
      </tr>
    `).join("");

    const categoryRows = categoryCount.map(c => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px;">${c.category}</td>
        <td style="padding: 10px; text-align: center;">${c.count}</td>
        <td style="padding: 10px; text-align: center; font-weight: bold; color: #002D62;">${c.points} б.</td>
        <td style="padding: 10px; text-align: center;">${Math.round((c.points / totalCatPoints) * 100)}%</td>
      </tr>
    `).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Аналитический отчет СНО ФЭМ БГЭУ - 2026</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 30px; color: #333; line-height: 1.5; }
            h1, h2 { font-family: Arial, sans-serif; text-align: center; }
            .header-info { text-align: center; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #005a36; padding-bottom: 10px; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 30px; font-size: 13px; }
            th { background-color: #005a36; color: white; padding: 12px; font-family: Arial, sans-serif; text-transform: uppercase; font-size: 11px; }
            .footer-meta { margin-top: 50px; font-size: 11px; text-align: right; border-top: 1px solid #ccc; padding-top: 10px; font-style: italic; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body onload="window.print()">
          <div class="header-info">
            <strong>Белорусский государственный экономический университет</strong><br/>
            Совет Студенческого научного общества ФЭМ<br/>
            Реестр достижений студентов факультета экономики и менеджмента
          </div>
          <h2>АНАЛИТИЧЕСКИЙ ОТЧЕТ СНО ФЭМ</h2>
          <p style="text-align: center; font-size: 12px; color: #666; margin-top: -10px;">Сформирован на дату: ${new Date().toLocaleDateString("ru-RU")} г.</p>
          
          <p>Настоящий сводный аналитический отчет отражает общую интеллектуальную, научно-исследовательскую, спортивную и научно-общественную активность студентов дневной формы обучения по специальностям и ведомостям кафедр факультета экономики и менеджмента БГЭУ.</p>
          
          <h3>1. Сводные показатели активности</h3>
          <ul>
            <li><strong>Всего верифицированных достижений:</strong> ${approvedAchievements.length} ед.</li>
            <li><strong>Заявок на рассмотрении актива СНО:</strong> ${pendingAchievements.length} ед.</li>
            <li><strong>Сводный рейтинговый балл факультета:</strong> ${totalPoints} б.</li>
            <li><strong>Средний балл активности на одного учтенного студента:</strong> ${avgPointsPerStudent} б.</li>
            <li><strong>Доля научно-исследовательских работ (НИРС):</strong> ${Math.round((scienceCount / (approvedAchievements.length || 1)) * 100)}%</li>
          </ul>

          <h3>2. Успеваемость специальностей в рейтинге</h3>
          <table>
            <thead>
              <tr>
                <th style="width: 8%;">Место</th>
                <th style="text-align: left;">Специальность ФЭМ</th>
                <th style="width: 25%;">Кол-во одобр. достижений</th>
                <th style="width: 20%;">Суммарные баллы СНО</th>
              </tr>
            </thead>
            <tbody>
              ${specialtyRows}
            </tbody>
          </table>

          <h3>3. Направления студенческой деятельности</h3>
          <table>
            <thead>
              <tr>
                <th style="text-align: left;">Сфера деятельности</th>
                <th style="width: 20%;">Кол-во наград</th>
                <th style="width: 25%;">Сумма рейтинговых баллов</th>
                <th style="width: 15%;">Доля баллов</th>
              </tr>
            </thead>
            <tbody>
              ${categoryRows}
            </tbody>
          </table>

          <div class="footer-meta">
            Отчет сформирован программной системой СНО ФЭМ БГЭУ «Реестр Достижений»<br/>
            Куратор системы: Деканат ФЭУ и Студсовет
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      
      {/* Exporter Controls */}
      <div id="stats-header" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-805">Аналитика и статистика</h2>
          <p className="text-xs text-slate-500 mt-1">
            Сводный анализ активности студентов ФЭМ и импорт официальных отчетов
          </p>
        </div>
        <div id="export-actions-panel" className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={exportToCSV}
            id="btn-export-csv"
            className="flex items-center gap-2 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 :bg-slate-800 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-slate-500 " />
            <span>Экспорт в CSV</span>
          </button>
          <button
            onClick={handlePrintFacultyReport}
            id="btn-print-faculty-report"
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Печать аналитического отчета</span>
          </button>
        </div>
      </div>

      {/* Grid of aggregate cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-450 uppercase tracking-wider font-semibold">Всего баллов СНО</div>
            <div id="stat-total-points" className="text-2xl font-black text-slate-805 mt-0.5">{totalPoints}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Сумма всех утвержденных наград</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-450 uppercase tracking-wider font-semibold">Одобрено заявок</div>
            <div id="stat-approved-count" className="text-2xl font-black text-slate-805 mt-0.5">{approvedAchievements.length}</div>
            <div className="text-[10px] text-blue-500 mt-0.5">В реестре достижений</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-450 uppercase tracking-wider font-semibold">Средний рейтинг</div>
            <div id="stat-avg-points" className="text-2xl font-black text-slate-805 mt-0.5">{avgPointsPerStudent} б.</div>
            <div className="text-[10px] text-slate-400 mt-0.5">На одного учтенного студента</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-450 uppercase tracking-wider font-semibold">Научные работы</div>
            <div id="stat-science-count" className="text-2xl font-black text-slate-805 mt-0.5">{scienceCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {Math.round((scienceCount / (approvedAchievements.length || 1)) * 100)}% от общего количества
            </div>
          </div>
        </div>

      </div>

      {/* Visual Chart Modules - Handcrafted SVG Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Course distribution Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 ">
          <div className="flex items-center gap-2 mb-6">
            <GraduationCap className="w-5 h-5 text-emerald-800" />
            <h3 className="font-bold text-slate-805">Рейтинговые баллы по курсам обучения</h3>
          </div>

          <div className="h-64 flex items-end justify-between gap-3 px-4 pt-4 border-b border-slate-150 pb-1">
            {courseStats.map((item, idx) => {
              const heightPercent = Math.max(10, Math.round((item.points / maxCoursePoints) * 100));
              return (
                <div 
                  key={item.course} 
                  className="flex flex-col items-center flex-1 cursor-pointer group"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="w-full relative flex flex-col items-center">
                    {/* Tooltip on Hover */}
                    <div className={`absolute -top-12 z-10 bg-slate-800 text-white text-[11px] font-bold px-2 py-1 rounded-md transition duration-200 pointer-events-none whitespace-nowrap shadow-xs ${hoveredIndex === idx ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                      {item.points} б. ({item.count} дост.)
                    </div>
                    {/* Visual Rounded Bar */}
                    <div 
                      style={{ height: `${heightPercent}%` }}
                      className="w-8 sm:w-12 bg-emerald-600 hover:bg-emerald-700 active:emerald-800 group-hover:bg-emerald-700 rounded-t-lg transition-all duration-500 ease-out shadow-xs"
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 mt-2 truncate max-w-full">
                    {item.course.split(" ")[0]}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-center text-slate-400 mt-3 italic">
            * Наведите курсор на столбец для точных данных
          </p>
        </div>

        {/* Categories breakdown donut chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 ">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-indigo-700" />
            <h3 className="font-bold text-slate-850">Структура достижений по направлениям</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            
            {/* SVG Donut Illustration */}
            <div className="flex justify-center">
              <svg className="w-44 h-44" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="4.5" />
                
                {/* Dynamically draw segmented stroke arrays */}
                {(() => {
                  let accumulatedOffset = 0;
                  return categoryCount.map((cat, idx) => {
                    const percentage = Math.round((cat.points / totalCatPoints) * 100) || 0;
                    if (percentage === 0) return null;
                    const strokeDashArray = `${percentage} ${100 - percentage}`;
                    const strokeOffset = 100 - accumulatedOffset + 25; // 25 to start from 12 o'clock
                    accumulatedOffset += percentage;

                    return (
                      <circle
                        key={idx}
                        cx="21"
                        cy="21"
                        r="15.915"
                        fill="transparent"
                        stroke={colors[idx % colors.length]}
                        strokeWidth="5"
                        strokeDasharray={strokeDashArray}
                        strokeDashoffset={strokeOffset}
                        className="transition-all duration-300"
                        onMouseEnter={() => setHoveredIndex(idx + 10)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      />
                    );
                  });
                })()}

                {/* Centered label */}
                <g className="font-sans">
                  <text x="50%" y="46%" dominantBaseline="middle" textAnchor="middle" className="text-[7px] font-bold fill-slate-805">
                    {totalPoints} б.
                  </text>
                  <text x="50%" y="60%" dominantBaseline="middle" textAnchor="middle" className="text-[4px] fill-slate-500 font-semibold uppercase tracking-wider">
                    всего
                  </text>
                </g>
              </svg>
            </div>

            {/* Legend checklist */}
            <div className="space-y-2.5">
              {categoryCount.map((cat, idx) => {
                const pct = Math.round((cat.points / totalCatPoints) * 100) || 0;
                return (
                  <div key={cat.category} className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-xs shrink-0" 
                      style={{ backgroundColor: colors[idx % colors.length] }}
                    />
                    <div className="text-[11px] leading-tight text-slate-700 flex-1 truncate">
                      <span className="font-semibold block">{cat.shortName}</span>
                      <span className="text-slate-450">{cat.points} б. ({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>

      {/* Specialty and Supervisor tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Specialties Leadership */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 ">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-805">Рейтинг специальностей факультета ФЭМ</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-2 font-semibold">Специальность</th>
                  <th className="py-3 px-2 text-center font-semibold">Достижения</th>
                  <th className="py-3 px-2 text-right font-semibold">Всего баллов</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sortedSpecialties.map((spec) => (
                  <tr key={spec.name} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-2 font-medium text-slate-700 whitespace-nowrap">{spec.name}</td>
                    <td className="py-3 px-2 text-center text-slate-500 ">{spec.count} шт.</td>
                    <td className="py-3 px-2 text-right font-bold text-emerald-700">{spec.points} б.</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Active Scientific Mentors */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 ">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-slate-805">Наиболее активные научные руководители НИРС</h3>
          </div>
          
          <div className="space-y-3.5 pt-1">
            {topSupervisors.length > 0 ? (
              topSupervisors.map((sv, idx) => (
                <div key={sv.name} className="flex items-center justify-between border-b border-slate-50 pb-2 bg-slate-50/20 px-3 py-2 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 w-6 h-6 rounded-full flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 ">{sv.name}</span>
                  </div>
                  <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    {sv.count} раб.
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-400 text-xs py-8">
                Нет зарегистрированных научных руководителей для одобренных НИРС.
              </div>
            )}
            <p className="text-[10px] text-slate-400 italic text-center mt-3">
              *Включает только научных кураторов, чьи студенты успешно прошли модерацию СНО ФЭМ
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
