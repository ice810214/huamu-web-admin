// 📁 檔案路徑：components/quote/QuoteEditor.tsx

'use client';

import { useState } from 'react';
import { db } from '@/libs/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

const categoryOptions = ['木作', '水電', '油漆', '泥作', '設計費', '其他'];

export default function QuoteEditor() {
  const [title, setTitle] = useState('');
  const [items, setItems] = useState<
    { name: string; price: number; category: string }[]
  >([]);
  const [dueDate, setDueDate] = useState('');

  const handleAddItem = () => {
    setItems([...items, { name: '', price: 0, category: '' }]);
  };

  const handleChange = (index: number, key: string, value: any) => {
    const updated = [...items];
    // @ts-ignore
    updated[index][key] = value;
    setItems(updated);
  };

  const handleSubmit = async () => {
    if (!title || items.length === 0) {
      toast.error('請填寫完整資訊');
      return;
    }

    const total = items.reduce((acc, item) => acc + Number(item.price), 0);
    const payload = {
      title,
      items,
      dueDate,
      total,
      status: 'draft',
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, 'quotes'), payload);
    toast.success('報價單已建立');
    setTitle('');
    setItems([]);
    setDueDate('');
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="報價標題"
        className="border p-2 rounded w-full"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="date"
        className="border p-2 rounded w-full"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />

      {items.map((item, i) => (
        <div key={i} className="grid grid-cols-3 gap-2">
          <input
            placeholder="項目名稱"
            className="border p-2 rounded"
            value={item.name}
            onChange={(e) => handleChange(i, 'name', e.target.value)}
          />
          <input
            type="number"
            placeholder="金額"
            className="border p-2 rounded"
            value={item.price}
            onChange={(e) => handleChange(i, 'price', e.target.value)}
          />
          <select
            className="border p-2 rounded"
            value={item.category}
            onChange={(e) => handleChange(i, 'category', e.target.value)}
          >
            <option value="">選擇分類</option>
            {categoryOptions.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>
        </div>
      ))}

      <button onClick={handleAddItem} className="bg-gray-600 text-white px-4 py-2 rounded">
        ➕ 增加項目
      </button>

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded block w-full"
      >
        📤 儲存報價單
      </button>
    </div>
  );
}
