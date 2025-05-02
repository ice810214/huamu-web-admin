// 📁 檔案路徑：components/calendar/CalendarBoard.tsx

'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { db, auth } from '@/libs/firebase';
import toast from 'react-hot-toast';

interface Task {
  id?: string;
  title: string;
  date: string;
  status: '未執行' | '已執行' | '取消';
}

export default function CalendarBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({ title: '', date: '' });

  const fetchTasks = async () => {
    const q = query(collection(db, 'calendarTasks'), orderBy('date', 'asc'));
    const snapshot = await getDocs(q);
    const data: Task[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Task),
    }));
    setTasks(data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAdd = async () => {
    const { title, date } = newTask;
    if (!title || !date) return toast.error('請輸入任務名稱與日期');

    await addDoc(collection(db, 'calendarTasks'), {
      title,
      date,
      status: '未執行',
      uid: auth.currentUser?.uid || '',
      createdAt: serverTimestamp(),
    });
    setNewTask({ title: '', date: '' });
    fetchTasks();
    toast.success('已新增任務');
  };

  const handleStatusToggle = async (task: Task) => {
    if (!task.id) return;
    const nextStatus =
      task.status === '未執行'
        ? '已執行'
        : task.status === '已執行'
        ? '取消'
        : '未執行';
    await addDoc(collection(db, 'calendarTasks'), {
      ...task,
      status: nextStatus,
      updatedAt: serverTimestamp(),
    });
    await deleteDoc(doc(db, 'calendarTasks', task.id));
    fetchTasks();
  };

  const handleDelete = async (taskId: string) => {
    await deleteDoc(doc(db, 'calendarTasks', taskId));
    fetchTasks();
    toast.success('已刪除任務');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">🗓 任務排程</h2>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="任務標題"
          className="border p-2 rounded w-full"
          value={newTask.title}
          onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
        />
        <input
          type="date"
          className="border p-2 rounded"
          value={newTask.date}
          onChange={(e) => setNewTask((prev) => ({ ...prev, date: e.target.value }))}
        />
        <button
          onClick={handleAdd}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          ➕ 新增
        </button>
      </div>

      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="border rounded p-2 flex justify-between items-center bg-white"
          >
            <div>
              <p className="font-medium">{task.title}</p>
              <p className="text-xs text-gray-500">{task.date}</p>
              <p className="text-xs text-blue-600">狀態：{task.status}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusToggle(task)}
                className="text-sm px-3 py-1 bg-yellow-100 hover:bg-yellow-200 rounded"
              >
                切換狀態
              </button>
              <button
                onClick={() => handleDelete(task.id!)}
                className="text-sm px-3 py-1 bg-red-100 hover:bg-red-200 rounded"
              >
                刪除
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
