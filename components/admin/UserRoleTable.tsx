'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/libs/firebase';

interface User {
  id: string;
  email: string;
  role: string;
}

export default function UserRoleTable() {
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, 'users'));
    const userList: User[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      email: doc.data().email || '',
      role: doc.data().role || 'user',
    }));
    setUsers(userList);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    await updateDoc(doc(db, 'users', userId), { role: newRole });
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-4 bg-white shadow-md rounded-md">
      <h2 className="text-lg font-semibold mb-4">使用者角色管理</h2>
      <table className="w-full table-auto border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Email</th>
            <th className="p-2 border">角色</th>
            <th className="p-2 border">更改角色</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="text-sm">
              <td className="p-2 border">{user.email}</td>
              <td className="p-2 border">{user.role}</td>
              <td className="p-2 border">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className="border rounded p-1 text-sm"
                >
                  <option value="admin">admin</option>
                  <option value="user">user</option>
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
