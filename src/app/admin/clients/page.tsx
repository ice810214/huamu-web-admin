'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/libs/firebase';
import Link from 'next/link';

interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  notes?: string;
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      const snap = await getDocs(collection(db, 'clients'));
      const list: Client[] = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Client[];
      setClients(list);
      setLoading(false);
    };
    fetchClients();
  }, []);

  if (loading) return <p className="p-6">讀取客戶資料中...</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">👥 客戶名冊管理</h1>

      {clients.length === 0 ? (
        <p className="text-gray-500">目前尚無任何客戶資料。</p>
      ) : (
        <ul className="space-y-4">
          {clients.map((client) => (
            <li key={client.id} className="border rounded p-4 bg-white shadow">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-lg font-semibold">{client.name}</div>
                  <div className="text-sm text-gray-600">
                    {client.contactPerson && `聯絡人：${client.contactPerson}`}<br />
                    {client.phone && `電話：${client.phone}`}<br />
                    {client.email && `Email：${client.email}`}
                  </div>
                  {client.notes && (
                    <p className="mt-2 text-sm text-gray-500">備註：{client.notes}</p>
                  )}
                </div>
                <Link
                  href={`/admin/clients/${client.id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  ➤ 檢視詳細資料
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
