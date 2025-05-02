// 📁 檔案路徑：app/quotes/new/page.tsx

'use client';

import QuoteEditor from '@/components/quote/QuoteEditor';

export default function NewQuotePage() {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">📋 建立新報價單</h1>
      <QuoteEditor />
    </div>
  );
}
