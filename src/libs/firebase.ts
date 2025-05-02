import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ✅ Firebase 設定（來自 .env）
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
};

// ✅ 初始化 Firebase App
const app = initializeApp(firebaseConfig);

// ✅ 初始化 Firebase 各模組
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// 🔍 工具函式：取得使用者角色
export const getUserRole = async (uid: string): Promise<string> => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  return userDoc.exists() ? userDoc.data().role || 'user' : 'user';
};

// ✅ 導出所有 Firebase 元件
export { app, auth, db, storage };
