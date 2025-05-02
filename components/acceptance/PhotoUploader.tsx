'use client';

import { useRef, useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db, storage } from '@/libs/firebase';

interface Props {
  quoteId?: string;
}

export default function PhotoUploader({ quoteId }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!auth.currentUser) return alert('請先登入');

    setUploading(true);
    const uid = auth.currentUser.uid;
    const fileList = Array.from(files);
    setSelectedFiles(fileList);

    for (const file of fileList) {
      const storageRef = ref(storage, `acceptance/${uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'acceptanceRecords'), {
        uid,
        quoteId: quoteId || null,
        filename: file.name,
        url: downloadURL,
        note: notes[file.name] || '',
        createdAt: serverTimestamp(),
      });

      setUploaded((prev) => [...prev, file.name]);
    }

    if (inputRef.current) inputRef.current.value = '';
    setSelectedFiles([]);
    setUploading(false);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium">📸 上傳驗收照片（可多張）</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="w-full border p-2 rounded"
        onChange={(e) => handleUpload(e.target.files)}
      />

      {selectedFiles.length > 0 && (
        <div className="space-y-2 text-sm">
          <p className="font-medium mt-2">📝 每張照片備註：</p>
          {selectedFiles.map((file) => (
            <div key={file.name} className="mb-2">
              <div className="font-medium">{file.name}</div>
              <textarea
                value={notes[file.name] || ''}
                onChange={(e) =>
                  setNotes((prev) => ({ ...prev, [file.name]: e.target.value }))
                }
                placeholder="輸入備註..."
                className="w-full border p-2 rounded"
              />
            </div>
          ))}
        </div>
      )}

      {uploading && <p className="text-sm text-gray-500">⏳ 上傳中...</p>}
      {uploaded.length > 0 && (
        <div className="text-sm text-green-600">
          ✅ 已上傳：{uploaded.join(', ')}
        </div>
      )}
    </div>
  );
}
