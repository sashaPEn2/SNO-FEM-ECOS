/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Course {
  First = "1 курс",
  Second = "2 курс",
  Third = "3 курс",
  Fourth = "4 курс",
  Master = "Магистратура"
}

export enum ActivityCategory {
  Science = "Научная деятельность (СНО)",
  Sport = "Спортивные достижения",
  Social = "Общественная активность",
  Creative = "Культурно-творческая деятельность",
  Academic = "Учебные успехи"
}

export enum ApplicationStatus {
  Pending = "На рассмотрении",
  Approved = "Одобрено",
  Rejected = "Отклонено"
}

export interface Student {
  id: string;
  fullName: string;
  course: Course;
  group: string;
  specialty: string;
  email: string;
  avatarUrl?: string;
  totalPoints: number;
  role: 'student' | 'moderator' | 'admin' | 'curator' | 'dean' | 'deputy_dean' | 'nirs_dept';
  position?: string;
  departmentId?: number;
  password?: string;
  phone?: string;
}

export interface Achievement {
  id: string;
  studentId: string;
  studentName: string;
  course: Course;
  category: ActivityCategory;
  title: string;
  description: string;
  date: string;
  proofUrl?: string;
  proofText?: string;
  attachments?: string[]; // Added
  supervisor?: string; // relevant for scientific achievement certifications
  points: number;
  status: ApplicationStatus;
  rejectReason?: string;
  approvedBy?: string;
  approvedDate?: string;
}

export interface Notification {
  id: string;
  studentId: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  achievementId?: string;
  status: 'info' | 'success' | 'warning' | 'error';
}

// Quiz System Integration
export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctOptionIdx: number;
  explanation: string;
  mediaUrl?: string; // base64 or URL
  mediaType?: 'image' | 'video' | 'audio';
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  pointsAwarded: number;
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  studentId: string;
  studentName: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  pointsEarned: number;
  date: string;
}

// Souvenir Shop Integration
export interface Souvenir {
  id: string;
  name: string;
  cost: number;
  description: string;
  imageUrl?: string;
}

export interface SouvenirOrder {
  id: string;
  studentId: string;
  studentName: string;
  souvenirId: string;
  souvenirName: string;
  cost: number;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
}

