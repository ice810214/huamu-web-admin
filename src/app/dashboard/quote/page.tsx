"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/libs/firebase";

export default function QuoteListPage() {
  const [quotes, setQuotes] = useState<any[]>([]);

  const fetchQuotes = async () => {
    const snapshot = await getDocs(collection(db, "quotes"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setQuotes(data);
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">報價案件列表</h2>
        <Link
          href="/dashboard/quote/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ➕ 新增報價單
        </Link>
      </div>

      <ul className="space-y-3">
        {quotes.map((quote) => (
          <li key={quote.id}>
            <Link
              href={`/dashboard/quote/${quote.id}`}
              className="block p-4 bg-white shadow rounded hover:bg-gray-50"
            >
              <div className="font-medium">{quote.title}</div>
              <div className="text-sm text-gray-500">
                建立時間：{quote.createdAt?.toDate?.().toLocaleString?.() ?? "N/A"}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
