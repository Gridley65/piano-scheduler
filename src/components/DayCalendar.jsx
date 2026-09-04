import { useMemo } from "react";
import { scheduleForDate, dayName } from "../data/lessons";

const START_MIN = 9 * 60;
const END_MIN = 21 * 60 + 30;
const QUARTER_PX = 16;

function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToLabel(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const ampm = h < 12 ? "am" : "pm";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, "0")}${ampm}`;
}

// Every open 15-min slot in the day, for rendering click targets under the blocks.
function allSlots() {
  const slots = [];
  for (let m = START_MIN; m < END_MIN; m += 15) slots.push(m);
  return slots;
}

export default function DayCalendar({ dateStr, recurringLessons, exceptions, students, onBack, onSlotClick, onLessonClick }) {
  const items = useMemo(
    () => scheduleForDate(dateStr, recurringLessons, exceptions),
    [dateStr, recurringLessons, exceptions]
  );

  const studentById = useMemo(() => {
    const map = new Map();
    students.forEach((s) => map.set(s.id, s));
    return map;
  }, [students]);

  const occupiedMinutes = useMemo(() => {
    const set = new Set();
    items.forEach((i) => {
      const start = timeToMinutes(i.startTime);
      for (let m = start; m < start + i.duration; m += 15) set.add(m);
    });
    return set;
  }, [items]);

  const totalPx = ((END_MIN - START_MIN) / 15) * QUARTER_PX;
  const [y, m, d] = dateStr.split("-").map(Number);
  const niceDate = new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <button onClick={onBack} aria-label="Back to month" style={{ border: "none", background: "none", fontSize: 18 }}>&larr;</button>
        <span style={{ fontWeight: 600, fontSize: 16 }}>{niceDate}</span>
      </div>

      <div style={{ position: "relative", display: "flex" }}>
        <div style={{ width: 52, flexShrink: 0, position: "relative", height: totalPx }}>
          {Array.from({ length: (END_MIN - START_MIN) / 60 + 1 }).map((_, i) => {
            const min = START_MIN + i * 60;
            const y = ((min - START_MIN) / 15) * QUARTER_PX;
            return (
              <div key={i} style={{ position: "absolute", top: y - 6, fontSize: 11, color: "var(--color-text-muted)" }}>
                {minutesToLabel(min)}
              </div>
            );
          })}
        </div>

        <div style={{ position: "relative", flex: 1, background: "var(--color-open-bg)", borderRadius: 8, height: totalPx, overflow: "hidden" }}>
          {/* hour gridlines */}
          {Array.from({ length: (END_MIN - START_MIN) / 60 + 1 }).map((_, i) => {
            const min = START_MIN + i * 60;
            const y = ((min - START_MIN) / 15) * QUARTER_PX;
            return <div key={i} style={{ position: "absolute", top: y, left: 0, right: 0, height: 1, background: "rgba(0,0,0,0.08)" }} />;
          })}

          {/* clickable open slots */}
          {allSlots().map((min) => {
            if (occupiedMinutes.has(min)) return null;
            const y = ((min - START_MIN) / 15) * QUARTER_PX;
            return (
              <button
                key={min}
                onClick={() => onSlotClick && onSlotClick(dateStr, min)}
                aria-label={`Open slot at ${minutesToLabel(min)}`}
                style={{
                  position: "absolute", top: y, left: 0, right: 0, height: QUARTER_PX,
                  background: "transparent", border: "none",
                }}
              />
            );
          })}

          {/* lesson + block chips */}
          {items.map((item) => {
            const start = timeToMinutes(item.startTime);
            const top = ((start - START_MIN) / 15) * QUARTER_PX;
            const height = (item.duration / 15) * QUARTER_PX;
            const isBlock = item.kind === "block";
            const student = studentById.get(item.studentId);
            const label = isBlock ? item.label : student ? `${student.firstName} ${student.lastInitial}.` : "Lesson";
            return (
              <button
                key={item.id}
                onClick={() => onLessonClick && onLessonClick(item)}
                style={{
                  position: "absolute", top: top + 1, left: 4, right: 4, height: height - 2,
                  background: isBlock ? "var(--color-blocked-bg)" : "var(--color-scheduled-bg)",
                  color: isBlock ? "var(--color-blocked-text)" : "var(--color-scheduled-text)",
                  border: "none", borderRadius: 5, fontSize: 12, fontWeight: 600,
                  padding: "3px 6px", textAlign: "left", overflow: "hidden",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
