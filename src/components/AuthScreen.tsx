/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useClerk } from "@clerk/clerk-react";
import { Student, Course } from "../types";
import { User, GraduationCap, Landmark, LogIn, UserPlus } from "lucide-react";

interface AuthScreenProps {
  students: Student[];
  onRegister: (newUser: Omit<Student, "id" | "totalPoints">) => void;
}

export default function AuthScreen({ students, onRegister }: AuthScreenProps) {
  const { openSignIn, openSignUp } = useClerk();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  
  const [regName, setRegName] = useState("");
  const [regCourse, setRegCourse] = useState<Course>(Course.First);
  const [regGroup, setRegGroup] = useState("");
  const [regSpecialty, setRegSpecialty] = useState("Экономика промышленных предприятий");
  const [regRole, setRegRole] = useState<'student' | 'admin' | 'curator' | 'nirs_dept'>("student");
  const [regPosition, setRegPosition] = useState("");
  const [regDeptId, setRegDeptId] = useState<number>(1);
  const [regError, setRegError] = useState("");
  const [regWizardStep, setRegWizardStep] = useState(0); 

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    if (!regName.trim() || (regRole === "student" && !regGroup.trim())) {
      setRegError("Заполните обязательные поля.");
      return;
    }

    const newProfile: Omit<Student, "id" | "totalPoints"> = {
      fullName: regName.trim(),
      email: "", // Will be filled after Clerk login
      course: regCourse,
      group: regGroup.trim() || "нет",
      specialty: regSpecialty.trim() || "Общий профиль ФЭМ",
      role: regRole,
      position: regRole !== "student" ? (regPosition.trim() || "Сотрудник кафедры/Комитета") : undefined,
      departmentId: regRole === "nirs_dept" ? regDeptId : undefined,
      avatarUrl: regRole === "student"
        ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
        : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    };

    onRegister(newProfile);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 antialiased selection:bg-emerald-200">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <img src="/logo.png" alt="Logo" className="w-20 h-20 mx-auto" />
          <h2 className="mt-4 text-2xl font-serif font-black text-slate-900 uppercase tracking-tight">
            СНО ФЭМ БГЭУ
          </h2>
        </div>

        <div className="bg-white rounded-3xl border border-slate-150 shadow-xl overflow-hidden" id="login-register-panel">
          <div className="flex border-b border-slate-100 bg-slate-50/50">
            <button onClick={() => { setActiveTab("login"); }} className={`w-1/2 py-4 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === "login" ? "bg-white text-emerald-800 border-b-2 border-emerald-700 font-black" : "text-slate-400 hover:text-slate-700 "}`}>
              <LogIn className="w-4 h-4" />
              <span>Авторизация</span>
            </button>
            <button onClick={() => { setActiveTab("register"); }} className={`w-1/2 py-4 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === "register" ? "bg-white text-emerald-800 border-b-2 border-emerald-700 font-black" : "text-slate-400 hover:text-slate-700 "}`}>
              <UserPlus className="w-4 h-4" />
              <span>Регистрация</span>
            </button>
          </div>

          <div className="p-8">
            {activeTab === "login" && (
              <button onClick={() => openSignIn()} className="w-full bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white font-bold text-xs py-3 rounded-xl transition duration-150 cursor-pointer shadow-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-6">
                <LogIn className="w-4 h-4" />
                <span>Войти через Clerk</span>
              </button>
            )}

            {activeTab === "register" && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 text-center">Для регистрации, пожалуйста, сначала авторизуйтесь через Clerk.</p>
                  <button onClick={() => openSignUp()} className="w-full bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white font-bold text-xs py-3 rounded-xl transition duration-150 cursor-pointer shadow-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-6">
                    <UserPlus className="w-4 h-4" />
                    <span>Зарегистрироваться через Clerk</span>
                  </button>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
