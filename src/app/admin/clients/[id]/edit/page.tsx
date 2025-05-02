'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/libs/firebase';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function EditClientPage() {
  const { id } = useParams();
  const router = useRouter();
  const chartRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quotes, setQuotes] = useState<any[]>([]);

  useEffect(() => {
    const fetchClient = async () => {
      if (!id) return;
      const snap = await getDoc(doc(db, 'clients', id as string));
      if (snap.exists()) {
        const data = snap.data();
        setName(data.name || '');
        setPhone(data.phone || '');
        setEmail(data.email || '');
        setContactPerson(data.contactPerson || '');
        setNotes(data.notes || '');
      }

      const q = query(collection(db, 'quotes'), where('clientId', '==', id));
      const quoteSnap = await getDocs(q);
      const list = quoteSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setQuotes(list);
      setLoading(false);
    };
    fetchClient();
  }, [id]);

  const handleSave = async () => {
    if (!name) return alert('請輸入客戶名稱');
    setSaving(true);
    await updateDoc(doc(db, 'clients', id as string), {
      name,
      phone,
      email,
      contactPerson,
      notes,
    });
    setSaving(false);
    alert('✅ 已儲存修改');
    router.push('/admin/clients');
  };

  const exportChartsAsImage = async () => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve));
    if (blob) saveAs(blob, `客戶統計圖表_${name || '未命名'}.png`);
  };

  const exportQuotes = () => {
    const data = quotes.map((q) => ({
      報價ID: q.id,
      標題: q.title,
      到期日: q.dueDate ? new Date(q.dueDate).toLocaleDateString() : '—',
      是否已簽名: q.signatureUrl ? '是' : '否',
      是否已讀: q.viewed ? '是' : '否',
      是否已確認: q.confirmed ? '是' : '否',
    }));

    const sheet = XLSX.utils.json_to_sheet(data);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, '報價紀錄');
    const buffer = XLSX.write(book, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buffer]), `客戶報價報表_${name || '未命名'}.xlsx`);

    const content = data.map((q) =>
      `報價ID：${q.報價ID}\n標題：${q.標題}\n到期日：${q.到期日}\n已簽名：${q.是否已簽名}｜已讀：${q.是否已讀}｜已確認：${q.是否已確認}\n\n`
    ).join('');

    const blob = new Blob([content], { type: 'application/pdf' });
    saveAs(blob, `客戶報價報表_${name || '未命名'}.pdf`);
  };

  const monthlyChartData = Object.entries(
    quotes.reduce((acc: Record<string, number>, q) => {
      if (q.dueDate) {
        const month = new Date(q.dueDate).toISOString().slice(0, 7);
        acc[month] = (acc[month] || 0) + 1;
      }
      return acc;
    }, {})
  ).map(([month, count]) => ({ month, count }));

  const statusPieData = [
    { name: '已確認', value: quotes.filter((q) => q.confirmed).length },
    { name: '未確認', value: quotes.filter((q) => !q.confirmed).length },
  ];

  const categoryTotalData = Object.entries(
    quotes.reduce((acc: Record<string, number>, q) => {
      if (!q.items || !Array.isArray(q.items)) return acc;
      for (const item of q.items) {
        if (!item || typeof item !== 'object') continue;
        const category = typeof item.category === 'string' ? item.category : '未分類';
        const price = typeof item.price === 'number' ? item.price : 0;
        const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
        const subtotal = price * quantity;
        acc[category] = (acc[category] || 0) + subtotal;
      }
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  if (loading) return <p className="p-6">讀取中...</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold">📝 編輯客戶資料</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">客戶名稱 *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">聯絡人</label>
          <input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">電話</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">備註</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border p-2 rounded" />
        </div>
        <button onClick={handleSave} disabled={saving} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          {saving ? '儲存中...' : '💾 儲存修改'}
        </button>
      </div>

      {quotes.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-2">📄 報價紀錄（{quotes.length} 筆）</h2>
          <button onClick={exportQuotes} className="mb-2 mr-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            📥 匯出報價報表
          </button>
          <button onClick={exportChartsAsImage} className="mb-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            🖼 匯出圖表 PNG
          </button>
          <ul className="space-y-2 text-sm">
            {quotes.map((q) => (
              <li key={q.id} className="border p-3 rounded bg-gray-50">
                <div className="font-semibold">{q.title || '未命名報價單'}</div>
                <div className="text-gray-600">
                  到期日：{q.dueDate ? new Date(q.dueDate).toLocaleDateString() : '—'}<br />
                  狀態：{q.confirmed ? '✅ 已確認' : '待確認'} / {q.signatureUrl ? '🖋 已簽名' : '未簽名'} / {q.viewed ? '👁 已讀' : '未讀'}
                </div>
              </li>
            ))}
          </ul>

          <div ref={chartRef} className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold mb-2">📈 每月報價數量</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold mb-2">📊 確認狀態分布</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {statusPieData.map((entry, index) => (
                      <Cell key={`status-${index}`} fill={['#34d399', '#f87171'][index % 2]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold mb-2">💰 分類金額比重圖</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={categoryTotalData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {categoryTotalData.map((entry, index) => (
                      <Cell key={`category-${index}`} fill={['#60a5fa', '#fbbf24', '#34d399', '#f87171', '#a78bfa'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
