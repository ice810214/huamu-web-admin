// 📁 檔案路徑：app/auth/login/page.tsx

'use client';

import { useState } from 'react';
import { auth, db } from '@/libs/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleAuth = async () => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('登入成功');
        router.push('/dashboard');
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCred.user.uid), {
          email,
          role: 'user',
          createdAt: serverTimestamp(),
        });
        toast.success('註冊成功');
        router.push('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.message || '操作失敗');
    }
  };

  const handleReset = async () => {
    if (!email) return toast.error('請輸入 Email');
    await sendPasswordResetEmail(auth, email);
    toast.success('已寄送重設密碼信');
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold text-center mb-4">
        {isLogin ? '登入' : '註冊'}帳號
      </h1>

      <input
        type="email"
        placeholder="Email"
        className="w-full border p-2 rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="密碼"
        className="w-full border p-2 rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleAuth}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        {isLogin ? '登入' : '註冊'}
      </button>

      {isLogin && (
        <button
          onClick={handleReset}
          className="text-sm text-blue-500 hover:underline block text-center"
        >
          忘記密碼？
        </button>
      )}

      <button
        onClick={() => setIsLogin((prev) => !prev)}
        className="text-sm text-gray-500 hover:underline block text-center"
      >
        {isLogin ? '還沒有帳號？前往註冊' : '已有帳號？前往登入'}
      </button>

      <div className="text-center text-sm text-gray-400">或使用 LINE 登入</div>

      <button
        onClick={() => {
          window.location.href = `https://access.line.me/oauth2/v2.1/authorize?response_type=token&client_id=YOUR_LINE_CHANNEL_ID&redirect_uri=${encodeURIComponent(
            'https://YOUR_SITE_DOMAIN/auth/line-callback'
          )}&scope=profile%20openid%20email&state=customState`;
        }}
        className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
      >
        使用 LINE 登入
      </button>
    </div>
  );
}
