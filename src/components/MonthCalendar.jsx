import { useMemo, useState } from "react";

function toDateStr(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

// Returns a summary color for a day cell based on what's scheduled that day.
function daySummary(dateStr, recurringLessons, exceptions, lessonsModule) {
  const items = lessonsModule.scheduleForDate(dateStr, recurringLessons, exceptions);
  const hasBlock = items.some((i) => i.kind === "block");
  const hasLesson = items.some((i) => i.kind === "lesson");
  if (hasLesson) return "scheduled";
  if (hasBlock) return "blocked";
  return "open";
}

export default function MonthCalendar({ recurringLessons, exceptions, lessonsModule, onSelectDate }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed

  const monthLabel = new Date(year, month, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const result = [];
    for (let i = 0; i < firstDay; i++) result.push(null);
    for (let d = 1; d <= daysInMonth; d++) result.push(d);
    return result;
  }, [year, month]);

  function goPrevMonth() {
    if (month === 0) { setYear(year - 1); setMonth(11); } else { setMonth(month - 1); }
  }
  function goNextMonth() {
    if (month === 11) { setYear(year + 1); setMonth(0); } else { setMonth(month + 1); }
  }

  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div>
      <div className="legend">
        <span><span className="legend-dot" style={{ background: "var(--color-open-border)" }} />Open</span>
        <span><span className="legend-dot" style={{ background: "var(--color-scheduled-text)" }} />Scheduled</span>
        <span><span className="legend-dot" style={{ background: "var(--color-blocked-text)" }} />Blocked</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <button onClick={goPrevMonth} aria-label="Previous month" style={{ border: "none", background: "none", fontSize: 18 }}>&larr;</button>
        <span style={{ fontWeight: 600, fontSize: 16 }}>{monthLabel}</span>
        <button onClick={goNextMonth} aria-label="Next month" style={{ border: "none", background: "none", fontSize: 18 }}>&rarr;</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, fontSize: 11, color: "var(--color-text-muted)", textAlign: "center", marginBottom: 4 }}>
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i}>{d}</div>)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const dateStr = toDateStr(year, month, d);
          const summary = daySummary(dateStr, recurringLessons, exceptions, lessonsModule);
          const bg = summary === "scheduled" ? "var(--color-scheduled-bg)"
            : summary === "blocked" ? "var(--color-blocked-bg)"
            : "var(--color-surface)";
          const isToday = dateStr === todayStr;
          return (
            <button
              key={i}
              onClick={() => onSelectDate(dateStr)}
              style={{
                aspectRatio: "1",
                borderRadius: 8,
                border: isToday ? "2px solid var(--color-accent)" : "1px solid var(--color-border)",
                background: bg,
                fontSize: 13,
              }}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}
