import { useEffect, useState } from "react";
import MonthCalendar from "./components/MonthCalendar";
import DayCalendar from "./components/DayCalendar";
import StudentList from "./components/StudentList";
import StudentForm from "./components/StudentForm";
import BookLessonDialog from "./components/BookLessonDialog";
import RescheduleLessonDialog from "./components/RescheduleLessonDialog";
import { subscribeToStudents, addStudent, updateStudent, deleteStudent } from "./data/students";
import * as lessonsModule from "./data/lessons";
import { subscribeToRecurringLessons, subscribeToExceptions } from "./data/lessons";
import AuthGate from "./components/AuthGate";
// Views: "month" | "day" | "students" | "studentForm"
export default function App() {
  const [view, setView] = useState("month");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [bookingSlot, setBookingSlot] = useState(null); // { dateStr, minutes } | null
const [reschedulingItem, setReschedulingItem] = useState(null); // { item, dateStr } | null
  const [students, setStudents] = useState([]);
  const [recurringLessons, setRecurringLessons] = useState([]);
  const [exceptions, setExceptions] = useState([]);

  useEffect(() => {
    const unsub1 = subscribeToStudents(setStudents);
    const unsub2 = subscribeToRecurringLessons(setRecurringLessons);
    const unsub3 = subscribeToExceptions(setExceptions);
    return () => { unsub1(); unsub2(); unsub3(); };
  }, []);

  function openDay(dateStr) {
    setSelectedDate(dateStr);
    setView("day");
  }

  function openStudent(studentId) {
    setSelectedStudentId(studentId);
    setView("studentForm");
  }

  function openAddStudent() {
    setSelectedStudentId(null);
    setView("studentForm");
  }

  async function handleSaveStudent(form) {
    if (form.id) {
      const { id, ...updates } = form;
      await updateStudent(id, updates);
    } else {
      await addStudent(form);
    }
    setView("students");
  }

  async function handleDeleteStudent(id) {
    if (!confirm("Delete this student? This cannot be undone.")) return;
    await deleteStudent(id);
    setView("students");
  }

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || null;
  const selectedStudentExceptions = exceptions.filter((e) => e.studentId === selectedStudentId);

 return (
    <AuthGate>
    <div className="app-shell">
      <div className="page">
        {view === "month" && (
          <MonthCalendar
            recurringLessons={recurringLessons}
            exceptions={exceptions}
            lessonsModule={lessonsModule}
            onSelectDate={openDay}
          />
        )}

        {view === "day" && selectedDate && (
          <DayCalendar
            dateStr={selectedDate}
            recurringLessons={recurringLessons}
            exceptions={exceptions}
            students={students}
            onBack={() => setView("month")}
            onSlotClick={(date, minutes) => setBookingSlot({ dateStr: date, minutes })}
                       onLessonClick={(item) => setReschedulingItem({ item, dateStr: selectedDate })}
          />
        )}

        {view === "students" && (
          <StudentList
            students={students}
            exceptions={exceptions}
            onSelectStudent={openStudent}
            onAddStudent={openAddStudent}
          />
        )}

        {view === "studentForm" && (
          <StudentForm
            student={selectedStudent}
            studentExceptions={selectedStudentExceptions}
            onSave={handleSaveStudent}
            onDelete={handleDeleteStudent}
            onBack={() => setView("students")}
          />
        )}
      </div>

      <nav className="top-nav">
        <button className={view === "month" || view === "day" ? "active" : ""} onClick={() => setView("month")}>
          Calendar
        </button>
        <button className={view === "students" || view === "studentForm" ? "active" : ""} onClick={() => setView("students")}>
          Students
        </button>
      </nav>

      {bookingSlot && (
        <BookLessonDialog
          dateStr={bookingSlot.dateStr}
          minutes={bookingSlot.minutes}
          students={students}
          onClose={() => setBookingSlot(null)}
        />
      )}
      {reschedulingItem && (
        <RescheduleLessonDialog
          item={reschedulingItem.item}
          dateStr={reschedulingItem.dateStr}
          students={students}
          onClose={() => setReschedulingItem(null)}
        />
      )}
    </div>
   </AuthGate>
  );
}