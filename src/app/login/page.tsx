"use client";
import { useEffect, useState } from 'react';
import LoginButton from '@/components/LoginButton';

export default function Login() {
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    const checkTokenAndRedirect = async () => {
      try {
        const response = await fetch('/api/check-token');
        const data = await response.json();

        if (data.exists) {
          setIsTokenValid(true);
          setTimeout(() => {
            window.location.href = '/character';
          }, 2000);
        } else {
          setIsTokenValid(false);
        }
      } catch (error) {
        console.error('Error checking token:', error);
        setIsTokenValid(false);
      }
    };

    checkTokenAndRedirect();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <div className="max-w-screen-xl items-center w-full flex flex-col gap-2 pt-2 mx-auto">
        <p className="text-white">Пожалуйста, авторизируйтесь</p>
        <LoginButton />
        {isTokenValid && (
          <p className="text-white">
            Проверяем авторизацию... если ничего не происходит, 
            попробуйте обновить страницу
          </p>
        )}
      </div>
    </div>
  );
}

