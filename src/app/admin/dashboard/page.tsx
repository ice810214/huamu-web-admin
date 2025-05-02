'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/libs/firebase';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { format } from 'date-fns';

interface Quote {
  title: string;
  confirmed: boolean;
  viewed: boolean;
  signatureUrl?: string;
  createdAt?: Timestamp;
  attachments?: string[];
  items?: { category: string; quantity: number; price: number }[];
}

export default function AdminDashboard() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotes = async () => {
      const snap = await getDocs(collection(db, 'quotes'));
      const list: Quote[] = snap.docs.map((doc) => doc.data() as Quote);
      setQuotes(list);
      setLoading(false);
    };
    fetchQuotes();
  }, []);

  if (loading) return <p className="p-6">讀取中...</p>;

  const total = quotes.length;
  const confirmed = quotes.filter((q) => q.confirmed).length;
  const signed = quotes.filter((q) => q.signatureUrl).length;
  const viewed = quotes.filter((q) => q.viewed).length;

  // 附件統計（你可以在報價建立或編輯頁中加入附件上傳流程）
  const withAttachments = quotes.filter((q) => Array.isArray(q.attachments) && q.attachments.length > 0).length;

  // 分類加總
  const categoryTotals: Record<string, number> = {};
  quotes.forEach((q) => {
    q.items?.forEach((item) => {
      const subtotal = item.price * item.quantity;
      categoryTotals[item.category] = (categoryTotals[item.category] || 0) + subtotal;
    });
  });
  const categoryChartData = Object.entries(categoryTotals).map(([category, value]) => ({
    category,
    value,
  }));

  // 每月統計
  const monthlyCount: Record<string, number> = {};
  quotes.forEach((q) => {
    const date = q.createdAt?.toDate?.();
    if (date) {
      const month = format(date, 'yyyy-MM');
      monthlyCount[month] = (monthlyCount[month] || 0) + 1;
    }
  });
  const monthlyChartData = Object.entries(monthlyCount).map(([month, count]) => ({
    month,
    count,
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10">
      <h1 className="text-2xl font-bold">
        📊 報價統計儀表板
        {/* 建議新增一個按鈕導向 /admin/attachments 管理上傳檔案 */}
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="總報價單" value={total} />
        <StatCard title="已確認" value={confirmed} />
        <StatCard title="已簽名" value={signed} />
        <StatCard title="已讀取" value={viewed} />
        <StatCard title="含附件報價" value={withAttachments} />
      </div>

      <div className="space-y-6">
        <h2 className="text-lg font-semibold">💰 分類金額統計</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#60a5fa" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-6">
        <h2 className="text-lg font-semibold">📈 每月報價單數量</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#34d399" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white rounded shadow p-4 text-center">
      <div className="text-sm text-gray-500 mb-1">{title}</div>
      <div className="text-2xl font-bold text-blue-600">{value}</div>
    </div>
  );
}
