/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Student, Achievement, Course, ActivityCategory, ApplicationStatus } from "../types";
import { Search, Filter, Award, Trophy, User, BookOpen, Star, Calendar, ExternalLink, ShieldCheck, HelpCircle } from "lucide-react";

interface DashboardProps {
  students: Student[];
  achievements: Achievement[];
  onOpenCertificate: (achievement: Achievement, student: Student) => void;
  currentUser: Student;
}

export default function Dashboard({ students, achievements, onOpenCertificate, currentUser }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showRanksFaq, setShowRanksFaq] = useState(false);

  // Filter approved achievements
  const approvedAchievements = useMemo(() => {
    return achievements.filter(a => a.status === ApplicationStatus.Approved && a.category === ActivityCategory.Science);
  }, [achievements]);

  // Compute live student ranks based on currently approved achievements
  const rankedStudents = useMemo(() => {
    return [...students]
      .map(student => {
        const studentApprovedPoints = approvedAchievements
          .filter(a => a.studentId === student.id)
          .reduce((sum, curr) => sum + curr.points, 0);
        return {
          ...student,
          totalPoints: studentApprovedPoints
        };
      })
      .sort((a, b) => b.totalPoints - a.totalPoints);
  }, [students, approvedAchievements]);

  // Filter approved achievements list for display
  const filteredAchievements = useMemo(() => {
    return approvedAchievements.filter((item) => {
      const matchSearch =
        item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.supervisor && item.supervisor.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCourse = selectedCourse === "all" || item.course === selectedCourse;
      const matchCategory = selectedCategory === "all" || item.category === selectedCategory;

      return matchSearch && matchCourse && matchCategory;
    });
  }, [approvedAchievements, searchQuery, selectedCourse, selectedCategory]);

  return (
    <div className="space-y-6" id="faculty-achievements-dashboard">
      
      {/* Search & filter header controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          
          {/* Search Input bar */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="search-registry-input"
              placeholder="Поиск по ФИО студента, названию статьи или науч. рук..."
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-hidden focus:border-emerald-600 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-850 placeholder-slate-400 transition"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>

          {/* Course Filter Dropdown */}
          <div className="sm:w-48">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              id="filter-course-select"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-155 focus:outline-hidden focus:border-emerald-600 transition"
            >
              <option value="all">Все курсы</option>
              {Object.values(Course).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Quick Categories horizontal pill scrolls */}
        <div className="border-t border-slate-100 pt-3 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Шкалы:</span>
          </span>
          {[
            { id: "all", label: "Все достижения" },
            { id: ActivityCategory.Science, label: "СНО Наука" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSelectedCategory(pill.id)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition whitespace-nowrap shrink-0 cursor-pointer ${selectedCategory === pill.id ? "bg-emerald-800 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {pill.label}
            </button>
          ))}
        </div>

      </div>

      {/* List of achievements */}
      <div className="space-y-4" id="approved-achievements-feed">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-slate-805">Верифицированные достижения ({filteredAchievements.length})</h2>
          {searchQuery && <span className="text-xs text-slate-400">Найдено записей: {filteredAchievements.length}</span>}
        </div>

        {filteredAchievements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400 space-y-2">
            <Award className="w-12 h-12 text-slate-300 mx-auto" aria-hidden="true" />
            <div className="text-sm font-bold text-slate-700 ">Ничего не найдено</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Попробуйте изменить формулировку поискового запроса или сбросить фильтры категории.</p>
          </div>
        ) : (
          filteredAchievements.map((item) => {
            const associatedStudent = students.find(s => s.id === item.studentId);
            return (
              <div 
                key={item.id} 
                id={`achievement-card-${item.id}`}
                className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 transition hover:shadow-md hover:border-slate-200/85 relative group overflow-hidden"
              >
                {/* Category Accent Line */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-700" />

                <div className="space-y-3.5 pl-2">
                  
                  {/* Card Header: Student Metadata */}
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-50 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-805 text-sm hover:text-emerald-700 transition">
                          {item.studentName}
                        </span>
                        <span className="text-slate-350 text-xs">|</span>
                        <span className="text-slate-505 text-[11px] font-semibold">{item.course}, гр. {associatedStudent?.group || "N/A"}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 italic mt-0.5 max-w-md truncate">
                        {associatedStudent?.specialty || "Факультет экономики и менеджмента БГЭУ"}
                      </div>
                    </div>

                    {/* Displaying points allocated to this achievement */}
                    <div className="text-right">
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-black px-3 py-1 rounded-xl whitespace-nowrap block">
                        +{item.points} б.
                      </span>
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono mt-1 block">номинал</span>
                    </div>
                  </div>

                  {/* Achievement Details */}
                  <div>
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide">
                      {item.category.split(" (")[0]}
                    </span>
                    <h3 className="font-black text-slate-900 text-base mt-2 leading-snug">
                      {item.title}
                    </h3>
                    
                    {item.supervisor && (
                      <div className="flex items-center gap-1 text-xs text-slate-600 mt-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100/50 w-max max-w-full">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span className="truncate"><strong>Науч. рук:</strong> {item.supervisor}</span>
                      </div>
                    )}

                    <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Proof metadata */}
                  {(item.proofText || item.proofUrl || (item.attachments && item.attachments.length > 0)) && (
                    <div className="text-[11px] text-slate-500 flex flex-col gap-2 bg-amber-50/30 border border-amber-50 rounded-xl p-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="truncate max-w-[70%]">
                          <strong>Документ-свидетельство:</strong> {item.proofText || "Ссылка зафиксирована"}
                        </span>
                        {item.proofUrl && (
                          <a 
                            href={item.proofUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-1 font-bold text-emerald-850 hover:underline shrink-0"
                          >
                            <span>Открыть источник</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      
                      {/* Attachments Section in Dashboard */}
                      {item.attachments && item.attachments.length > 0 && (
                        <div className="mt-1">
                          <strong>Приложения:</strong>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {item.attachments.map((url, i) => (
                              <a 
                                key={i}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-slate-100 px-2 py-1 rounded inline-flex items-center gap-1 hover:bg-slate-200"
                              >
                                <span>Приложение {i + 1}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Verified stamp footer bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-50 pt-3.5 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5 font-sans font-medium text-emerald-850 bg-emerald-50/70 border border-emerald-100 px-2.5 py-1 rounded-lg">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Верифицировано СНО {item.approvedDate && `(${item.approvedDate})`}</span>
                    </div>
                    
                    {/* Certificate Generator Button */}
                    {associatedStudent && (currentUser.role === 'admin' || currentUser.role === 'curator' || currentUser.fullName === item.studentName) && (
                      <button
                        onClick={() => onOpenCertificate(item, associatedStudent)}
                        className="flex items-center gap-1.5 text-emerald-800 hover:text-white font-bold px-3 py-1 border border-emerald-700/40 hover:bg-emerald-750 rounded-lg transition duration-200 text-xs shrink-0 cursor-pointer"
                      >
                        <span>Сформировать справку</span>
                      </button>
                    )}

                    <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                      <Calendar className="w-3 h-3" />
                      <span>Рег: {new Date(item.date).toLocaleDateString("ru-RU")}</span>
                    </div>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
