import { db } from "./firebase";
import { collection, addDoc, getDocs, getDoc, doc, updateDoc } from "firebase/firestore";

// 建立報價單
export async function createQuote(title: string, userId: string) {
  const docRef = await addDoc(collection(db, "quotes"), {
    title,
    createdAt: new Date(),
    createdBy: userId,
  });
  return docRef.id;
}

// 取得所有報價單（用於列表頁）
export async function getQuotes() {
  const snapshot = await getDocs(collection(db, "quotes"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// 🔍 取得單一報價單（用於 [id] 詳情頁）
export async function getQuoteById(id: string) {
  const ref = doc(db, "quotes", id);
  const snapshot = await getDoc(ref);
  return snapshot.data() || {};
}

// 💾 更新報價單內細項（items）
export async function updateQuoteItems(id: string, data: { items: any[] }) {
  const ref = doc(db, "quotes", id);
  await updateDoc(ref, { ...data });
}
