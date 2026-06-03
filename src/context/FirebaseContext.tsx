import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';
import { StudentProfile, NewsItem, ScienceEvent, EventRegistration, ExemptionCertificate, Quiz, TimelineItem, StudentFeedback, SystemLog } from '../types';
import { initialNews, initialEvents, quizzesData, initialFeedbacks, initialLogs } from '../mockData';

interface FirebaseContextType {
  currentUser: FirebaseUser | null;
  profile: StudentProfile | null;
  news: NewsItem[];
  events: ScienceEvent[];
  registrations: EventRegistration[];
  certificates: ExemptionCertificate[];
  quizzes: Quiz[];
  timelineItems: TimelineItem[];
  completedQuizzes: Record<string, number>;
  registeredUsersList: StudentProfile[]; // For admin simulator/SNO pane
  feedbacks: StudentFeedback[];
  systemLogs: SystemLog[];
  isSandboxActive: boolean;
  setIsSandboxActive: (active: boolean) => void;
  isLoading: boolean;
  isAuthLoading: boolean;
  login: (email: string, password: string) => Promise<StudentProfile>;
  registerStudent: (profileData: Omit<StudentProfile, 'points' | 'exemptionCount'>, password: string) => Promise<StudentProfile>;
  logout: () => Promise<void>;
  likeNews: (newsId: string) => Promise<void>;
  registerForEvent: (regData: Omit<EventRegistration, 'id' | 'registrationDate' | 'qrCodeValue'>) => Promise<void>;
  cancelRegistration: (registrationId: string) => Promise<void>;
  purchaseExemption: (certData: Omit<ExemptionCertificate, 'id' | 'dateRequested' | 'verificationCode' | 'status'>) => Promise<void>;
  awardPoints: (studentIdOrName: string, amount: number, reason: string) => Promise<void>;
  createQuiz: (newQuiz: Quiz) => Promise<void>;
  createNews: (newNews: NewsItem) => Promise<void>;
  completeQuiz: (quizId: string, score: number) => Promise<void>;
  submitFeedback: (category: StudentFeedback['category'], message: string) => Promise<void>;
  updateFeedback: (id: string, updates: Partial<StudentFeedback>) => Promise<void>;
  deleteFeedback: (id: string) => Promise<void>;
  createLog: (action: string, details: string, severity?: SystemLog['severity']) => Promise<void>;
  bulkUpdateRegistrations: (registrationIds: string[], actionType: 'delete' | 'change_role' | 'mark_attended', payload?: any) => Promise<void>;
  updateStudentProfileFromAdmin: (studentId: string, fields: Partial<StudentProfile>) => Promise<void>;
  resetAllDbData: () => Promise<void>;
}

export function normalizeStudentId(id: string): string {
  const trimmed = id.trim().toUpperCase();
  // Map similar-looking Latin letters to Cyrillic counterparts to prevent layout/input mismatches for students
  const map: { [key: string]: string } = {
    'A': 'А',
    'B': 'В',
    'C': 'С',
    'E': 'Е',
    'H': 'Н',
    'K': 'К',
    'M': 'М',
    'O': 'О',
    'P': 'Р',
    'T': 'Т',
    'X': 'Х',
    'U': 'У',
    'Y': 'У'
  };
  return trimmed.split('').map(char => map[char] || char).join('');
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [isSandboxActive, setIsSandboxActive] = useState<boolean>(() => {
    const saved = localStorage.getItem('sno_sandbox_active');
    if (saved === null) {
      // By default, save to Cloud Firestore directly!
      localStorage.setItem('sno_sandbox_active', 'false');
      return false;
    }
    return saved === 'true';
  });

  const [sandboxUser, setSandboxUser] = useState<StudentProfile | null>(() => {
    const saved = localStorage.getItem('sno_sandbox_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [sbNews, setSbNews] = useState<NewsItem[]>(() => {
    const saved = localStorage.getItem('sno_sb_news');
    return saved ? JSON.parse(saved) : initialNews;
  });

  const [sbEvents, setSbEvents] = useState<ScienceEvent[]>(() => {
    const saved = localStorage.getItem('sno_sb_events');
    return saved ? JSON.parse(saved) : initialEvents;
  });

  const [sbQuizzes, setSbQuizzes] = useState<Quiz[]>(() => {
    const saved = localStorage.getItem('sno_sb_quizzes');
    return saved ? JSON.parse(saved) : quizzesData;
  });

  const [sbCertificates, setSbCertificates] = useState<ExemptionCertificate[]>(() => {
    const saved = localStorage.getItem('sno_sb_certificates');
    return saved ? JSON.parse(saved) : [];
  });

  const [sbRegistrations, setSbRegistrations] = useState<EventRegistration[]>(() => {
    const saved = localStorage.getItem('sno_sb_registrations');
    return saved ? JSON.parse(saved) : [];
  });

  const [sbUsersList, setSbUsersList] = useState<StudentProfile[]>(() => {
    const saved = localStorage.getItem('sno_sb_users');
    if (saved) return JSON.parse(saved);
    const defaultDaria: StudentProfile = {
      studentId: 'БГЭУ-ФЭМ-30248',
      name: 'Карабанова Дарья Андреевна',
      course: 3,
      group: 'ДНЗ-2',
      points: 120,
      exemptionCount: 0,
      role: 'sno_activist',
      email: 'daria@bseu.by',
      password: '123',
      isBudget: true,
      phone: '+375 (29) 111-22-33'
    };
    const defaultAlex: StudentProfile = {
      studentId: 'БГЭУ-ФЭМ-40156',
      name: 'Некрашевич Александр Дмитриевич',
      course: 4,
      group: 'ДМУ-1',
      points: 80,
      exemptionCount: 1,
      role: 'student',
      email: 'alex@bseu.by',
      password: '123',
      isBudget: false,
      phone: '+375 (33) 222-33-44'
    };
    return [defaultDaria, defaultAlex];
  });

  const [sbTimeline, setSbTimeline] = useState<TimelineItem[]>(() => {
    const saved = localStorage.getItem('sno_sb_timeline');
    return saved ? JSON.parse(saved) : [];
  });

  const [sbCompletedQuizzes, setSbCompletedQuizzes] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('sno_sb_completed_quizzes');
    return saved ? JSON.parse(saved) : {};
  });

  const [sbFeedbacks, setSbFeedbacks] = useState<StudentFeedback[]>(() => {
    const saved = localStorage.getItem('sno_sb_feedbacks');
    return saved ? JSON.parse(saved) : initialFeedbacks;
  });

  const [sbLogs, setSbLogs] = useState<SystemLog[]>(() => {
    const saved = localStorage.getItem('sno_sb_logs');
    return saved ? JSON.parse(saved) : initialLogs;
  });

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<ScienceEvent[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [certificates, setCertificates] = useState<ExemptionCertificate[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [completedQuizzes, setCompletedQuizzes] = useState<Record<string, number>>({});
  const [registeredUsersList, setRegisteredUsersList] = useState<StudentProfile[]>([]);
  const [feedbacks, setFeedbacks] = useState<StudentFeedback[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // 1. Seed helper to populate Firestore if it is empty
  const seedDatabaseIfNeeded = async () => {
    try {
      const newsCheck = await getDocs(collection(db, 'news'));
      if (newsCheck.empty) {
        console.log("Database is empty. Seeding initial SNO FEC mock data directly to Cloud Firestore...");
        const batch = writeBatch(db);

        // Seed News
        initialNews.forEach(item => {
          const ref = doc(db, 'news', item.id);
          batch.set(ref, item);
        });

        // Seed Events
        initialEvents.forEach(item => {
          const ref = doc(db, 'events', item.id);
          batch.set(ref, item);
        });

        // Seed Quizzes
        quizzesData.forEach(item => {
          const ref = doc(db, 'quizzes', item.id);
          batch.set(ref, item);
        });

        // Seed standard users placeholder document (to make sure database has users record mapped as backup)
        const dariaRef = doc(db, 'users', 'БГЭУ-ФЭМ-30248');
        const defaultDaria: StudentProfile = {
          studentId: 'БГЭУ-ФЭМ-30248',
          name: 'Карабанова Дарья Андреевна',
          course: 3,
          group: 'ДНЗ-2',
          points: 120,
          exemptionCount: 0,
          role: 'sno_activist',
          email: 'daria@bseu.by',
          password: '123',
          isBudget: true,
          phone: '+375 (29) 111-22-33'
        };
        batch.set(dariaRef, defaultDaria);

        const alexRef = doc(db, 'users', 'БГЭУ-ФЭМ-40156');
        const defaultAlex: StudentProfile = {
          studentId: 'БГЭУ-ФЭМ-40156',
          name: 'Некрашевич Александр Дмитриевич',
          course: 4,
          group: 'ДМУ-1',
          points: 80,
          exemptionCount: 1,
          role: 'student',
          email: 'alex@bseu.by',
          password: '123',
          isBudget: false,
          phone: '+375 (33) 222-33-44'
        };
        batch.set(alexRef, defaultAlex);

        await batch.commit();
        console.log("Cloud Firestore seeded successfully.");
      }
    } catch (err) {
      console.warn("Failed to complete seeding: ", err);
    }
  };

  // Run first initialization & seed
  useEffect(() => {
    seedDatabaseIfNeeded().finally(() => {
      setIsLoading(false);
    });
  }, []);

  // 2. Real-time Listeners for public shared database resources (News, Events, Certificates)
  useEffect(() => {
    // Listen to News
    const unsubNews = onSnapshot(collection(db, 'news'), (snapshot) => {
      const nList: NewsItem[] = [];
      snapshot.forEach(doc => {
        nList.push(doc.data() as NewsItem);
      });
      // Sort news by date descending
      setNews(nList.sort((a, b) => b.date.localeCompare(a.date)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'news');
    });

    // Listen to Events
    const unsubEvents = onSnapshot(collection(db, 'events'), (snapshot) => {
      const eList: ScienceEvent[] = [];
      snapshot.forEach(doc => {
        eList.push(doc.data() as ScienceEvent);
      });
      setEvents(eList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'events');
    });

    // Listen to All Exemption Certificates for registry and verification purposes
    const unsubcerts = onSnapshot(collection(db, 'certificates'), (snapshot) => {
      const cList: ExemptionCertificate[] = [];
      snapshot.forEach(doc => {
        cList.push(doc.data() as ExemptionCertificate);
      });
      setCertificates(cList.sort((a, b) => b.dateRequested.localeCompare(a.dateRequested)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'certificates');
    });

    return () => {
      unsubNews();
      unsubEvents();
      unsubcerts();
    };
  }, []);

  // 2b. Real-time Listeners for restricted database resources (Quizzes, Registrations, Users list, Feedbacks, Logs)
  // Only subscribe when a student/activist is logged in to prevent firestore rule errors on startup
  useEffect(() => {
    if (!currentUser) {
      setQuizzes([]);
      setRegistrations([]);
      setRegisteredUsersList([]);
      setFeedbacks([]);
      setSystemLogs([]);
      return;
    }

    // Listen to Quizzes (Requires isSignedIn)
    const unsubQuizzes = onSnapshot(collection(db, 'quizzes'), (snapshot) => {
      const qList: Quiz[] = [];
      snapshot.forEach(doc => {
        qList.push(doc.data() as Quiz);
      });
      setQuizzes(qList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'quizzes');
    });

    // Listen to all registrations (Requires isSignedIn)
    const unsubRegs = onSnapshot(collection(db, 'registrations'), (snapshot) => {
      const rList: EventRegistration[] = [];
      snapshot.forEach(doc => {
        rList.push(doc.data() as EventRegistration);
      });
      setRegistrations(rList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'registrations');
    });

    // Listen to all users list for panel simulations & Activist registries (Requires isSignedIn)
    const unsubUsersList = onSnapshot(collection(db, 'users'), (snapshot) => {
      const uList: StudentProfile[] = [];
      snapshot.forEach(doc => {
        uList.push(doc.data() as StudentProfile);
      });
      setRegisteredUsersList(uList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    // Listen to all feedbacks (Requires isSignedIn)
    const unsubFeedbacks = onSnapshot(collection(db, 'feedbacks'), (snapshot) => {
      const fList: StudentFeedback[] = [];
      snapshot.forEach(doc => {
        fList.push(doc.data() as StudentFeedback);
      });
      setFeedbacks(fList.sort((a, b) => b.date.localeCompare(a.date)));
    }, (error) => {
      console.warn("Feedback snap load error: ", error);
    });

    // Listen to all system logs (Requires isSignedIn)
    const unsubLogs = onSnapshot(collection(db, 'system_logs'), (snapshot) => {
      const lList: SystemLog[] = [];
      snapshot.forEach(doc => {
        lList.push(doc.data() as SystemLog);
      });
      setSystemLogs(lList.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
    }, (error) => {
      console.warn("System logs snap load error: ", error);
    });

    return () => {
      unsubQuizzes();
      unsubRegs();
      unsubUsersList();
      unsubFeedbacks();
      unsubLogs();
    };
  }, [currentUser]);

  // 3. Auth Session restoration on mount (Firestore-based login)
  useEffect(() => {
    const savedId = localStorage.getItem('sno_active_profile_id');
    if (savedId) {
      const profileRef = doc(db, 'users', savedId);
      getDoc(profileRef).then((profileSnap) => {
        if (profileSnap.exists()) {
          const pData = profileSnap.data() as StudentProfile;
          setProfile(pData);
          setCurrentUser({
            uid: pData.studentId,
            email: pData.email || '',
            displayName: pData.name
          } as any);
        } else {
          localStorage.removeItem('sno_active_profile_id');
        }
        setIsAuthLoading(false);
      }).catch((err) => {
        console.error("Error reading saved profile on mount: ", err);
        setIsAuthLoading(false);
      });
    } else {
      setIsAuthLoading(false);
    }
  }, []);

  // 3b. Real-time personal doc & timeline updates
  useEffect(() => {
    if (!currentUser) {
      setProfile(null);
      setTimelineItems([]);
      return;
    }

    const userId = currentUser.uid;
    const unsubProfile = onSnapshot(doc(db, 'users', userId), (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as StudentProfile);
      }
    }, (error) => {
      console.warn("Profile snapshot error: ", error);
    });

    const timelineRef = collection(db, 'users', userId, 'timeline');
    const unsubTimeline = onSnapshot(timelineRef, (snapshot) => {
      const tList: TimelineItem[] = [];
      snapshot.forEach(doc => {
        tList.push(doc.data() as TimelineItem);
      });
      setTimelineItems(tList.sort((a, b) => b.date.localeCompare(a.date)));
    }, (error) => {
      console.warn("Timeline snapshot error: ", error);
    });

    return () => {
      unsubProfile();
      unsubTimeline();
    };
  }, [currentUser]);

  // Intercepting variables for Sandbox Fallback Mode
  const activeUser = isSandboxActive 
    ? (sandboxUser ? { uid: sandboxUser.studentId, email: sandboxUser.email, displayName: sandboxUser.name } as any : null)
    : currentUser;

  const activeProfile = isSandboxActive ? sandboxUser : profile;
  const activeNews = isSandboxActive ? sbNews : news;
  const activeEvents = isSandboxActive ? sbEvents : events;
  const activeRegistrations = isSandboxActive ? sbRegistrations : registrations;
  const activeCertificates = isSandboxActive ? sbCertificates : certificates;
  const activeQuizzes = isSandboxActive ? sbQuizzes : quizzes;
  const activeTimeline = isSandboxActive ? sbTimeline : timelineItems;
  const activeCompletedQuizzes = isSandboxActive ? sbCompletedQuizzes : completedQuizzes;
  const activeRegisteredUsersList = isSandboxActive ? sbUsersList : registeredUsersList;
  const activeFeedbacks = isSandboxActive ? sbFeedbacks : feedbacks;
  const activeLogs = isSandboxActive ? sbLogs : systemLogs;

  const handleToggleSandbox = (active: boolean) => {
    setIsSandboxActive(active);
    localStorage.setItem('sno_sandbox_active', String(active));
    if (!active) {
      setSandboxUser(null);
      localStorage.removeItem('sno_sandbox_user');
    }
  };

  // LOGIN FUNCTION
  const login = async (email: string, password: string): Promise<StudentProfile> => {
    const emailLower = email.toLowerCase().trim();
    const idNormalized = normalizeStudentId(email);

    if (isSandboxActive) {
      const found = sbUsersList.find(u => 
        u.email?.toLowerCase().trim() === emailLower || normalizeStudentId(u.studentId) === idNormalized
      );
      if (found) {
        const expectedPassword = found.password || '123';
        if (expectedPassword === password) {
          setSandboxUser(found);
          localStorage.setItem('sno_sandbox_user', JSON.stringify(found));
          return found;
        }
        throw new Error("Неверный пароль. Пожалуйста, введите корректный пароль!");
      }
      throw new Error("Студент не найден в локальной базе песочницы. Пожалуйста, пройдите самостоятельно Регистрацию!");
    }

    try {
      const querySnap = await getDocs(collection(db, 'users'));
      let studentExists = false;
      let passwordMatched = false;
      let matchedProfile: StudentProfile | null = null;

      querySnap.forEach(docSnap => {
        const p = docSnap.data() as StudentProfile;
        const pEmail = p.email?.toLowerCase().trim() || '';
        const pIdNormalized = normalizeStudentId(p.studentId);
        if (pEmail === emailLower || pIdNormalized === idNormalized) {
          studentExists = true;
          const expectedPassword = p.password || '123';
          if (expectedPassword === password) {
            passwordMatched = true;
            matchedProfile = p;
          }
        }
      });

      if (matchedProfile) {
        const prof = matchedProfile as StudentProfile;
        setCurrentUser({
          uid: prof.studentId,
          email: prof.email || '',
          displayName: prof.name
        } as any);
        setProfile(prof);
        localStorage.setItem('sno_active_profile_id', prof.studentId);
        return prof;
      }

      if (studentExists) {
        throw new Error("Неверный пароль. Пожалуйста, введите корректный пароль!");
      }

      throw new Error("Студент не найден в облачной базе СНО ФЭМ или неверный пароль. Пожалуйста, пройдите самостоятельно Регистрацию!");
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  };

  // REGISTER FUNCTION
  const registerStudent = async (
    profileData: Omit<StudentProfile, 'points' | 'exemptionCount'>,
    password: string
  ): Promise<StudentProfile> => {
    const studentIdNormalized = normalizeStudentId(profileData.studentId);
    const emailNormalized = profileData.email?.toLowerCase().trim() || '';

    if (isSandboxActive) {
      const idTaken = sbUsersList.some(u => normalizeStudentId(u.studentId) === studentIdNormalized);
      const emailTaken = sbUsersList.some(u => u.email?.toLowerCase().trim() === emailNormalized);

      if (idTaken) {
        throw new Error(`Студент с ID зачетной книжки ${studentIdNormalized} уже зарегистрирован!`);
      }
      if (emailNormalized && emailTaken) {
        throw new Error(`Студент с электронной почтой ${emailNormalized} уже зарегистрирован!`);
      }

      const finalProfile: StudentProfile = {
        ...profileData,
        studentId: studentIdNormalized,
        email: emailNormalized,
        points: profileData.role === 'sno_activist' ? 100 : 50, // Reward activists with 100 on start, standard with 50
        exemptionCount: 0
      };

      const updatedUsers = [...sbUsersList, finalProfile];
      setSbUsersList(updatedUsers);
      localStorage.setItem('sno_sb_users', JSON.stringify(updatedUsers));

      const initTimelineItem: TimelineItem = {
        id: `t-init-${Date.now()}`,
        type: 'academic_award',
        title: 'Успешная регистрация в локальной песочнице СНО ФЭМ',
        date: new Date().toISOString().split('T')[0],
        pointsChange: finalProfile.points,
        details: 'Приветственный грант научных баллов СНО за авторизацию локального кабинета исследователя.',
        isReward: true
      };
      
      const updatedTimeline = [initTimelineItem, ...sbTimeline];
      setSbTimeline(updatedTimeline);
      localStorage.setItem('sno_sb_timeline', JSON.stringify(updatedTimeline));

      setSandboxUser(finalProfile);
      localStorage.setItem('sno_sandbox_user', JSON.stringify(finalProfile));
      return finalProfile;
    }

    try {
      const allUsersSnap = await getDocs(collection(db, 'users'));
      let idTaken = false;
      let emailTaken = false;

      allUsersSnap.forEach(docSnap => {
        const u = docSnap.data() as StudentProfile;
        if (normalizeStudentId(u.studentId) === studentIdNormalized) {
          idTaken = true;
        }
        if (emailNormalized && u.email?.toLowerCase().trim() === emailNormalized) {
          emailTaken = true;
        }
      });

      if (idTaken) {
        throw new Error(`Студент с ID зачетной книжки ${studentIdNormalized} уже зарегистрирован!`);
      }
      if (emailTaken) {
        throw new Error(`Студент с электронной почтой ${emailNormalized} уже зарегистрирован!`);
      }

      // Draft profile payload
      const finalProfile: StudentProfile = {
        ...profileData,
        studentId: studentIdNormalized,
        email: emailNormalized,
        password,
        points: profileData.role === 'sno_activist' ? 100 : 50, // Reward activists with 100 on start, standard with 50
        exemptionCount: 0
      };

      // Write direct to Firestore
      const userRef = doc(db, 'users', studentIdNormalized);
      await setDoc(userRef, finalProfile);

      // Create initial timeline award log
      const timelineRef = doc(db, 'users', studentIdNormalized, 'timeline', 't-init-0');
      const initTimelineItem: TimelineItem = {
        id: 't-init-0',
        type: 'academic_award',
        title: 'Успешная регистрация в облачной базе СНО ФЭМ БГЭУ',
        date: new Date().toISOString().split('T')[0],
        pointsChange: finalProfile.points,
        details: 'Приветственный грант научных баллов СНО за авторизацию личного кабинета исследователя.',
        isReward: true
      };
      await setDoc(timelineRef, initTimelineItem);

      // Set active session context
      setCurrentUser({
        uid: finalProfile.studentId,
        email: finalProfile.email || '',
        displayName: finalProfile.name
      } as any);
      setProfile(finalProfile);
      localStorage.setItem('sno_active_profile_id', finalProfile.studentId);

      return finalProfile;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  // LOGOUT FUNCTION
  const logout = async () => {
    if (isSandboxActive) {
      setSandboxUser(null);
      localStorage.removeItem('sno_sandbox_user');
      return;
    }
    setCurrentUser(null);
    setProfile(null);
    localStorage.removeItem('sno_active_profile_id');
  };

  // LIKE ARTICLES
  const likeNews = async (newsId: string) => {
    if (isSandboxActive) {
      const updated = sbNews.map(n => {
        if (n.id === newsId) {
          const alreadyLiked = n.isLiked;
          return {
            ...n,
            likes: alreadyLiked ? Math.max(0, n.likes - 1) : n.likes + 1,
            isLiked: !alreadyLiked
          };
        }
        return n;
      });
      setSbNews(updated);
      localStorage.setItem('sno_sb_news', JSON.stringify(updated));
      return;
    }

    try {
      const matchNews = news.find(n => n.id === newsId);
      if (!matchNews) return;
      const alreadyLiked = matchNews.isLiked;
      const ref = doc(db, 'news', newsId);
      await updateDoc(ref, {
        likes: alreadyLiked ? Math.max(0, matchNews.likes - 1) : matchNews.likes + 1,
        isLiked: !alreadyLiked
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `news/${newsId}`);
    }
  };

  // EVENT BOOKING
  const registerForEvent = async (regData: Omit<EventRegistration, 'id' | 'registrationDate' | 'qrCodeValue'>) => {
    const activeProf = isSandboxActive ? sandboxUser : profile;
    if (!activeProf) return;

    if (isSandboxActive) {
      const mockId = `REG-${Math.floor(Math.random() * 9000 + 1000)}`;
      const mockCode = `BSEU-FEM-CONF-${regData.eventId}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const newRegistration: EventRegistration = {
        ...regData,
        studentId: activeProf.studentId,
        id: mockId,
        registrationDate: new Date().toLocaleDateString('ru-RU'),
        qrCodeValue: mockCode,
      };

      const updatedRegs = [...sbRegistrations, newRegistration];
      setSbRegistrations(updatedRegs);
      localStorage.setItem('sno_sb_registrations', JSON.stringify(updatedRegs));

      const matchingEvent = sbEvents.find(e => e.id === regData.eventId);
      if (matchingEvent) {
        const updatedEvents = sbEvents.map(e => e.id === regData.eventId ? { ...e, registeredCount: e.registeredCount + 1 } : e);
        setSbEvents(updatedEvents);
        localStorage.setItem('sno_sb_events', JSON.stringify(updatedEvents));

        const rewardPoints = regData.role === 'speaker'
          ? matchingEvent.pointsForSpeaker
          : matchingEvent.pointsForListener;
        
        const nextPoints = activeProf.points + rewardPoints;
        const updatedProfile = { ...activeProf, points: nextPoints };
        setSandboxUser(updatedProfile);
        localStorage.setItem('sno_sandbox_user', JSON.stringify(updatedProfile));

        const updatedUsersList = sbUsersList.map(u => u.studentId === activeProf.studentId ? updatedProfile : u);
        setSbUsersList(updatedUsersList);
        localStorage.setItem('sno_sb_users', JSON.stringify(updatedUsersList));

        const regItem: TimelineItem = {
          id: `t-reg-${mockId}`,
          type: 'event_registration',
          title: `Регистрация: ${regData.eventTitle}`,
          date: new Date().toISOString().split('T')[0],
          pointsChange: rewardPoints,
          details: `Роль: ${regData.role === 'speaker' ? 'Докладчик' : 'Слушатель'}. ${regData.paperTitle ? `Тема доклада: «${regData.paperTitle}»` : 'Участие в дискуссиях и научных дебатах группы.'}`,
        };
        const updatedTimeline = [regItem, ...sbTimeline];
        setSbTimeline(updatedTimeline);
        localStorage.setItem('sno_sb_timeline', JSON.stringify(updatedTimeline));
      }
      return;
    }

    if (!currentUser) return;
    try {
      const mockId = `REG-${Math.floor(Math.random() * 9000 + 1000)}`;
      const mockCode = `BSEU-FEM-CONF-${regData.eventId}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const newRegistration: EventRegistration = {
        ...regData,
        studentId: activeProf.studentId,
        id: mockId,
        registrationDate: new Date().toLocaleDateString('ru-RU'),
        qrCodeValue: mockCode,
      };

      // 1. Write registration document
      await setDoc(doc(db, 'registrations', mockId), newRegistration);

      // 2. Increment count on conference event
      const matchingEvent = events.find(e => e.id === regData.eventId);
      if (matchingEvent) {
        await updateDoc(doc(db, 'events', regData.eventId), {
          registeredCount: matchingEvent.registeredCount + 1
        });

        // 3. Earn points for the student
        const rewardPoints = regData.role === 'speaker'
          ? matchingEvent.pointsForSpeaker
          : matchingEvent.pointsForListener;
        
        const nextPoints = activeProf.points + rewardPoints;
        await updateDoc(doc(db, 'users', currentUser.uid), {
          points: nextPoints
        });

        // 4. Add registration milestone timeline log
        const timelineRef = doc(db, 'users', currentUser.uid, 'timeline', `t-reg-${mockId}`);
        const regItem: TimelineItem = {
          id: `t-reg-${mockId}`,
          type: 'event_registration',
          title: `Регистрация: ${regData.eventTitle}`,
          date: new Date().toISOString().split('T')[0],
          pointsChange: rewardPoints,
          details: `Роль: ${regData.role === 'speaker' ? 'Докладчик' : 'Слушатель'}. ${regData.paperTitle ? `Тема доклада: «${regData.paperTitle}»` : 'Участие в дискуссиях и научных дебатах группы.'}`,
        };
        await setDoc(timelineRef, regItem);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'registrations');
    }
  };

  // CANCEL EVENT BOOKING
  const cancelRegistration = async (registrationId: string) => {
    const activeProf = isSandboxActive ? sandboxUser : profile;
    if (!activeProf) return;

    if (isSandboxActive) {
      const regToCancel = sbRegistrations.find(r => r.id === registrationId);
      if (!regToCancel) return;

      const updatedRegs = sbRegistrations.filter(r => r.id !== registrationId);
      setSbRegistrations(updatedRegs);
      localStorage.setItem('sno_sb_registrations', JSON.stringify(updatedRegs));

      const matchingEvent = sbEvents.find(e => e.id === regToCancel.eventId);
      if (matchingEvent) {
        const updatedEvents = sbEvents.map(e => e.id === regToCancel.eventId ? { ...e, registeredCount: Math.max(0, e.registeredCount - 1) } : e);
        setSbEvents(updatedEvents);
        localStorage.setItem('sno_sb_events', JSON.stringify(updatedEvents));

        const rewardPoints = regToCancel.role === 'speaker'
          ? matchingEvent.pointsForSpeaker
          : matchingEvent.pointsForListener;
        
        const nextPoints = Math.max(0, activeProf.points - rewardPoints);
        const updatedProfile = { ...activeProf, points: nextPoints };
        setSandboxUser(updatedProfile);
        localStorage.setItem('sno_sandbox_user', JSON.stringify(updatedProfile));

        const updatedUsersList = sbUsersList.map(u => u.studentId === activeProf.studentId ? updatedProfile : u);
        setSbUsersList(updatedUsersList);
        localStorage.setItem('sno_sb_users', JSON.stringify(updatedUsersList));

        const updatedTimeline = sbTimeline.filter(t => t.id !== `t-reg-${registrationId}`);
        setSbTimeline(updatedTimeline);
        localStorage.setItem('sno_sb_timeline', JSON.stringify(updatedTimeline));
      }
      return;
    }

    if (!currentUser) return;
    try {
      const regToCancel = registrations.find(r => r.id === registrationId);
      if (!regToCancel) return;

      // 1. Delete registration doc
      await deleteDoc(doc(db, 'registrations', registrationId));

      // 2. Decrease count inside corresponding event
      const matchingEvent = events.find(e => e.id === regToCancel.eventId);
      if (matchingEvent) {
        await updateDoc(doc(db, 'events', regToCancel.eventId), {
          registeredCount: Math.max(0, matchingEvent.registeredCount - 1)
        });

        // 3. Deduct points earned to prevent exploits
        const rewardPoints = regToCancel.role === 'speaker'
          ? matchingEvent.pointsForSpeaker
          : matchingEvent.pointsForListener;
        
        await updateDoc(doc(db, 'users', currentUser.uid), {
          points: Math.max(0, activeProf.points - rewardPoints)
        });

        // 4. Remove timeline log
        await deleteDoc(doc(db, 'users', currentUser.uid, 'timeline', `t-reg-${registrationId}`));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `registrations/${registrationId}`);
    }
  };

  // EXCHANGE SCIENTIFIC POINTS FOR EXEMPTION SLIP
  const purchaseExemption = async (certData: Omit<ExemptionCertificate, 'id' | 'dateRequested' | 'verificationCode' | 'status'>) => {
    const activeProf = isSandboxActive ? sandboxUser : profile;
    if (!activeProf) return;

    if (isSandboxActive) {
      const mockId = `CERT-BSEU-${Math.floor(Math.random() * 90000 + 10000)}`;
      const mockCode = `BSEU-EXEMPT-FEM-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${certData.targetExemptionDate.replace(/-/g, '')}`;

      const newCertificate: ExemptionCertificate = {
        ...certData,
        studentId: activeProf.studentId,
        id: mockId,
        dateRequested: new Date().toLocaleDateString('ru-RU'),
        verificationCode: mockCode,
        status: 'active',
      };

      const updatedCerts = [newCertificate, ...sbCertificates];
      setSbCertificates(updatedCerts);
      localStorage.setItem('sno_sb_certificates', JSON.stringify(updatedCerts));

      const nextPoints = Math.max(0, activeProf.points - certData.pointsDeducted);
      const updatedProfile = { ...activeProf, points: nextPoints, exemptionCount: activeProf.exemptionCount + 1 };
      setSandboxUser(updatedProfile);
      localStorage.setItem('sno_sandbox_user', JSON.stringify(updatedProfile));

      const updatedUsersList = sbUsersList.map(u => u.studentId === activeProf.studentId ? updatedProfile : u);
      setSbUsersList(updatedUsersList);
      localStorage.setItem('sno_sb_users', JSON.stringify(updatedUsersList));

      const certItem: TimelineItem = {
        id: `t-cert-${mockId}`,
        type: 'exemption_purchase',
        title: 'Справка-освобождение от занятий',
        date: new Date().toISOString().split('T')[0],
        pointsChange: -certData.pointsDeducted,
        details: certData.endDate && certData.endDate !== certData.targetExemptionDate
          ? `Согласовано освобождение от занятий с ${new Date(certData.targetExemptionDate).toLocaleDateString('ru-RU')} по ${new Date(certData.endDate).toLocaleDateString('ru-RU')} г. Обоснование: «${certData.reason}»`
          : `Согласовано освобождение на ${new Date(certData.targetExemptionDate).toLocaleDateString('ru-RU')} г. Обоснование: «${certData.reason}»`,
      };
      const updatedTimeline = [certItem, ...sbTimeline];
      setSbTimeline(updatedTimeline);
      localStorage.setItem('sno_sb_timeline', JSON.stringify(updatedTimeline));
      return;
    }

    if (!currentUser) return;
    try {
      const mockId = `CERT-BSEU-${Math.floor(Math.random() * 90000 + 10000)}`;
      const mockCode = `BSEU-EXEMPT-FEM-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${certData.targetExemptionDate.replace(/-/g, '')}`;

      const newCertificate: ExemptionCertificate = {
        ...certData,
        studentId: activeProf.studentId,
        id: mockId,
        dateRequested: new Date().toLocaleDateString('ru-RU'),
        verificationCode: mockCode,
        status: 'active',
      };

      // 1. Create certificate in public registry
      await setDoc(doc(db, 'certificates', mockId), newCertificate);

      // 2. Deduct exact cost & increase usage statistic counter
      await updateDoc(doc(db, 'users', currentUser.uid), {
        points: Math.max(0, activeProf.points - certData.pointsDeducted),
        exemptionCount: activeProf.exemptionCount + 1
      });

      // 3. Write purchase milestone inside timeline
      const timelineRef = doc(db, 'users', currentUser.uid, 'timeline', `t-cert-${mockId}`);
      const certItem: TimelineItem = {
        id: `t-cert-${mockId}`,
        type: 'exemption_purchase',
        title: 'Справка-освобождение от занятий',
        date: new Date().toISOString().split('T')[0],
        pointsChange: -certData.pointsDeducted,
        details: certData.endDate && certData.endDate !== certData.targetExemptionDate
          ? `Согласовано освобождение от занятий с ${new Date(certData.targetExemptionDate).toLocaleDateString('ru-RU')} по ${new Date(certData.endDate).toLocaleDateString('ru-RU')} г. Обоснование: «${certData.reason}»`
          : `Согласовано освобождение на ${new Date(certData.targetExemptionDate).toLocaleDateString('ru-RU')} г. Обоснование: «${certData.reason}»`,
      };
      await setDoc(timelineRef, certItem);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'certificates');
    }
  };

  // AWARD SCIENTIFIC RATING POINTS (SNO ACTIVIST ROLE)
  const awardPoints = async (studentIdOrName: string, amount: number, reason: string) => {
    if (isSandboxActive) {
      const targetUser = sbUsersList.find(u => u.studentId === studentIdOrName || u.name === studentIdOrName);
      if (!targetUser) {
        throw new Error("Студент с указанным ID или именем не обнаружен в локальной песочнице.");
      }

      const updatedPoints = targetUser.points + amount;
      const updatedProfile = { ...targetUser, points: updatedPoints };
      
      const updatedUsersList = sbUsersList.map(u => u.studentId === targetUser.studentId ? updatedProfile : u);
      setSbUsersList(updatedUsersList);
      localStorage.setItem('sno_sb_users', JSON.stringify(updatedUsersList));

      if (sandboxUser && sandboxUser.studentId === targetUser.studentId) {
        setSandboxUser(updatedProfile);
        localStorage.setItem('sno_sandbox_user', JSON.stringify(updatedProfile));
      }

      const logId = `t-award-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now()}`;
      const logItem: TimelineItem = {
        id: logId,
        type: 'academic_award',
        title: `Начисление от Актива СНО: ${amount} баллов`,
        date: new Date().toISOString().split('T')[0],
        pointsChange: amount,
        details: `Рейтинг начислен организатором за: «${reason}». Решение утверждено научным активом ФЭМ БГЭУ.`,
      };
      
      const updatedTimeline = [logItem, ...sbTimeline];
      setSbTimeline(updatedTimeline);
      localStorage.setItem('sno_sb_timeline', JSON.stringify(updatedTimeline));
      return;
    }

    try {
      // Find matching user document
      const targetUser = registeredUsersList.find(u => u.studentId === studentIdOrName || u.name === studentIdOrName);
      if (!targetUser) {
        throw new Error("Студент с указанным ID или именем не обнаружен в системе.");
      }

      const querySnap = await getDocs(collection(db, 'users'));
      let matchedUid = "";
      querySnap.forEach(doc => {
        const d = doc.data() as StudentProfile;
        if (d.studentId === targetUser.studentId) {
          matchedUid = doc.id;
        }
      });

      if (!matchedUid) {
        throw new Error("Не удалось сослаться на UID документа зачетки.");
      }

      // 1. Update points directly in Firestore users/{matchedUid}
      const updatedPoints = targetUser.points + amount;
      await updateDoc(doc(db, 'users', matchedUid), {
        points: updatedPoints
      });

      // 2. Post new activity milestone in student's timeline
      const logId = `t-award-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now()}`;
      const logItem: TimelineItem = {
        id: logId,
        type: 'academic_award',
        title: `Начисление от Актива СНО: ${amount} баллов`,
        date: new Date().toISOString().split('T')[0],
        pointsChange: amount,
        details: `Рейтинг начислен организатором за: «${reason}». Решение утверждено научным активом ФЭМ БГЭУ.`,
      };
      await setDoc(doc(db, 'users', matchedUid, 'timeline', logId), logItem);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'users');
    }
  };

  // CREATE CUSTOM SCIENTIFIC QUIZ (SNO ACTIVIST ROLE)
  const createQuiz = async (newQuiz: Quiz) => {
    if (isSandboxActive) {
      const updated = [...sbQuizzes, newQuiz];
      setSbQuizzes(updated);
      localStorage.setItem('sno_sb_quizzes', JSON.stringify(updated));
      return;
    }

    try {
      await setDoc(doc(db, 'quizzes', newQuiz.id), newQuiz);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `quizzes/${newQuiz.id}`);
    }
  };

  // CREATE CUSTOM NEWS ITEM (SNO ACTIVIST ROLE)
  const createNews = async (newNews: NewsItem) => {
    if (isSandboxActive) {
      const updated = [newNews, ...sbNews];
      setSbNews(updated);
      localStorage.setItem('sno_sb_news', JSON.stringify(updated));
      return;
    }

    try {
      await setDoc(doc(db, 'news', newNews.id), newNews);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `news/${newNews.id}`);
    }
  };

  // COMPLETE SCIENCE QUIZ & DISBURSE SCORE
  const completeQuiz = async (quizId: string, score: number) => {
    const activeProf = isSandboxActive ? sandboxUser : profile;
    if (!activeProf) return;

    if (isSandboxActive) {
      const prevHighScore = sbCompletedQuizzes[quizId] || 0;
      let nextCompleted = { ...sbCompletedQuizzes };
      if (score > prevHighScore) {
        nextCompleted = { ...sbCompletedQuizzes, [quizId]: score };
        setSbCompletedQuizzes(nextCompleted);
        localStorage.setItem('sno_sb_completed_quizzes', JSON.stringify(nextCompleted));
      }

      const matchingQuiz = sbQuizzes.find(q => q.id === quizId);
      if (matchingQuiz) {
        const quizLogId = `t-quiz-${quizId}-${Date.now()}`;
        const logItem: TimelineItem = {
          id: quizLogId,
          type: 'quiz',
          title: `Пройдена викторина: "${matchingQuiz.title}"`,
          date: new Date().toISOString().split('T')[0],
          pointsChange: 0,
          details: `Результат тестирования: ${score} из ${matchingQuiz.questions.length} правильных ответов.`,
        };
        const updatedTimeline = [logItem, ...sbTimeline];
        setSbTimeline(updatedTimeline);
        localStorage.setItem('sno_sb_timeline', JSON.stringify(updatedTimeline));
      }
      return;
    }

    if (!currentUser) return;
    try {
      const prevHighScore = completedQuizzes[quizId] || 0;
      if (score > prevHighScore) {
        setCompletedQuizzes(prev => ({ ...prev, [quizId]: score }));
      }

      const matchingQuiz = quizzes.find(q => q.id === quizId);
      if (matchingQuiz) {
        const quizLogId = `t-quiz-${quizId}-${Date.now()}`;
        const logItem: TimelineItem = {
          id: quizLogId,
          type: 'quiz',
          title: `Пройдена викторина: "${matchingQuiz.title}"`,
          date: new Date().toISOString().split('T')[0],
          pointsChange: 0,
          details: `Результат тестирования: ${score} из ${matchingQuiz.questions.length} правильных ответов.`,
        };
        await setDoc(doc(db, 'users', currentUser.uid, 'timeline', quizLogId), logItem);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${currentUser.uid}/timeline`);
    }
  };

  // UPDATE STUDENT PROFILE FIELDS (ADMIN SIMULATOR OVERRIDES)
  const updateStudentProfileFromAdmin = async (studentId: string, fields: Partial<StudentProfile>) => {
    if (isSandboxActive) {
      const updatedUsersList = sbUsersList.map(u => {
        if (u.studentId === studentId) {
          const updated = { ...u, ...fields };
          if (sandboxUser && sandboxUser.studentId === studentId) {
            setSandboxUser(updated);
            localStorage.setItem('sno_sandbox_user', JSON.stringify(updated));
          }
          return updated;
        }
        return u;
      });
      setSbUsersList(updatedUsersList);
      localStorage.setItem('sno_sb_users', JSON.stringify(updatedUsersList));
      return;
    }

    try {
      const querySnap = await getDocs(collection(db, 'users'));
      let targetUid = "";
      querySnap.forEach(docSnap => {
        const d = docSnap.data() as StudentProfile;
        if (d.studentId === studentId) {
          targetUid = docSnap.id;
        }
      });

      if (targetUid) {
        await updateDoc(doc(db, 'users', targetUid), fields);
        if (currentUser && targetUid === currentUser.uid) {
          setProfile(p => p ? { ...p, ...fields } : null);
        }
      } else {
        if (currentUser) {
          await setDoc(doc(db, 'users', currentUser.uid), fields, { merge: true });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // RESET ALL SYSTEM DATA & WIPE DATA VECTORS
  const resetAllDbData = async () => {
    if (isSandboxActive) {
      setSbNews(initialNews);
      setSbEvents(initialEvents);
      setSbQuizzes(quizzesData);
      setSbCertificates([]);
      setSbRegistrations([]);
      setSbTimeline([]);
      setSbCompletedQuizzes({});
      
      const defaultDaria: StudentProfile = {
        studentId: 'БГЭУ-ФЭМ-30248',
        name: 'Карабанова Дарья Андреевна',
        course: 3,
        group: 'ДНЗ-2',
        points: 120,
        exemptionCount: 0,
        role: 'sno_activist',
        email: 'daria@bseu.by',
        password: '123',
        isBudget: true,
        phone: '+375 (29) 111-22-33'
      };
      setSbUsersList([defaultDaria]);
      if (sandboxUser) {
        const resetMe = { ...sandboxUser, points: 50, exemptionCount: 0 };
        setSandboxUser(resetMe);
        localStorage.setItem('sno_sandbox_user', JSON.stringify(resetMe));
      }
      
      localStorage.removeItem('sno_sb_news');
      localStorage.removeItem('sno_sb_events');
      localStorage.removeItem('sno_sb_quizzes');
      localStorage.removeItem('sno_sb_certificates');
      localStorage.removeItem('sno_sb_registrations');
      localStorage.removeItem('sno_sb_timeline');
      localStorage.removeItem('sno_sb_completed_quizzes');
      localStorage.removeItem('sno_sb_users');
      return;
    }

    try {
      console.log("Wiping client database caches. Resetting default seed schemas...");
      setCompletedQuizzes({});
      await seedDatabaseIfNeeded();
    } catch (err) {
      console.warn(err);
    }
  };

  // SUBMIT STUDENT FEEDBACK (STUDENT ROLE)
  const submitFeedback = async (category: StudentFeedback['category'], message: string) => {
    const activeProf = isSandboxActive ? sandboxUser : profile;
    const id = `feed-${Date.now()}`;
    const newFeedback: StudentFeedback = {
      id,
      studentId: activeProf?.studentId || 'Гость',
      studentName: activeProf?.name || 'Анонимный Студент',
      studentGroup: activeProf?.group || 'БГЭУ',
      category,
      message,
      date: new Date().toISOString().split('T')[0],
      status: 'new'
    };

    if (isSandboxActive) {
      const updated = [newFeedback, ...sbFeedbacks];
      setSbFeedbacks(updated);
      localStorage.setItem('sno_sb_feedbacks', JSON.stringify(updated));
      await createLog('Обратная связь', `Студент ${newFeedback.studentName} отправил отзыв категории «${category}»`, 'info');
      return;
    }

    try {
      await setDoc(doc(db, 'feedbacks', id), newFeedback);
      await createLog('Обратная связь', `Студент ${newFeedback.studentName} отправил отзыв категории «${category}»`, 'info');
    } catch (err) {
      console.error("Failed to submit feedback", err);
    }
  };

  // UPDATE FEEDBACK ENTRY (SNO ACTIVIST ROLE)
  const updateFeedback = async (id: string, updates: Partial<StudentFeedback>) => {
    if (isSandboxActive) {
      const updated = sbFeedbacks.map(f => f.id === id ? { ...f, ...updates } : f);
      setSbFeedbacks(updated);
      localStorage.setItem('sno_sb_feedbacks', JSON.stringify(updated));
      const matched = sbFeedbacks.find(f => f.id === id);
      if (matched) {
        await createLog('Обработка отзыва', `Обновлен статус отзыва от ${matched.studentName} на «${updates.status || matched.status}»`, 'success');
      }
      return;
    }

    try {
      await updateDoc(doc(db, 'feedbacks', id), updates);
      const matched = feedbacks.find(f => f.id === id);
      if (matched) {
        await createLog('Обработка отзыва', `Обновлен статус отзыва от ${matched.studentName} на «${updates.status || matched.status}»`, 'success');
      }
    } catch (err) {
      console.error("Failed to update feedback", err);
    }
  };

  // DELETE FEEDBACK ENTRY (SNO ACTIVIST ROLE)
  const deleteFeedback = async (id: string) => {
    if (isSandboxActive) {
      const updated = sbFeedbacks.filter(f => f.id !== id);
      setSbFeedbacks(updated);
      localStorage.setItem('sno_sb_feedbacks', JSON.stringify(updated));
      await createLog('Удаление отзыва', `Отзыв ${id} был удален администратором`, 'warning');
      return;
    }

    try {
      await deleteDoc(doc(db, 'feedbacks', id));
      await createLog('Удаление отзыва', `Отзыв ${id} был удален администратором`, 'warning');
    } catch (err) {
      console.error("Failed to delete feedback", err);
    }
  };

  // CREATE SYSTEM ACTION LOG
  const createLog = async (action: string, details: string, severity: SystemLog['severity'] = 'info') => {
    const activeProf = isSandboxActive ? sandboxUser : profile;
    const id = `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newLog: SystemLog = {
      id,
      timestamp: new Date().toISOString(),
      action,
      userEmail: activeProf?.email || 'system@bseu.by',
      userName: activeProf?.name || 'Система СНО',
      details,
      severity
    };

    if (isSandboxActive) {
      const updated = [newLog, ...sbLogs];
      setSbLogs(updated);
      localStorage.setItem('sno_sb_logs', JSON.stringify(updated));
      return;
    }

    try {
      await setDoc(doc(db, 'system_logs', id), newLog);
    } catch (err) {
      console.error("Failed to write system log in Firestore", err);
    }
  };

  // BULK OPERATIONS FOR REGISTRATIONS
  const bulkUpdateRegistrations = async (
    registrationIds: string[],
    actionType: 'delete' | 'change_role' | 'mark_attended',
    payload?: any
  ) => {
    if (isSandboxActive) {
      let updatedRegs = [...sbRegistrations];
      let updatedTimeline = [...sbTimeline];
      let updatedEvents = [...sbEvents];
      let updatedUsers = [...sbUsersList];
      let activeU = sandboxUser ? { ...sandboxUser } : null;

      if (actionType === 'delete') {
        registrationIds.forEach(id => {
          const reg = sbRegistrations.find(r => r.id === id);
          if (reg) {
            const ev = updatedEvents.find(e => e.id === reg.eventId);
            if (ev) {
              ev.registeredCount = Math.max(0, ev.registeredCount - 1);
            }
          }
        });
        updatedRegs = sbRegistrations.filter(r => !registrationIds.includes(r.id));
        await createLog('Пакетные операции', `Пакетное удаление ${registrationIds.length} регистраций на события.`, 'warning');
      } 
      else if (actionType === 'change_role') {
        const targetRole = payload?.role || 'listener';
        updatedRegs = sbRegistrations.map(r => {
          if (registrationIds.includes(r.id)) {
            return { ...r, role: targetRole };
          }
          return r;
        });
        await createLog('Пакетные операции', `Групповое изменение роли для ${registrationIds.length} участников на «${targetRole === 'speaker' ? 'Докладчик' : 'Слушатель'}»`, 'info');
      }
      else if (actionType === 'mark_attended') {
        registrationIds.forEach(id => {
          const reg = sbRegistrations.find(r => r.id === id);
          if (reg) {
            const matchingEvent = sbEvents.find(e => e.id === reg.eventId);
            const pointsReward = reg.role === 'speaker'
              ? (matchingEvent?.pointsForSpeaker || 100)
              : (matchingEvent?.pointsForListener || 30);

            updatedUsers = updatedUsers.map(user => {
              if (user.studentId === reg.studentId) {
                const newP = user.points + pointsReward;
                const updatedUser = { ...user, points: newP };
                if (activeU && activeU.studentId === reg.studentId) {
                  activeU = updatedUser;
                }
                return updatedUser;
              }
              return user;
            });

            const tId = `t-bulk-award-${id}-${Date.now()}`;
            const tItem: TimelineItem = {
              id: tId,
              type: 'event_registration',
              title: `Подтверждено участие: ${reg.eventTitle}`,
              date: new Date().toISOString().split('T')[0],
              pointsChange: pointsReward,
              details: `Участие в событии подтверждено Активом СНО ФЭМ. Начислено ${pointsReward} баллов за роль: ${reg.role === 'speaker' ? 'Докладчик' : 'Слушатель'}.`,
            };
            updatedTimeline = [tItem, ...updatedTimeline];
          }
        });

        await createLog('Пакетные операции', `Пакетное подтверждение присутствия и начисление баллов для ${registrationIds.length} участников.`, 'success');
      }

      setSbRegistrations(updatedRegs);
      localStorage.setItem('sno_sb_registrations', JSON.stringify(updatedRegs));
      
      setSbEvents(updatedEvents);
      localStorage.setItem('sno_sb_events', JSON.stringify(updatedEvents));

      setSbUsersList(updatedUsers);
      localStorage.setItem('sno_sb_users', JSON.stringify(updatedUsers));

      setSbTimeline(updatedTimeline);
      localStorage.setItem('sno_sb_timeline', JSON.stringify(updatedTimeline));

      if (activeU) {
        setSandboxUser(activeU);
        localStorage.setItem('sno_sandbox_user', JSON.stringify(activeU));
      }
      return;
    }

    try {
      const batch = writeBatch(db);
      
      if (actionType === 'delete') {
        for (const id of registrationIds) {
          const reg = registrations.find(r => r.id === id);
          if (reg) {
            const ev = events.find(e => e.id === reg.eventId);
            if (ev) {
              batch.update(doc(db, 'events', reg.eventId), {
                registeredCount: Math.max(0, ev.registeredCount - 1)
              });
            }
            batch.delete(doc(db, 'registrations', id));
          }
        }
        await batch.commit();
        await createLog('Пакетные операции', `Пакетное удаление ${registrationIds.length} регистраций в облаке.`, 'warning');
      }
      else if (actionType === 'change_role') {
        const targetRole = payload?.role || 'listener';
        for (const id of registrationIds) {
          batch.update(doc(db, 'registrations', id), { role: targetRole });
        }
        await batch.commit();
        await createLog('Пакетные операции', `Групповое изменение роли (${targetRole}) для ${registrationIds.length} участников в облаке.`, 'info');
      }
      else if (actionType === 'mark_attended') {
        for (const id of registrationIds) {
          const reg = registrations.find(r => r.id === id);
          if (reg) {
            const event = events.find(e => e.id === reg.eventId);
            const pointsReward = reg.role === 'speaker'
              ? (event?.pointsForSpeaker || 100)
              : (event?.pointsForListener || 30);

            const student = registeredUsersList.find(u => u.studentId === reg.studentId);
            if (student) {
              const userSnap = await getDocs(collection(db, 'users'));
              let userDocId = "";
              userSnap.forEach(snap => {
                if ((snap.data() as StudentProfile).studentId === reg.studentId) {
                  userDocId = snap.id;
                }
              });

              if (userDocId) {
                const nextPoints = student.points + pointsReward;
                batch.update(doc(db, 'users', userDocId), { points: nextPoints });

                const tId = `t-bulk-award-${id}-${Date.now()}`;
                const tItem: TimelineItem = {
                  id: tId,
                  type: 'event_registration',
                  title: `Подтверждено участие: ${reg.eventTitle}`,
                  date: new Date().toISOString().split('T')[0],
                  pointsChange: pointsReward,
                  details: `Участие в событии подтверждено Активом СНО ФЭМ. Начислено ${pointsReward} баллов за роль: ${reg.role === 'speaker' ? 'Докладчик' : 'Слушатель'}.`,
                };
                batch.set(doc(db, 'users', userDocId, 'timeline', tId), tItem);
              }
            }
          }
        }
        await batch.commit();
        await createLog('Пакетные операции', `Пакетное начисление баллов и присутствие ${registrationIds.length} участников подтверждено в облаке.`, 'success');
      }
    } catch (err) {
      console.error("Bulk action failed", err);
    }
  };

  return (
    <FirebaseContext.Provider value={{
      currentUser: activeUser,
      profile: activeProfile,
      news: activeNews,
      events: activeEvents,
      registrations: activeRegistrations,
      certificates: activeCertificates,
      quizzes: activeQuizzes,
      timelineItems: activeTimeline,
      completedQuizzes: activeCompletedQuizzes,
      registeredUsersList: activeRegisteredUsersList,
      feedbacks: activeFeedbacks,
      systemLogs: activeLogs,
      isSandboxActive,
      setIsSandboxActive: handleToggleSandbox,
      isLoading,
      isAuthLoading,
      login,
      registerStudent,
      logout,
      likeNews,
      registerForEvent,
      cancelRegistration,
      purchaseExemption,
      awardPoints,
      createQuiz,
      createNews,
      completeQuiz,
      submitFeedback,
      updateFeedback,
      deleteFeedback,
      createLog,
      bulkUpdateRegistrations,
      updateStudentProfileFromAdmin,
      resetAllDbData
    }}>
      {children}
    </FirebaseContext.Provider>
  );
}
