'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/libs/firebase';

export default function NavBar() {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserEmail(user?.email || null);
    });
    return () => unsubscribe();
  }, []);

  const isActive = (path: string) =>
    pathname === path
      ? 'text-blue-600 font-bold border-b-2 border-blue-600'
      : 'text-gray-700 hover:text-blue-500';

  return (
    <nav className="w-full bg-gray-100 px-6 py-3 shadow-sm flex items-center justify-between">
      {/* Logo or App Name */}
      <div className="text-lg font-bold text-gray-800">鏵莯空間美學設計</div>

      {/* 導航列 */}
      <div className="flex gap-6 text-sm items-center">
        <Link href="/dashboard" className={isActive('/dashboard')}>
          控制台
        </Link>

        <Link href="/calendar" className={isActive('/calendar')}>
          📅 行事曆
        </Link>

        <Link href="/quotes" className={isActive('/quotes')}>
          📄 報價單
        </Link>

        <Link href="/acceptance" className={isActive('/acceptance')}>
          📸 驗收
        </Link>

        <Link href="/settings" className={isActive('/settings')}>
          ⚙️ 設定
        </Link>

        {/* 顯示登入狀態 */}
        {userEmail ? (
          <span className="text-xs text-gray-500 hidden sm:inline">已登入：{userEmail}</span>
        ) : (
          <Link href="/login" className="text-sm text-red-500 hover:underline">
            登入
          </Link>
        )}
      </div>
    </nav>
  );
}
