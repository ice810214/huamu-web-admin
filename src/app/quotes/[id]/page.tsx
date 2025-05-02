// 📁 檔案路徑：app/quotes/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/libs/firebase';
import QuotePDFExporter from '@/components/quote/QuotePDFExporter';

interface QuoteItem {
  name: string;
  price: number;
  category: string;
}

export default function QuoteDetailPage() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [terms, setTerms] = useState('');
  const [logoUrl, setLogoUrl] = useState('/logo.png'); // 你可替換為 Firebase Storage 圖片

  useEffect(() => {
    const fetchQuote = async () => {
      if (!id) return;
      const ref = doc(db, 'quotes', id as string);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setTitle(data.title);
        setItems(data.items || []);
        setDueDate(data.dueDate || '');
        setTerms(data.terms || '報價內容僅供參考，最終以合約簽訂為準。');
      }
    };
    fetchQuote();
  }, [id]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📄 報價內容總覽</h1>

      <QuotePDFExporter
        quoteId={id as string}
        title={title}
        items={items}
        dueDate={dueDate}
        terms={terms}
        logoUrl={logoUrl}
      />
    </div>
  );
}
