"use client";

import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/libs/firebase";
import { upsertUserAndSetRoleCookie } from "@/libs/user";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.push("/dashboard");
    });
    return () => unsubscribe();
  }, [router]);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await upsertUserAndSetRoleCookie(result.user);
      router.push("/dashboard");
    } catch (error: any) {
      alert("登入失敗：" + error.message);
    }
  };

  const handleEmailLogin = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await upsertUserAndSetRoleCookie(result.user);
      router.push("/dashboard");
    } catch (error: any) {
      alert("登入失敗：" + error.message);
    }
  };

  const handleRegister = async () => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await upsertUserAndSetRoleCookie(result.user);
      router.push("/dashboard");
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        alert("帳號已存在，請直接登入");
        setMode("login");
      } else {
        alert("註冊失敗：" + error.message);
      }
    }
  };

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert("重設密碼信已寄出！");
      setMode("login");
    } catch (error: any) {
      alert("寄送失敗：" + error.message);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="max-w-md w-full space-y-6 bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-xl font-bold text-center">
          {mode === "login" && "登入後台"}
          {mode === "register" && "註冊帳號"}
          {mode === "reset" && "忘記密碼"}
        </h1>

        <input
          type="email"
          placeholder="電子郵件"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
        />

        {mode !== "reset" && (
          <input
            type="password"
            placeholder="密碼"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 rounded"
          />
        )}

        {mode === "login" && (
          <>
            <button onClick={handleEmailLogin} className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900">
              使用 Email 登入
            </button>
            <button onClick={() => setMode("register")} className="text-sm text-blue-600 hover:underline w-full text-center">
              註冊帳號
            </button>
            <button onClick={() => setMode("reset")} className="text-sm text-blue-600 hover:underline w-full text-center">
              忘記密碼？
            </button>
          </>
        )}

        {mode === "register" && (
          <>
            <button onClick={handleRegister} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
              建立帳號
            </button>
            <button onClick={() => setMode("login")} className="text-sm text-blue-600 hover:underline w-full text-center">
              已有帳號？前往登入
            </button>
          </>
        )}

        {mode === "reset" && (
          <>
            <button onClick={handleResetPassword} className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700">
              寄送重設密碼信件
            </button>
            <button onClick={() => setMode("login")} className="text-sm text-blue-600 hover:underline w-full text-center">
              返回登入
            </button>
          </>
        )}

        {mode === "login" && (
          <>
            <hr className="my-4" />
            <button onClick={handleGoogleLogin} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              使用 Google 登入
            </button>
          </>
        )}
      </div>
    </main>
  );
}
