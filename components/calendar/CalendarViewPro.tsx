'use client';

import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/libs/firebase';

interface CalendarTask {
  id: string;
  title: string;
  start: string;
  category: string;
  description: string;
  allDay: boolean;
}

export default function CalendarViewPro() {
  const [events, setEvents] = useState<CalendarTask[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarTask | null>(null);

  const fetchEvents = async () => {
    const snapshot = await getDocs(collection(db, 'calendarTasks'));
    const tasks: CalendarTask[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        start: data.start,
        category: data.category,
        description: data.description,
        allDay: data.allDay || false,
      };
    });
    setEvents(tasks);
  };

  const handleEventDrop = async (info: any) => {
    const newStart = info.event.start.toISOString();
    await updateDoc(doc(db, 'calendarTasks', info.event.id), {
      start: newStart,
    });

    setEvents((prev) =>
      prev.map((e) =>
        e.id === info.event.id ? { ...e, start: newStart } : e
      )
    );

    // 可選：同步更新 Google Calendar
    // await updateGoogleCalendarEvent(info.event.id, newStart);
  };

  const handleEventClick = (info: any) => {
    const found = events.find((e) => e.id === info.event.id);
    if (found) setSelectedEvent(found);
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    await deleteDoc(doc(db, 'calendarTasks', selectedEvent.id));
    setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id));
    setSelectedEvent(null);
  };

  const handleCloseModal = () => setSelectedEvent(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="p-4 bg-white rounded shadow w-full max-w-6xl mx-auto">
      <h2 className="text-lg font-semibold mb-4">📅 工程進度行事曆（進階版）</h2>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        editable={true}
        events={events}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        height="auto"
      />

      {/* ✅ Modal 編輯視窗 */}
      {selectedEvent && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-[90%] max-w-md">
            <h3 className="text-lg font-bold mb-2">✏️ 編輯任務</h3>
            <p className="text-sm">標題：{selectedEvent.title}</p>
            <p className="text-sm">分類：{selectedEvent.category}</p>
            <p className="text-sm mb-4">說明：{selectedEvent.description}</p>

            <div className="flex justify-between">
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                刪除任務
              </button>
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
