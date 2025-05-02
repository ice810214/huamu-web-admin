// 📁 檔案路徑：app/admin/quotes/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/libs/firebase';
import Link from 'next/link';

interface QuoteItem {
  id: string;
  title: string;
  dueDate?: string;
  status?: string;
  createdAt?: any;
}

export default function AdminQuoteListPage() {
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [search, setSearch] = useState('');

  const fetchQuotes = async () => {
    const snap = await getDocs(collection(db, 'quotes'));
    const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as QuoteItem[];
    setQuotes(data);
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const filterQuotes = () => {
    return quotes.filter((q) =>
      q.title.toLowerCase().includes(search.toLowerCase())
    );
  };

  const getStatusLabel = (quote: QuoteItem) => {
    const now = new Date();
    if (!quote.dueDate) return '無到期日';

    const due = new Date(quote.dueDate);
    if (due < now) return '已過期';
    const daysLeft = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return `剩下 ${daysLeft} 天`;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold mb-4">📊 全部報價單總覽</h1>

      <div className="flex items-center gap-2">
        <input
          placeholder="🔍 搜尋報價標題"
          className="border p-2 rounded w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          匯出 PDF
        </button>
        <button className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          匯出 Excel
        </button>
      </div>

      <table className="w-full text-sm border mt-4 bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">#</th>
            <th className="p-2 border">報價標題</th>
            <th className="p-2 border">到期狀態</th>
            <th className="p-2 border">建立日期</th>
            <th className="p-2 border">操作</th>
          </tr>
        </thead>
        <tbody>
          {filterQuotes().map((q, i) => (
            <tr key={q.id}>
              <td className="p-2 border text-center">{i + 1}</td>
              <td className="p-2 border">{q.title}</td>
              <td className="p-2 border text-blue-600">{getStatusLabel(q)}</td>
              <td className="p-2 border text-gray-500">
                {q.createdAt?.toDate?.().toLocaleDateString?.() || '—'}
              </td>
              <td className="p-2 border text-center">
                <Link
                  href={`/quotes/${q.id}`}
                  className="text-blue-500 underline hover:text-blue-700"
                >
                  查看
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
