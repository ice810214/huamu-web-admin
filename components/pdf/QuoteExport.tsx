'use client';

import { useRef } from 'react';
import html2pdf from 'html2pdf.js';
import QRCode from 'qrcode.react'; // npm install qrcode.react

export default function QuoteExport({
  children,
  quoteLink,
}: {
  children: React.ReactNode;
  quoteLink: string; // ex: https://huamu-design.com/quote/xxx
}) {
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleExport = () => {
    if (!pdfRef.current) return;

    html2pdf()
      .set({
        margin: 10,
        filename: 'huamu-quote.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(pdfRef.current)
      .save();
  };

  return (
    <div className="w-full">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          匯出 PDF
        </button>
      </div>

      <div ref={pdfRef} className="bg-white p-6 rounded shadow text-sm text-gray-800">
        {/* ✅ LOGO 標題區 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">鏵莯空間美學設計報價單</h1>
          <div className="text-sm font-medium">LOGO｜H.M</div>
        </div>

        {/* ✅ 主體報價內容（父層傳入） */}
        <div>{children}</div>

        {/* ✅ 條款區塊 */}
        <div className="mt-8 text-xs text-gray-500 border-t pt-4">
          ※ 本報價單為初步估算，實際金額以雙方簽訂契約為準。報價內容若有疑問，請洽本公司。
        </div>

        {/* ✅ 簽名區 */}
        <div className="mt-6 grid grid-cols-2 gap-12 text-sm">
          <div>
            <div>客戶簽名：</div>
            <div className="border-b border-black h-8 mt-2" />
          </div>
          <div>
            <div>設計單位代表簽名：</div>
            <div className="border-b border-black h-8 mt-2" />
          </div>
        </div>

        {/* ✅ 客戶專屬 QR Code */}
        <div className="mt-8 flex items-center gap-4 text-xs">
          <QRCode value={quoteLink} size={64} />
          <span>線上檢視或確認此報價單：{quoteLink}</span>
        </div>

        {/* ✅ 公司聯絡資訊（頁尾） */}
        <div className="mt-6 text-xs text-gray-600 border-t pt-3">
          鏵莯空間美學設計有限公司｜客服專線：02-1234-5678  
          ｜地址：台北市設計區一段88號｜信箱：info@huamu-design.com
        </div>
      </div>
    </div>
  );
}
