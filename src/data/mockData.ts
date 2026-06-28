/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, Achievement, Notification, Course, ActivityCategory, ApplicationStatus, Quiz, QuizAttempt, Souvenir, SouvenirOrder } from "../types";
import { syncAllStudentsToFirestore } from "../firebaseSync";

export const SEED_STUDENTS: Student[] = [];

export const SEED_ACHIEVEMENTS: Achievement[] = [];

export const SEED_NOTIFICATIONS: Notification[] = [];

export const SEED_SOUVENIRS: Souvenir[] = [
  {
    id: "souv_1",
    name: "Ручка пластиковая СНО ФЭМ",
    cost: 15,
    description: "Удобная пластиковая ручка зеленого цвета с фирменным золотистым тиснением СНО ФЭМ.",
    imageUrl: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=200"
  },
  {
    id: "souv_2",
    name: "Ручка металлическая СНО в футляре",
    cost: 40,
    description: "Премиальная металлическая ручка с поворотным механизмом, лазерной гравировкой СНО ФЭМ БГЭУ в стильном бархатном футляре.",
    imageUrl: "https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?w=200"
  },
  {
    id: "souv_3",
    name: "Фирменный брелок БГЭУ ФЭМ",
    cost: 25,
    description: "Металлический брелок с заливкой смолой, гербом факультета экономики и менеджмента БГЭУ.",
    imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=200"
  },
  {
    id: "souv_4",
    name: "Флешка 16GB СНО с гравировкой",
    cost: 80,
    description: "Деревянная флешка из светлого бамбука объемом 16 ГБ в деревянной коробочке с гравировкой 'СНО ФЭМ БГЭУ'.",
    imageUrl: "https://images.unsplash.com/photo-1622760814922-fe98f641202e?w=200"
  },
  {
    id: "souv_5",
    name: "Блокнотик СНО А5",
    cost: 35,
    description: "Стильный карманный блокнот формата А5, твердая матовая обложка с тиснением, 80 листов в клетку, закладка-ляссе.",
    imageUrl: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=200"
  }
];

export const SEED_QUIZZES: Quiz[] = [
  {
    id: "quiz_1",
    title: "История и традиции БГЭУ",
    description: "Проверьте свои знания об альма-матер! Узнайте, как развивался наш университет от истоков до современного ведущего экономического вуза Беларуси.",
    pointsAwarded: 20,
    createdAt: "2026-06-01",
    questions: [
      {
        id: "q1_1",
        text: "В каком году был основан БГЭУ (изначально БГИНХ)?",
        options: ["1921 год", "1933 год", "1945 год", "1953 год"],
        correctOptionIdx: 1,
        explanation: "БГЭУ ведет свою историю со 2 мая 1933 года, когда Постановлением Совета Народных Комиссаров БССР был создан Белорусский государственный институт народного хозяйства."
      },
      {
        id: "q1_2",
        text: "Какое имя государственного деятеля носил БГИНХ до 1992 года?",
        options: ["В.И. Ленин", "Ф.Э. Дзержинский", "В.В. Куйбышев", "М.В. Фрунзе"],
        correctOptionIdx: 2,
        explanation: "С 1935 по 1991 годы Белорусский государственный институт народного хозяйства носил имя Валериана Владимировича Куйбышева."
      },
      {
        id: "q1_3",
        text: "Какой талисман традиционно символизирует мудрость и Студенческое научное общество БГЭУ?",
        options: ["Бобер-экономист", "Ученая Сова", "Студент-купец", "Золотой Меркурий"],
        correctOptionIdx: 1,
        explanation: "Ученая Сова — символ мудрости, познания и научного поиска, традиционно изображаемый на символике СНО в нашем университете."
      }
    ]
  },
  {
    id: "quiz_2",
    title: "Основы макроэкономики от СНО ФЭМ",
    description: "Разберитесь в ключевых процессах, управляющих государственными масштабами: инфляция, ВВП, фискальная политика и экономический рост.",
    pointsAwarded: 30,
    createdAt: "2026-06-10",
    questions: [
      {
        id: "q2_1",
        text: "Что такое ВВП (Валовой внутренний продукт) простыми словами?",
        options: [
          "Рыночная стоимость всех конечных товаров и услуг, произведенных за год внутри страны",
          "Сумма всех денег, находящихся на счетах граждан и предприятий",
          "Государственный доход от экспорта за вычетом импорта",
          "Стоимость только материальных товаров без учета сферы услуг"
        ],
        correctOptionIdx: 0,
        explanation: "ВВП — это совокупная рыночная стоимость всех конечных товаров и услуг, произведенных в течение года на территории государства."
      },
      {
        id: "q2_2",
        text: "Как называют инфляцию, сопровождающуюся экономическим спадом и ростом безработицы?",
        options: ["Стагфляция", "Гиперинфляция", "Дефляция", "Галопирующая инфляция"],
        correctOptionIdx: 0,
        explanation: "Стагфляция — это экономическое состояние, сочетающее стагнацию (спад производства) и инфляцию (рост цен)."
      },
      {
        id: "q2_3",
        text: "Альтернативная стоимость (opportunity cost) — это...",
        options: [
          "Окончательная цена товара с учетом всех скидок",
          "Стоимость наилучшего упущенного альтернативного варианта при выборе решения",
          "Себестоимость производства аналогичного товара у конкурентов",
          "Расходы на рекламу и маркетинг"
        ],
        correctOptionIdx: 1,
        explanation: "Альтернативная стоимость — это ценность наилучшего из невыбранных вариантов, которым пришлось пожертвовать ради принятия текущего решения."
      }
    ]
  }
];

export const SEED_QUIZ_ATTEMPTS: QuizAttempt[] = [];

export const SEED_SOUVENIR_ORDERS: SouvenirOrder[] = [];

// Helper to initialize data in localStorage
export function initializeStorage() {
  if (typeof window === "undefined") return;

  const storedStudents = localStorage.getItem("bseu_students");
  const storedAchievements = localStorage.getItem("bseu_achievements");
  const storedNotifications = localStorage.getItem("bseu_notifications");
  const storedQuizzes = localStorage.getItem("bseu_quizzes");
  const storedQuizAttempts = localStorage.getItem("bseu_quiz_attempts");
  const storedSouvenirs = localStorage.getItem("bseu_souvenirs");
  const storedSouvenirOrders = localStorage.getItem("bseu_souvenir_orders");

  if (!storedStudents) {
    localStorage.setItem("bseu_students", JSON.stringify(SEED_STUDENTS));
  }
  if (!storedAchievements) {
    localStorage.setItem("bseu_achievements", JSON.stringify(SEED_ACHIEVEMENTS));
  }
  if (!storedNotifications) {
    localStorage.setItem("bseu_notifications", JSON.stringify(SEED_NOTIFICATIONS));
  }
  if (!storedQuizzes) {
    localStorage.setItem("bseu_quizzes", JSON.stringify(SEED_QUIZZES));
  }
  if (!storedQuizAttempts) {
    localStorage.setItem("bseu_quiz_attempts", JSON.stringify(SEED_QUIZ_ATTEMPTS));
  }
  if (!storedSouvenirs) {
    localStorage.setItem("bseu_souvenirs", JSON.stringify(SEED_SOUVENIRS));
  }
  if (!storedSouvenirOrders) {
    localStorage.setItem("bseu_souvenir_orders", JSON.stringify(SEED_SOUVENIR_ORDERS));
  }
}

// Read functions
export function getStoredStudents(): Student[] {
  if (typeof window === "undefined") return SEED_STUDENTS;
  const items = localStorage.getItem("bseu_students");
  return items ? JSON.parse(items) : SEED_STUDENTS;
}

export function getStoredAchievements(): Achievement[] {
  if (typeof window === "undefined") return SEED_ACHIEVEMENTS;
  const items = localStorage.getItem("bseu_achievements");
  return items ? JSON.parse(items) : SEED_ACHIEVEMENTS;
}

export function getStoredNotifications(): Notification[] {
  if (typeof window === "undefined") return SEED_NOTIFICATIONS;
  const items = localStorage.getItem("bseu_notifications");
  return items ? JSON.parse(items) : SEED_NOTIFICATIONS;
}

export function getStoredQuizzes(): Quiz[] {
  if (typeof window === "undefined") return SEED_QUIZZES;
  const items = localStorage.getItem("bseu_quizzes");
  return items ? JSON.parse(items) : SEED_QUIZZES;
}

export function getStoredQuizAttempts(): QuizAttempt[] {
  if (typeof window === "undefined") return SEED_QUIZ_ATTEMPTS;
  const items = localStorage.getItem("bseu_quiz_attempts");
  return items ? JSON.parse(items) : SEED_QUIZ_ATTEMPTS;
}

export function getStoredSouvenirs(): Souvenir[] {
  if (typeof window === "undefined") return SEED_SOUVENIRS;
  const items = localStorage.getItem("bseu_souvenirs");
  return items ? JSON.parse(items) : SEED_SOUVENIRS;
}

export function getStoredSouvenirOrders(): SouvenirOrder[] {
  if (typeof window === "undefined") return SEED_SOUVENIR_ORDERS;
  const items = localStorage.getItem("bseu_souvenir_orders");
  return items ? JSON.parse(items) : SEED_SOUVENIR_ORDERS;
}

// Write functions
export function saveStoredStudents(students: Student[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("bseu_students", JSON.stringify(students));
    syncAllStudentsToFirestore(students).catch(console.error);
  }
}

export function saveStoredAchievements(achievements: Achievement[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("bseu_achievements", JSON.stringify(achievements));
  }
}

export function saveStoredNotifications(notifications: Notification[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("bseu_notifications", JSON.stringify(notifications));
  }
}

export function saveStoredQuizzes(quizzes: Quiz[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("bseu_quizzes", JSON.stringify(quizzes));
  }
}

export function saveStoredQuizAttempts(attempts: QuizAttempt[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("bseu_quiz_attempts", JSON.stringify(attempts));
  }
}

export function saveStoredSouvenirs(souvenirs: Souvenir[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("bseu_souvenirs", JSON.stringify(souvenirs));
  }
}

export function saveStoredSouvenirOrders(orders: SouvenirOrder[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("bseu_souvenir_orders", JSON.stringify(orders));
  }
}

// Helper to update student total points automatically (considering approved achievements, quizzes and souvenirs)
export function recalculateStudentPoints(studentId: string) {
  const achievements = getStoredAchievements();
  const students = getStoredStudents();
  const attempts = getStoredQuizAttempts();
  const orders = getStoredSouvenirOrders();
  
  const studentApprovedScore = achievements
    .filter(a => a.studentId === studentId && a.status === ApplicationStatus.Approved)
    .reduce((sum, current) => sum + current.points, 0);

  const quizScore = attempts
    .filter(at => at.studentId === studentId)
    .reduce((sum, current) => sum + current.pointsEarned, 0);

  const spentScore = orders
    .filter(o => o.studentId === studentId && o.status !== "cancelled")
    .reduce((sum, current) => sum + current.cost, 0);

  const finalScore = Math.max(0, studentApprovedScore + quizScore - spentScore);
  
  const updatedStudents = students.map(s => {
    if (s.id === studentId) {
      return { ...s, totalPoints: finalScore };
    }
    return s;
  });
  
  saveStoredStudents(updatedStudents);
  return updatedStudents;
}

