// 📁 檔案路徑：components/acceptance/AcceptanceImageCard.tsx

'use client';

import { Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ImageCardProps {
  url: string;
  filename: string;
  note?: string;
  type?: string;
  onDelete: () => void;
  index?: number;
  draggable?: boolean;
}

export default function AcceptanceImageCard({
  url,
  filename,
  note,
  type,
  onDelete,
  index,
  draggable = false,
}: ImageCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative border rounded p-3 bg-white shadow-md w-full max-w-sm"
      draggable={draggable}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="text-sm font-semibold mb-1">📌 分類：{type || '未分類'}</div>
      <img src={url} alt={filename} className="w-full rounded border mb-2" />
      <div className="text-sm">📝 備註：{note || '無'}</div>

      {hovered && (
        <button
          onClick={onDelete}
          className="absolute top-2 right-2 text-red-600 hover:text-red-800 transition"
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
}
