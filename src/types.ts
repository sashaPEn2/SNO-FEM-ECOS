// Центральные типы, которые импортируются как "../types".
// Типы сведены к минимуму, но должны покрывать все поля, которые используются в компонентах.

export enum Course {
  First = '1 курс',
  Second = '2 курс',
  Third = '3 курс',
  Fourth = '4 курс',
}

export enum ActivityCategory {
  Science = 'СНО Наука (Science)',
  Sport = 'Спорт (Sport)',
  Social = 'Общественная деятельность (Social)',
  Creative = 'Творчество (Creative)',
  Academic = 'Академическая деятельность (Academic)',
}

// Некоторые компоненты используют параметры-«подкатегории» для науки.
// Для совместимости оставляем строковый тип.
export type ActivityCategoryKey = `${ActivityCategory}`;


export enum ApplicationStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

export enum NotificationType {
  AchievementApproved = 'achievement_approved',
}

export type Role =
  | 'student'
  | 'admin'
  | 'curator'
  | 'nirs_dept'
  | 'moderator'
  | 'dean'
  | 'deputy_dean';

export type Student = {
  id: string;
  fullName: string;
  email: string;
  course: Course;
  group: string;
  specialty: string;
  role: Role;
  position?: string;
  departmentId?: number;
  avatarUrl?: string;
  totalPoints: number;
};

export type Achievement = {
  id: string;
  studentId: string;
  studentName: string;
  course: string;
  group?: string;
  specialty?: string;
  role?: Role;
  category: string;
  title: string;
  description: string;
  supervisor?: string;
  proofText?: string;
  proofUrl?: string;
  attachments?: string[];
  points: number;
  status: ApplicationStatus;
  approvedDate?: string;
  date: string;
};

export type Notification = {
  id: string;
  studentId: string;
  studentName: string;
  type: NotificationType | string;
  title?: string;
  message: string;
  // В компонентах сортируют по b.date, поэтому поле date обязательно.
  date: string;
  // Дополнительное поле оставляем для совместимости.
  createdAt?: string;
  // Используется в StudentProfile
  isRead?: boolean;
  status?: 'success' | 'error' | string;
};


export type QuizQuestion = {
  id: string;
  text: string;
  options: string[];
  correctOptionIdx: number;
  explanation: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio';
};

export type Quiz = {
  id: string;
  title: string;
  description: string;
  pointsAwarded: number;
  questions: QuizQuestion[];
  createdAt: string;
};

export type QuizAttempt = {
  id: string;
  quizId: string;
  quizTitle?: string;
  studentId: string;
  studentName: string;
  status?: 'completed' | 'in_progress' | string;

  // StudentProfile ожидает score/totalQuestions
  score: number;
  totalQuestions: number;

  // Баллы СНО за прохождение
  pointsEarned: number;

  // StudentProfile/StudentProfile использует date
  date?: string;
  createdAt?: string;
};


export type Souvenir = {
  id: string;
  name: string;
  cost: number;
  description: string;
  imageUrl?: string;
};

export type SouvenirOrder = {
  id: string;
  studentId: string;
  studentName: string;
  souvenirId: string;
  souvenirName: string;
  cost: number;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
};

