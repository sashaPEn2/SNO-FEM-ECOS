import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  updateDoc,
  setDoc,
} from 'firebase/firestore';

import {
  Achievement,
  Notification,
  Souvenir,
  SouvenirOrder,
  Student,
  Quiz,
  QuizAttempt,
  ApplicationStatus,
} from './types';

// В этом проекте используется локальный firestore init из firebase-applet-config.json.
// Это файл находится в корне проекта, но импортируем его как JSON.
// Vite позволяет импортировать JSON.
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig as any);
const db = getFirestore(app);

const STUDENTS_COL = 'students';
const ACHIEVEMENTS_COL = 'achievements';
const NOTIFICATIONS_COL = 'notifications';
const QUIZZES_COL = 'quizzes';
const QUIZ_ATTEMPTS_COL = 'quiz_attempts';
const SOUVENIRS_COL = 'souvenirs';
const SOUVENIR_ORDERS_COL = 'souvenir_orders';

// Минимальные функции, чтобы приложение могло стартовать и делать записи/чтение.
// Сейчас возвращаем/пишем данные базово; UI дальше можно донастроить.

export async function syncAllStudentsToFirestore(students: Student[]) {
  // Пишем батчево без оптимизаций: важнее стабильно запустить.
  await Promise.all(
    (students ?? []).map(async (s) => {
      const ref = doc(db, STUDENTS_COL, s.id);
      await setDoc(
        ref,
        {
          ...s,
        },
        { merge: true }
      );
    })
  );
}

export async function syncAllAchievementsToFirestore(achievements: Achievement[]) {
  await Promise.all(
    (achievements ?? []).map(async (a) => {
      const ref = doc(db, ACHIEVEMENTS_COL, a.id);
      await setDoc(ref, { ...a }, { merge: true });
    })
  );
}

export async function syncAllNotificationsToFirestore(notifications: Notification[]) {
  await Promise.all(
    (notifications ?? []).map(async (n) => {
      const ref = doc(db, NOTIFICATIONS_COL, n.id);
      await setDoc(ref, { ...n }, { merge: true });
    })
  );
}

export async function syncAllQuizzesToFirestore(quizzes: Quiz[]) {
  await Promise.all(
    (quizzes ?? []).map(async (q) => {
      const ref = doc(db, QUIZZES_COL, q.id);
      await setDoc(ref, { ...q }, { merge: true });
    })
  );
}

export async function syncAllQuizAttemptsToFirestore(attempts: QuizAttempt[]) {
  await Promise.all(
    (attempts ?? []).map(async (a) => {
      const ref = doc(db, QUIZ_ATTEMPTS_COL, a.id);
      await setDoc(ref, { ...a }, { merge: true });
    })
  );
}

export async function syncAllSouvenirsToFirestore(souvenirs: Souvenir[]) {
  await Promise.all(
    (souvenirs ?? []).map(async (s) => {
      const ref = doc(db, SOUVENIRS_COL, s.id);
      await setDoc(ref, { ...s }, { merge: true });
    })
  );
}

export async function syncAllSouvenirOrdersToFirestore(orders: SouvenirOrder[]) {
  await Promise.all(
    (orders ?? []).map(async (o) => {
      const ref = doc(db, SOUVENIR_ORDERS_COL, o.id);
      await setDoc(ref, { ...o }, { merge: true });
    })
  );
}

