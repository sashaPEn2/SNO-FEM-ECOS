export interface StudentProfile {
  name: string;
  course: number;
  group: string;
  studentId: string;
  points: number;
  exemptionCount: number;
  role?: 'student' | 'sno_activist';
  email?: string;
  password?: string;
  isBudget?: boolean;
  phone?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  category: 'conference' | 'science' | 'grant' | 'announcement';
  imageUrl: string;
  views: number;
  likes: number;
  isLiked?: boolean;
}

export interface ScienceEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  pointsForSpeaker: number;
  pointsForListener: number;
  description: string;
  requirements?: string;
  registeredCount: number;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  studentName: string;
  studentGroup: string;
  studentId?: string;
  role: 'speaker' | 'listener';
  paperTitle?: string;
  registrationDate: string;
  qrCodeValue: string;
}

export interface ExemptionCertificate {
  id: string;
  studentId?: string;
  studentName: string;
  studentGroup: string;
  dateRequested: string;
  targetExemptionDate: string;
  status: 'active' | 'archived';
  reason: string;
  verificationCode: string;
  pointsDeducted: number;
  endDate?: string;
  course?: number;
  isBudget?: boolean;
  phone?: string;
  supportingDocs?: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  pointsReward: number; // Max points
  questions: QuizQuestion[];
  completed?: boolean;
  highScore?: number;
}

export interface TimelineItem {
  id: string;
  type: 'quiz' | 'event_registration' | 'manual_activity' | 'exemption_purchase' | 'academic_award';
  title: string;
  date: string;
  pointsChange: number;
  details: string;
  isReward?: boolean; // If it's a positive award / prize
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  type: 'news' | 'event' | 'registration' | 'status_change' | 'reminder';
  date: string;
  read: boolean;
  eventId?: string;
  newsId?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  color: string;
  requirement: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress?: { current: number; target: number };
}

export interface StudentFeedback {
  id: string;
  studentId: string;
  studentName: string;
  studentGroup: string;
  category: 'issue' | 'suggestion' | 'praise' | 'other';
  message: string;
  date: string;
  status: 'new' | 'reviewed' | 'resolved';
  adminNotes?: string;
  replyText?: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  action: string;
  userEmail: string;
  userName: string;
  details: string;
  severity: 'info' | 'warning' | 'error' | 'success';
}


