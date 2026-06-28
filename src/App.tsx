import React, { useMemo } from 'react';
import { ClerkProvider } from '@clerk/clerk-react';
import AuthScreen from './components/AuthScreen';
import { getStoredStudents } from './data/mockData';
import { Student } from './types';

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;

export default function App() {
  const students = useMemo(() => {
    try {
      return (getStoredStudents() ?? []) as Student[];
    } catch {
      return [] as Student[];
    }
  }, []);


  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <AuthScreen
        students={students}
        onRegister={() => {
          // Регистрация в реестре/БД сейчас не подключена к UI.
          // Для теста рендерим экран AuthScreen.
        }}
      />
    </ClerkProvider>
  );
}

