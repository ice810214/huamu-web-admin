'use client';

import { useEffect, useRef, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '@/libs/firebase';
import html2pdf from 'html2pdf.js';
import QRCode from 'qrcode.react';
import SignatureCanvas from 'react-signature-canvas';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface QuoteItem {
  category: string;
  name: string;
  unit: string;
  quantity: number;
  price: number;
}

export default function QuotePreview({ quoteId }: { quoteId: string }) {
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewed, setViewed] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const sigPadRef = useRef<SignatureCanvas>(null);
  const [signatureURL, setSignatureURL] = useState<string | null>(null);

  const fetchQuote = async () => {
    const docRef = doc(db, 'quotes', quoteId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      setTitle(data.title || '未命名報價單');
      setItems(data.items || []);
      setViewed(data.viewed || false);
      setConfirmed(data.confirmed || false);
      setSignatureURL(data.signatureUrl || null);

      if (!data.viewed) {
        await updateDoc(docRef, { viewed: true });
        setViewed(true);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchQuote();
  }, [quoteId]);

  const handleConfirm = async () => {
    await updateDoc(doc(db, 'quotes', quoteId), { confirmed: true });
    setConfirmed(true);
    alert('✅ 報價單已確認');
  };

  const exportPDF = () => {
    const container = document.getElementById('quote-preview-pdf');
    if (!container) return;

    html2pdf()
      .set({
        margin: 0.5,
        filename: `${title}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      })
      .from(container)
      .save();
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const categoryTotals = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = 0;
    acc[item.category] += item.price * item.quantity;
    return acc;
  }, {} as Record<string, number>);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const saveSignature = async () => {
    if (!sigPadRef.current) return;

    const dataUrl = sigPadRef.current.getTrimmedCanvas().toDataURL('image/png');
    setSignatureURL(dataUrl);

    const blob = await (await fetch(dataUrl)).blob();

    const storageRef = ref(storage, `signatures/${quoteId}.png`);
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);

    await updateDoc(doc(db, 'quotes', quoteId), {
      signatureUrl: downloadURL,
    });

    alert('✅ 簽名已上傳並儲存至雲端');
  };

  const clearSignature = () => {
    sigPadRef.current?.clear();
    setSignatureURL(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{title}</h2>
        <button
          onClick={exportPDF}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          匯出 PDF
        </button>
      </div>

      <div id="quote-preview-pdf" className="space-y-6 bg-white p-6 rounded shadow">
        <table className="w-full text-sm border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">分類</th>
              <th className="p-2 border">項目名稱</th>
              <th className="p-2 border">單位</th>
              <th className="p-2 border">數量</th>
              <th className="p-2 border">單價</th>
              <th className="p-2 border">小計</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td className="p-2 border">{item.category}</td>
                <td className="p-2 border">{item.name}</td>
                <td className="p-2 border text-center">{item.unit}</td>
                <td className="p-2 border text-right">{item.quantity}</td>
                <td className="p-2 border text-right">${item.price.toLocaleString()}</td>
                <td className="p-2 border text-right">
                  ${(item.quantity * item.price).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold bg-gray-100">
              <td colSpan={5} className="p-2 border text-right">總計：</td>
              <td className="p-2 border text-right text-green-600">${total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-4 space-y-2">
          <h3 className="text-base font-semibold">分類金額統整</h3>
          {Object.entries(categoryTotals).map(([cat, amt]) => (
            <div key={cat} className="flex justify-between border-b py-1 text-sm">
              <span>{cat}</span>
              <span className="font-semibold text-blue-600">${amt.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 text-xs text-gray-500 border-t pt-3 leading-relaxed">
          ※ 本報價單為初步估算，實際價格以合約簽訂為準。報價內容如有疑問，請聯繫本公司。
        </div>

        <div className="mt-6 grid grid-cols-2 gap-12 text-sm">
          <div>
            <div>✍️ 客戶簽名：</div>
            {signatureURL ? (
              <img src={signatureURL} alt="簽名" className="h-20 mt-2 border" />
            ) : (
              <div className="border-b border-black h-8 mt-2" />
            )}
          </div>
          <div>
            <div>設計單位代表簽名：</div>
            <div className="border-b border-black h-8 mt-2" />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4 text-xs">
          <QRCode value={currentUrl} size={64} />
          <div>
            客戶可透過 QR Code 查看此報價單：<br />
            <span className="text-blue-700 underline break-all">{currentUrl}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <h3 className="text-base font-semibold">✍️ 填寫您的電子簽名</h3>
        <SignatureCanvas
          ref={sigPadRef}
          penColor="black"
          canvasProps={{ className: 'border w-full h-36 rounded bg-white' }}
        />
        <div className="flex gap-3">
          <button onClick={saveSignature} className="px-4 py-2 bg-green-600 text-white rounded">
            儲存簽名
          </button>
          <button onClick={clearSignature} className="px-4 py-2 bg-gray-400 text-white rounded">
            清除重簽
          </button>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between bg-gray-50 p-4 rounded shadow">
        <div className="text-sm">
          👁️ 閱讀狀態：{viewed ? '已讀' : '未讀'} /  
          ✅ 確認狀態：{confirmed ? '已確認' : '尚未確認'}
        </div>
        {!confirmed && (
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            ✅ 確認此報價單
          </button>
        )}
      </div>
    </div>
  );
}
