// 📁 檔案路徑：src/hooks/useSaaS.ts

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/libs/firebase';

/**
 * SaaS 模組授權控制 Hook
 * - 自動讀取使用者 plan 與 features 陣列
 * - 支援判斷模組是否已授權啟用
 */
export function useSaaSPlan() {
  const [plan, setPlan] = useState<string>('free');
  const [features, setFeatures] = useState<string[]>([]);

  useEffect(() => {
    const fetchPlan = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const ref = doc(db, 'users', uid);
      const snap = await getDoc(ref);
      const data = snap.data();
      if (!data) return;

      setPlan(data.plan || 'free');
      setFeatures(data.features || []);
    };

    fetchPlan();
  }, []);

  /**
   * 判斷模組是否授權
   */
  const isModuleEnabled = (module: string) => {
    return plan === 'pro' || features.includes(module);
  };

  return { plan, features, isModuleEnabled };
}
