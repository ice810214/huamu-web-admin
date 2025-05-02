// 📁 檔案路徑：src/app/contracts/[id]/page.tsx

'use client';

import { useParams } from 'next/navigation';
import ContractWithSignature from '@/components/contract/ContractWithSignature';

export default function ContractPage() {
  const { id } = useParams();

  // ✅ 可自訂條款文字，或未來改為從後台載入
  const defaultContract = `
本合約為裝修工程雙方之正式合約，明訂以下事項：

1. 工程期間：以報價單上標示為準。
2. 材料與施工標準：雙方應依照確認圖面與規格執行。
3. 款項支付：依報價單分期付款條件履行。
4. 保固條款：工程完成後保固一年，非人為損壞均屬保固範圍。
5. 雙方義務：委託方提供施工所需空間、能源與協助，承攬方應如期完工。
6. 違約責任：依民法相關規定處理。

如雙方同意以上條款，請簽名確認。
`;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">📄 合約簽署作業</h1>
      <ContractWithSignature quoteId={id as string} contractText={defaultContract} />
    </div>
  );
}
