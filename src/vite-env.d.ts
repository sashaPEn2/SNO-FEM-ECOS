/// <reference types="vite/client" />

// Добавляем типизацию для import.meta.env (нужно для TS)
declare global {
  interface ImportMetaEnv {
    readonly VITE_CLERK_PUBLISHABLE_KEY?: string;
    // при необходимости добавьте другие VITE_* переменные
  }
}

declare module 'react';

