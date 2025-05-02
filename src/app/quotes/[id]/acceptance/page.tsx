// 📁 檔案路徑：app/quotes/[id]/acceptance/page.tsx

'use client';

import { useParams } from 'next/navigation';
import AcceptanceUploader from '@/components/acceptance/AcceptanceUploader';

export default function AcceptancePage() {
  const { id } = useParams();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📦 報價驗收作業</h1>
      <AcceptanceUploader quoteId={id as string} />
    </div>
  );
}
