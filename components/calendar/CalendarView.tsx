'use client';

import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/libs/firebase';

interface CalendarTask {
  id: string;
  title: string;
  start: string;
  category: string;
  description: string;
  allDay: boolean;
}

export default function CalendarView() {
  const [events, setEvents] = useState<CalendarTask[]>([]);

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

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="p-4 bg-white rounded shadow w-full max-w-6xl mx-auto">
      <h2 className="text-lg font-semibold mb-4">📅 工程進度行事曆</h2>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={events}
        eventClick={(info) => {
          const task = events.find((e) => e.id === info.event.id);
          if (task) {
            alert(
              `📌 ${task.title}\n分類：${task.category}\n說明：${task.description}`
            );
          }
        }}
        height="auto"
      />
    </div>
  );
}
