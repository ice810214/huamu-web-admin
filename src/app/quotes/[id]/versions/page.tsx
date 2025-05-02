'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/libs/firebase';
import { format } from 'date-fns';

interface Version {
  id: string;
  title: string;
  dueDate: string;
  savedAt: any;
}

export default function QuoteVersionsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVersions = async () => {
      const versionSnap = await getDocs(collection(db, 'quotes', id as string, 'versions'));
      const list: Version[] = versionSnap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          dueDate: data.dueDate,
          savedAt: data.savedAt?.toDate?.() || null,
        };
      });
      setVersions(list);
      setLoading(false);
    };
    fetchVersions();
  }, [id]);

  const handleRestore = async (version: Version) => {
    const quoteRef = doc(db, 'quotes', id as string);
    await updateDoc(quoteRef, {
      title: version.title,
      dueDate: version.dueDate,
    });
    alert('✅ 已還原此版本');
    router.push(`/quotes/${id}`);
  };

  if (loading) return <p className="p-6">讀取版本中...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">📂 歷史版本紀錄</h1>

      {versions.length === 0 ? (
        <p className="text-gray-500">目前尚無版本紀錄。</p>
      ) : (
        <ul className="space-y-4">
          {versions.map((v) => (
            <li
              key={v.id}
              className="p-4 border rounded bg-white flex flex-col md:flex-row md:items-center md:justify-between"
            >
              <div>
                <div className="font-semibold">{v.title}</div>
                <div className="text-sm text-gray-500">
                  儲存時間：{v.savedAt ? format(v.savedAt, 'yyyy/MM/dd HH:mm') : '—'}<br />
                  到期日：{v.dueDate ? format(new Date(v.dueDate), 'yyyy/MM/dd') : '—'}
                </div>
              </div>
              <button
                onClick={() => handleRestore(v)}
                className="mt-3 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                還原此版本
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
