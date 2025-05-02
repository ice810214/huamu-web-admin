// 📁 檔案路徑：components/attachments/AttachmentManager.tsx

'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '@/libs/firebase';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface Attachment {
  id: string;
  url: string;
  filename: string;
  note: string;
  category: string;
  sortIndex: number;
}

export default function AttachmentManager() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [types, setTypes] = useState<Record<string, string>>({});
  const categories = ['平面圖', '施工圖', '現場照', '設計圖', '其他'];

  const fetchAttachments = async () => {
    const q = query(collection(db, 'attachments'), orderBy('sortIndex'));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Attachment),
    }));
    setAttachments(data);
  };

  useEffect(() => {
    fetchAttachments();
  }, []);

  const handleUpload = async () => {
    if (!files || !auth.currentUser) return;
    const uid = auth.currentUser.uid;

    for (const file of Array.from(files)) {
      const storageRef = ref(storage, `attachments/${uid}/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'attachments'), {
        uid,
        filename: file.name,
        url,
        note: notes[file.name] || '',
        category: types[file.name] || '其他',
        sortIndex: Date.now(),
        createdAt: serverTimestamp(),
      });
    }

    setFiles(null);
    setNotes({});
    setTypes({});
    fetchAttachments();
  };

  const handleDelete = async (id: string, url: string) => {
    await deleteDoc(doc(db, 'attachments', id));
    await deleteObject(ref(storage, url));
    fetchAttachments();
  };

  const handleExportZip = async () => {
    const zip = new JSZip();
    const noteLines: string[] = [];

    for (const att of attachments) {
      const response = await fetch(att.url);
      const blob = await response.blob();
      zip.file(att.filename, blob);
      noteLines.push(`${att.filename} - ${att.note}`);
    }

    zip.file('備註.txt', noteLines.join('\n'));
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, '附件壓縮檔.zip');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">📂 附件上傳管理</h2>

      <input
        type="file"
        multiple
        accept="image/*"
        className="border p-2 rounded"
        onChange={(e) => setFiles(e.target.files)}
      />

      {files &&
        Array.from(files).map((file) => (
          <div key={file.name} className="mt-2 space-y-1">
            <input
              className="border p-1 rounded w-full text-sm"
              placeholder="輸入備註..."
              value={notes[file.name] || ''}
              onChange={(e) =>
                setNotes((prev) => ({ ...prev, [file.name]: e.target.value }))
              }
            />
            <select
              className="border p-1 rounded text-sm w-full"
              value={types[file.name] || ''}
              onChange={(e) =>
                setTypes((prev) => ({ ...prev, [file.name]: e.target.value }))
              }
            >
              <option value="">選擇分類</option>
              {categories.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>
        ))}

      <button
        onClick={handleUpload}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        上傳附件
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {attachments.map((att) => (
          <div key={att.id} className="border rounded p-2 bg-white shadow">
            <img src={att.url} alt={att.filename} className="rounded" />
            <p className="text-xs mt-1">分類：{att.category}</p>
            <p className="text-xs">備註：{att.note}</p>
            <button
              onClick={() => handleDelete(att.id, att.url)}
              className="mt-1 text-red-600 hover:text-red-800 text-xs"
            >
              刪除
            </button>
          </div>
        ))}
      </div>

      {attachments.length > 0 && (
        <button
          onClick={handleExportZip}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          匯出 ZIP（含備註.txt）
        </button>
      )}
    </div>
  );
}
