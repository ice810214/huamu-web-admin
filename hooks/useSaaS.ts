// 📁 檔案路徑：hooks/useSaaS.ts

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/libs/firebase';

export function useSaaSPlan() {
  const [plan, setPlan] = useState<string>('free');
  const [features, setFeatures] = useState<string[]>([]);

  useEffect(() => {
    const fetchPlan = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const snap = await getDoc(doc(db, 'users', uid));
      const data = snap.data();
      if (!data) return;

      setPlan(data.plan || 'free');
      setFeatures(data.features || []);
    };

    fetchPlan();
  }, []);

  const isModuleEnabled = (module: string) => {
    return plan === 'pro' || features.includes(module);
  };

  return { plan, isModuleEnabled };
}
