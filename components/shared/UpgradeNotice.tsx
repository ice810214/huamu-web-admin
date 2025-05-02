// 📁 檔案路徑：src/components/shared/UpgradeNotice.tsx

'use client';

import Link from 'next/link';

interface UpgradeNoticeProps {
  moduleName: string;
  description?: string;
}

export default function UpgradeNotice({ moduleName, description }: UpgradeNoticeProps) {
  return (
    <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 text-yellow-800 space-y-2 text-sm rounded">
      <p>🚫 此模組（<strong>{moduleName}</strong>）目前尚未授權使用。</p>
      {description && <p className="text-gray-600">{description}</p>}
      <Link
        href="/pricing"
        className="inline-block mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
      >
        升級帳號以解鎖功能
      </Link>
    </div>
  );
}
