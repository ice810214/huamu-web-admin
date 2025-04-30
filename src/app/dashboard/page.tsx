"use client";

import { useEffect, useState } from "react";
import { getDocs, updateDoc, doc, collection } from "firebase/firestore";
import { db } from "@/libs/firebase";

type User = {
  uid: string;
  email: string;
  displayName?: string;
  role: string;
};

export default function AdminUserPage() {
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    const list = snapshot.docs.map((doc) => ({
      uid: doc.id,
      ...(doc.data() as User),
    }));
    setUsers(list);
  };

  const updateRole = async (uid: string, role: string) => {
    await updateDoc(doc(db, "users", uid), { role });
    alert(`✅ 已將 ${uid} 的角色設為 ${role}`);
    fetchUsers(); // 重新拉取一次清單
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">使用者角色管理</h2>
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-2">使用者資訊</th>
            <th className="text-left p-2">目前角色</th>
            <th className="text-left p-2">切換角色</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.uid} className="border-t">
              <td className="p-2">
                <div className="font-medium">{u.displayName || "未提供名稱"}</div>
                <div className="text-gray-500 text-xs">{u.email}</div>
              </td>
              <td className="p-2">{u.role}</td>
              <td className="p-2">
                <select
                  value={u.role}
                  onChange={(e) => updateRole(u.uid, e.target.value)}
                  className="border p-1 rounded"
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                  <option value="guest">guest</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
