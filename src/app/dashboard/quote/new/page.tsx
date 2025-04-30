"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/libs/firebase";
import { createQuote } from "@/libs/quote";

export default function NewQuotePage() {
  const [uid, setUid] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUid(user.uid);
      else router.push("/auth/login");
    });
    return () => unsubscribe();
  }, [router]);

  const handleCreate = async () => {
    if (!uid || !title) return;
    const quoteId = await createQuote(title, uid);
    router.push(`/dashboard/quote/${quoteId}`);
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">新增報價單</h2>
      <input
        type="text"
        placeholder="請輸入報價單名稱"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border p-3 rounded"
      />
      <button
        onClick={handleCreate}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        建立報價
      </button>
    </div>
  );
}
