'use client';

import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/libs/firebase';
import { useRouter } from 'next/navigation';

export default function CreateClientPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!name) return alert('請輸入客戶名稱');
    setSaving(true);
    await addDoc(collection(db, 'clients'), {
      name,
      phone,
      email,
      contactPerson,
      notes,
    });
    setSaving(false);
    alert('✅ 客戶已新增');
    router.push('/admin/clients');
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold">➕ 新增客戶</h1>
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
        <button onClick={handleCreate} disabled={saving} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          {saving ? '新增中...' : '💾 新增客戶'}
        </button>
      </div>
    </div>
  );
}
