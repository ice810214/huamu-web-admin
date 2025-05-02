// 📁 檔案路徑：components/quote/QuotePDFExporter.tsx

'use client';

import html2pdf from 'html2pdf.js';

interface QuoteItem {
  name: string;
  price: number;
  category: string;
}

interface Props {
  title: string;
  items: QuoteItem[];
  quoteId: string;
  terms?: string;
  logoUrl?: string;
  dueDate?: string;
}

export default function QuotePDFExporter({
  title,
  items,
  quoteId,
  terms,
  logoUrl,
  dueDate,
}: Props) {
  const grouped = items.reduce((acc: Record<string, QuoteItem[]>, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const handleExport = () => {
    const container = document.getElementById('quote-pdf');
    if (!container) return;

    html2pdf()
      .set({
        margin: 10,
        filename: `${title || '報價單'}_${quoteId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(container)
      .save();
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleExport}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        📤 匯出報價單 PDF
      </button>

      <div id="quote-pdf" className="bg-white p-6 border rounded text-sm">
        {logoUrl && <img src={logoUrl} alt="LOGO" className="w-24 mb-4" />}
        <h2 className="text-lg font-bold mb-2">報價單：{title}</h2>
        {dueDate && <p className="text-xs mb-2">到期日：{dueDate}</p>}
        {Object.entries(grouped).map(([cat, group]) => (
          <div key={cat} className="mb-4">
            <h3 className="font-semibold">{cat}</h3>
            <ul className="list-disc list-inside">
              {group.map((item, i) => (
                <li key={i}>
                  {item.name} - NT${Number(item.price).toLocaleString()}
                </li>
              ))}
            </ul>
            <p className="text-right mt-1 font-medium">
              小計：NT$
              {group
                .reduce((acc, item) => acc + Number(item.price), 0)
                .toLocaleString()}
            </p>
          </div>
        ))}
        <p className="font-bold text-right">
          合計總金額：NT$
          {items.reduce((acc, item) => acc + Number(item.price), 0).toLocaleString()}
        </p>
        {terms && (
          <div className="mt-4 border-t pt-4 text-xs text-gray-600">
            <h4 className="font-semibold mb-1">條款與備註：</h4>
            <p>{terms}</p>
          </div>
        )}
      </div>
    </div>
  );
}
