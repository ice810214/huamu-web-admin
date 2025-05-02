// 📁 檔案路徑：components/contract/ContractWithSignature.tsx

'use client';

import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { uploadBytes, ref, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { storage, db, auth } from '@/libs/firebase';
import html2pdf from 'html2pdf.js';
import toast from 'react-hot-toast';

interface Props {
  quoteId: string;
  contractText: string;
}

export default function ContractWithSignature({ quoteId, contractText }: Props) {
  const signRef = useRef<SignatureCanvas>(null);
  const [signedURL, setSignedURL] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSaveSignature = async () => {
    if (!auth.currentUser || !signRef.current) return toast.error('請先登入');
    const uid = auth.currentUser.uid;
    const dataUrl = signRef.current.getTrimmedCanvas().toDataURL('image/png');
    const blob = await (await fetch(dataUrl)).blob();
    const storageRef = ref(storage, `signatures/${uid}/${quoteId}_signature.png`);
    setIsUploading(true);

    try {
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      setSignedURL(url);
      await addDoc(collection(db, 'contractSignatures'), {
        uid,
        quoteId,
        signedUrl: url,
        signedAt: serverTimestamp(),
      });
      toast.success('簽名已儲存');
    } catch (err) {
      console.error(err);
      toast.error('儲存失敗');
    } finally {
      setIsUploading(false);
    }
  };

  const exportPDF = () => {
    const container = document.getElementById('contract-pdf');
    if (!container) return;

    html2pdf()
      .set({
        margin: 10,
        filename: `合約_${quoteId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(container)
      .save();
  };

  return (
    <div className="space-y-6">
      <div id="contract-pdf" className="bg-white p-6 border rounded">
        <h2 className="text-xl font-bold mb-4">🧾 合約書內容</h2>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
          {contractText}
        </p>

        {signedURL ? (
          <div className="mt-6">
            <p className="font-semibold mb-1">✍️ 客戶簽名：</p>
            <img src={signedURL} alt="簽名圖片" className="border w-48" />
          </div>
        ) : (
          <div className="mt-6 space-y-2">
            <p className="font-semibold">✍️ 請於下方簽名：</p>
            <SignatureCanvas
              ref={signRef}
              penColor="black"
              canvasProps={{
                width: 400,
                height: 150,
                className: 'border rounded bg-white',
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => signRef.current?.clear()}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                清除
              </button>
              <button
                onClick={handleSaveSignature}
                disabled={isUploading}
                className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                {isUploading ? '儲存中...' : '儲存簽名'}
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={exportPDF}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        匯出合約 PDF（含簽名）
      </button>
    </div>
  );
}
