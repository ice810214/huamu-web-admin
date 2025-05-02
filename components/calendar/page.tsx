// 📁 檔案路徑：app/calendar/page.tsx

'use client';

import CalendarBoard from '@/components/calendar/CalendarBoard';

export default function CalendarPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📅 工程排程行事曆</h1>
      <CalendarBoard />
    </div>
  );
}
