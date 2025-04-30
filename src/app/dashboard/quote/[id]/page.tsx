"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getQuoteById, updateQuoteItems } from "@/libs/quote";
import dynamic from "next/dynamic";

const html2pdf = dynamic(() => import("html2pdf.js"), { ssr: false });

type Item = {
  name: string;
  unit: string;
  quantity: number;
  price: number;
  category: string;
  length?: number;
  width?: number;
};

const categories = ["木作工程", "水電工程", "油漆工程", "泥作工程", "空調工程", "其他"];

function calculateArea(length: number, width: number, unit: string) {
  const area = length * width;
  if (unit === "坪") return +(area / 33057).toFixed(2);
  if (unit === "才") return +(area / 900).toFixed(2);
  if (unit === "公尺²") return +(area / 10000).toFixed(2);
  return 0;
}

export default function QuoteDetailPage() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const data = await getQuoteById(id as string);
      setTitle(data.title);
      setItems(data.items ?? []);
    };
    fetch();
  }, [id]);

  const handleChange = (i: number, key: keyof Item, value: string) => {
    const newItems = [...items];
    if (["quantity", "price", "length", "width"].includes(key)) {
      (newItems[i][key] as any) = parseFloat(value) || 0;
    } else {
      newItems[i][key] = value;
    }

    if (key === "length" || key === "width") {
      const { length = 0, width = 0, unit } = newItems[i];
      newItems[i].quantity = calculateArea(length, width, unit);
    }

    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      { name: "", unit: "", quantity: 0, price: 0, category: "其他" },
    ]);
  };

  const saveItems = async () => {
    await updateQuoteItems(id as string, { items });
    alert("✅ 已儲存");
  };

  const exportPDF = async (mode: "初估版" | "正式版") => {
    const element = document.getElementById("pdf-content");
    if (!element) return;

    const opt = {
      margin: 0.5,
      filename: `${title}_${mode}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    (await html2pdf()).set(opt).from(element).save();
  };

  const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const categoryTotals = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = 0;
    acc[item.category] += item.quantity * item.price;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex gap-3">
          <button onClick={addItem} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            ➕ 新增細項
          </button>
          <button onClick={saveItems} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            💾 儲存
          </button>
          <button onClick={() => exportPDF("初估版")} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            匯出初估版 PDF
          </button>
          <button onClick={() => exportPDF("正式版")} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
            匯出正式版 PDF
          </button>
        </div>
      </div>

      <div id="pdf-content" className="space-y-6">
        {items.map((item, i) => (
          <div key={i} className="grid grid-cols-9 gap-2 items-center bg-gray-50 p-4 rounded shadow">
            <input type="text" value={item.name} onChange={(e) => handleChange(i, "name", e.target.value)} placeholder="名稱" className="col-span-1 p-2 border rounded" />
            <input type="text" value={item.unit} onChange={(e) => handleChange(i, "unit", e.target.value)} placeholder="單位" className="col-span-1 p-2 border rounded" />
            <input type="number" value={item.length ?? ""} onChange={(e) => handleChange(i, "length", e.target.value)} placeholder="長(cm)" className="col-span-1 p-2 border rounded" />
            <input type="number" value={item.width ?? ""} onChange={(e) => handleChange(i, "width", e.target.value)} placeholder="寬(cm)" className="col-span-1 p-2 border rounded" />
            <input type="number" value={item.quantity} onChange={(e) => handleChange(i, "quantity", e.target.value)} placeholder="數量" className="col-span-1 p-2 border rounded" />
            <input type="number" value={item.price} onChange={(e) => handleChange(i, "price", e.target.value)} placeholder="單價" className="col-span-1 p-2 border rounded" />
            <select value={item.category} onChange={(e) => handleChange(i, "category", e.target.value)} className="col-span-2 p-2 border rounded">
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <div className="col-span-1 text-right font-semibold text-blue-700">
              ${(item.quantity * item.price).toLocaleString()}
            </div>
          </div>
        ))}

        <div className="text-right text-xl font-bold text-green-700">
          總計金額：${total.toLocaleString()}
        </div>

        <div className="mt-6 space-y-2">
          <h3 className="text-lg font-bold">分類金額統計</h3>
          {Object.entries(categoryTotals).map(([cat, amt]) => (
            <div key={cat} className="flex justify-between bg-white px-4 py-2 border rounded shadow">
              <span>{cat}</span>
              <span className="font-semibold text-blue-600">${amt.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
