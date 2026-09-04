import { useState } from "react";
import { addRecurringLesson, addException, dayOfWeek } from "../data/lessons";

function pad(n) {
  return String(n).padStart(2, "0");
}

function minutesToTimeString(min) {
  return `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;
}

export default function BookLessonDialog({ dateStr, minutes, students, onClose }) {
  const [studentId, setStudentId] = useState("");
  const [startTime, setStartTime] = useState(minutesToTimeString(minutes));
  const [duration, setDuration] = useState(30);
  const [repeats, setRepeats] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!studentId) {
      setError("Choose a student.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (repeats) {
        await addRecurringLesson({
          studentId,
          dayOfWeek: dayOfWeek(dateStr),
          startTime,
          duration: Number(duration),
        });
      } else {
        await addException({
          date: dateStr,
          type: "oneOff",
          studentId,
          startTime,
          duration: Number(duration),
        });
      }
      onClose();
    } catch (err) {
      setError("Couldn't save that lesson. Try again.");
      setSaving(false);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
        display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--color-surface)", width: "100%", maxWidth: 480,
          borderRadius: "16px 16px 0 0", padding: 20, paddingBottom: 28,
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Book a lesson</div>
        <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 16 }}>
          {dateStr}
        </div>

        {students.length === 0 ? (
          <div>
            <p style={{ fontSize: 14 }}>You don't have any students yet. Add one from the Students tab first.</p>
            <button onClick={onClose} style={{ padding: "10px 16px" }}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Student</label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              style={{ width: "100%", padding: 10, marginBottom: 14, borderRadius: 8, border: "1px solid var(--color-border)" }}
            >
              <option value="">Select a student&hellip;</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastInitial}.
                </option>
              ))}
            </select>

            <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Start time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--color-border)" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--color-border)" }}
                >
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>60 min</option>
                </select>
              </div>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, marginBottom: 18 }}>
              <input type="checkbox" checked={repeats} onChange={(e) => setRepeats(e.target.checked)} />
              Repeats weekly
            </label>

            {error && <div style={{ color: "#b00020", fontSize: 13, marginBottom: 10 }}>{error}</div>}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={onClose}
                style={{ flex: 1, padding: 12, borderRadius: 8, border: "1px solid var(--color-border)", background: "none" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{ flex: 1, padding: 12, borderRadius: 8, border: "none", background: "var(--color-accent)", color: "#fff", fontWeight: 600 }}
              >
                {saving ? "Saving\u2026" : "Book lesson"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}