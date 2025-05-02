'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { deleteCookie, getCookie, setCookie } from 'cookies-next';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/libs/firebase';
import { getUserRole } from '@/libs/firebase';

export default function UserBar() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [uid, setUid] = useState('');
  const [loginTime, setLoginTime] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setEmail(user.email || '');
        setUid(user.uid);
        const fetchedRole = await getUserRole(user.uid);
        setRole(fetchedRole);

        // 若尚未記錄登入時間，寫入 cookie
        const existingTime = getCookie('loginTime');
        if (!existingTime) {
          const now = new Date();
          const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setCookie('loginTime', timeStr);
          setLoginTime(timeStr);
        } else {
          setLoginTime(existingTime.toString());
        }
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    deleteCookie('authToken');
    deleteCookie('userRole');
    deleteCookie('loginTime');
    router.push('/login');
  };

  return (
    <div className="w-full bg-gray-100 p-4 flex flex-col md:flex-row md:justify-between items-start md:items-center gap-2 border-b border-gray-300 text-sm text-gray-700">
      <div className="flex flex-col md:flex-row md:items-center gap-2">
        <span>👤 <strong>{email}</strong>（{role}）</span>
        <span>| 登入時間：{loginTime}</span>
        <span>| UID：<code className="text-gray-500">{uid}</code></span>
      </div>
      <button
        onClick={handleLogout}
        className="text-red-500 hover:underline self-start md:self-auto"
      >
        登出
      </button>
    </div>
  );
}
