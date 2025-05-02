'use client';

import { useRef, useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { db, storage } from '@/libs/firebase';

interface Props {
  quoteId: string;
}

export default function AttachmentUploader({ quoteId }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || !quoteId) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const fileRef = ref(storage, `attachments/${quoteId}/${file.name}`);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);
      setUploadedUrls((prev) => [...prev, downloadURL]);

      // 更新 Firestore
      const quoteDoc = doc(db, 'quotes', quoteId);
      await updateDoc(quoteDoc, {
        attachments: arrayUnion(downloadURL),
      });
    }

    setUploading(false);
    alert('✅ 附件上傳成功');
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium">📎 上傳附件（圖片 / PDF）</label>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        multiple
        onChange={(e) => handleUpload(e.target.files)}
        className="block w-full border p-2 rounded"
      />

      {uploading && <p className="text-sm text-gray-500">上傳中...</p>}

      {uploadedUrls.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">✅ 已上傳附件：</p>
          <ul className="list-disc pl-5 text-sm text-blue-700">
            {uploadedUrls.map((url, i) => (
              <li key={i}>
                <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
                  {url.split('/').pop()}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
