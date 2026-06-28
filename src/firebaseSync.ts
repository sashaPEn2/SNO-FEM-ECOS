import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Student } from './types';

export const syncStudentsFromFirestore = async (): Promise<Student[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "students"));
    const students: Student[] = [];
    querySnapshot.forEach((doc) => {
      students.push(doc.data() as Student);
    });
    return students;
  } catch (error) {
    console.error("Error fetching students from Firestore", error);
    return [];
  }
};

export const saveStudentToFirestore = async (student: Student): Promise<void> => {
  try {
    await setDoc(doc(db, "students", student.id), student);
  } catch (error) {
    console.error("Error saving student to Firestore", error);
  }
};

export const deleteStudentFromFirestore = async (studentId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "students", studentId));
  } catch (error) {
    console.error("Error deleting student from Firestore", error);
  }
};

export const syncAllStudentsToFirestore = async (students: Student[]): Promise<void> => {
  for (const s of students) {
    await saveStudentToFirestore(s);
  }
};
