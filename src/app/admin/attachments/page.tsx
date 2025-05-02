'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, arrayRemove } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '@/libs/firebase';
import Link from 'next/link';
import JSZip from 'jszip';

interface Quote {
  id: string;
  title: string;
  attachments?: string[];
  attachmentNotes?: string[];
  categories?: string[];
}

export default function AdminAttachmentManager() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'pdf'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('全部');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDocs(collection(db, 'quotes'));
      const list: Quote[] = snap.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title || '(未命名)',
        attachments: doc.data().attachments || [],
        attachmentNotes: doc.data().attachmentNotes || [],
        categories: doc.data().categories || ['一般'],
      })).filter((q) => q.attachments.length > 0);

      setQuotes(list);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleDelete = async (quoteId: string, url: string) => {
    try {
      const filePath = decodeURIComponent(new URL(url).pathname.split('/o/')[1].split('?')[0]);
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
      await updateDoc(doc(db, 'quotes', quoteId), {
        attachments: arrayRemove(url),
      });
      alert('✅ 已刪除附件');
      window.location.reload();
    } catch (err) {
      alert('❌ 刪除失敗');
    }
  };

  const handleZipExport = async () => {
    const zip = new JSZip();
    const filteredFiles = quotes.flatMap((quote) =>
      quote.attachments?.filter((url) => {
        const isImage = url.match(/\.(jpg|jpeg|png|gif)$/i);
        const isPdf = url.match(/\.pdf$/i);
        if (typeFilter === 'image' && !isImage) return false;
        if (typeFilter === 'pdf' && !isPdf) return false;
        if (categoryFilter !== '全部' && !(quote.categories || []).includes(categoryFilter)) return false;
        if (searchKeyword && !url.toLowerCase().includes(searchKeyword.toLowerCase())) return false;
        return true;
      }) || []
    );

    for (const url of filteredFiles) {
      const filename = decodeURIComponent(url.split('/').pop() || 'unknown');
      const res = await fetch(url);
      const blob = await res.blob();
      zip.file(filename, blob);
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const now = new Date().toISOString().split('T')[0];
    const filename = `attachments_${typeFilter}_${categoryFilter}_${now}.zip`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  if (loading) return <p className="p-6">讀取中...</p>;

  const allCategories = Array.from(new Set(quotes.flatMap((q) => q.categories || ['一般'])));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">📁 附件管理總覽</h1>
        <button
          onClick={handleZipExport}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          📦 匯出 ZIP
        </button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap items-center">
        <button onClick={() => setTypeFilter('all')} className={typeFilter === 'all' ? 'bg-blue-600 text-white px-3 py-1 rounded' : 'bg-gray-200 px-3 py-1 rounded'}>全部</button>
        <button onClick={() => setTypeFilter('image')} className={typeFilter === 'image' ? 'bg-blue-600 text-white px-3 py-1 rounded' : 'bg-gray-200 px-3 py-1 rounded'}>圖片</button>
        <button onClick={() => setTypeFilter('pdf')} className={typeFilter === 'pdf' ? 'bg-blue-600 text-white px-3 py-1 rounded' : 'bg-gray-200 px-3 py-1 rounded'}>PDF</button>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border px-2 py-1 rounded ml-4"
        >
          <option value="全部">所有分類</option>
          {allCategories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="🔍 搜尋檔名"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="border px-2 py-1 rounded"
        />
      </div>

      {quotes.length === 0 ? (
        <p className="text-gray-500">目前尚無任何上傳的附件。</p>
      ) : (
        quotes.map((quote) => (
          <div key={quote.id} className="border rounded p-4 bg-white shadow">
            <h2 className="font-semibold text-lg mb-2">
              📄 {quote.title}（ID: {quote.id}）
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {quote.attachments?.filter((url) => {
                const isImage = url.match(/\.(jpg|jpeg|png|gif)$/i);
                const isPdf = url.match(/\.pdf$/i);
                if (typeFilter === 'image' && !isImage) return false;
                if (typeFilter === 'pdf' && !isPdf) return false;
                if (categoryFilter !== '全部' && !(quote.categories || []).includes(categoryFilter)) return false;
                if (searchKeyword && !url.toLowerCase().includes(searchKeyword.toLowerCase())) return false;
                return true;
              }).map((url, i) => (
                <li key={i} className="flex flex-col gap-2 border rounded p-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      {url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                        <img src={url} alt="img" className="h-24 object-contain border rounded" />
                      ) : (
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">
                          {url.split('/').pop()}
                        </a>
                      )}
                      <div className="text-xs text-gray-600 mt-1">
  備註：
  <input
    type="text"
    defaultValue={quote.attachmentNotes?.[i] || ''}
    onBlur={async (e) => {
      const newNotes = [...(quote.attachmentNotes || [])];
      newNotes[i] = e.target.value;
      await updateDoc(doc(db, 'quotes', quote.id), { attachmentNotes: newNotes });
    }}
    className="border px-2 py-1 text-xs w-full rounded mt-1"
  />
</div>
                    </div>
                    <button onClick={() => handleDelete(quote.id, url)} className="text-red-500 text-xs hover:underline">
                      🗑 刪除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="text-right mt-3">
              <Link href={`/quotes/${quote.id}`} className="text-sm text-blue-600 hover:underline">
                ➤ 前往報價編輯頁
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
