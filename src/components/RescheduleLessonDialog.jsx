import { useState } from "react";
import {
  rescheduleLesson,
  updateException,
  deleteException,
} from "../data/lessons";

export default function RescheduleLessonDialog({ item, dateStr, students, onClose }) {
  const [mode, setMode] = useState("choose"); // "choose" | "move" | "cancel"
  const [newDate, setNewDate] = useState("");
  const [newStartTime, setNewStartTime] = useState(item.startTime);
  const [newDuration, setNewDuration] = useState(item.duration);
  const [reason, setReason] = useState("");
  const [eligible, setEligible] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const student = students.find((s) => s.id === item.studentId);
  const studentName = student ? `${student.firstName} ${student.lastInitial}.` : "This student";
  const isRecurring = item.source === "recurring";

  async function handleMoveSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (isRecurring) {
        await rescheduleLesson({
          recurringLessonId: item.recurringLessonId,
          studentId: item.studentId,
          originalDate: dateStr,
          originalStartTime: item.startTime,
          originalDuration: item.duration,
          reason,
          eligible,
          newDate,
          newStartTime,
          newDuration: Number(newDuration),
        });
      } else {
        // One-off lesson: just update it directly to the new date/time.
        await updateException(item.id, {
          date: newDate || dateStr,
          startTime: newStartTime,
          duration: Number(newDuration),
        });
      }
      onClose();
    } catch (err) {
      setError("Couldn't save that change. Try again.");
      setSaving(false);
    }
  }

  async function handleCancelSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (isRecurring) {
        await rescheduleLesson({
          recurringLessonId: item.recurringLessonId,
          studentId: item.studentId,
          originalDate: dateStr,
          originalStartTime: item.startTime,
          originalDuration: item.duration,
          reason,
          eligible,
          newDate: null,
          newStartTime: null,
          newDuration: null,
        });
      } else {
        await deleteException(item.id);
      }
      onClose();
    } catch (err) {
      setError("Couldn't save that change. Try again.");
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
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{studentName}</div>
        <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 16 }}>
          {dateStr} at {item.startTime}
        </div>

        {mode === "choose" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={() => setMode("move")}
              style={{ padding: 14, borderRadius: 8, border: "1px solid var(--color-border)", background: "none", textAlign: "left", fontSize: 15 }}
            >
              Move to a new date/time
            </button>
            <button
              onClick={() => setMode("cancel")}
              style={{ padding: 14, borderRadius: 8, border: "1px solid var(--color-border)", background: "none", textAlign: "left", fontSize: 15, color: "#b00020" }}
            >
              {isRecurring ? "Cancel this occurrence" : "Delete this lesson"}
            </button>
            <button
              onClick={onClose}
              style={{ padding: 12, borderRadius: 8, border: "none", background: "none", color: "var(--color-text-muted)" }}
            >
              Close
            </button>
          </div>
        )}

        {mode === "move" && (
          <form onSubmit={handleMoveSubmit}>
            <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>New date</label>
            <input
              type="date"
              required
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              style={{ width: "100%", padding: 10, marginBottom: 14, borderRadius: 8, border: "1px solid var(--color-border)" }}
            />

            <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Start time</label>
                <input
                  type="time"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--color-border)" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Duration</label>
                <select
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--color-border)" }}
                >
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>60 min</option>
                </select>
              </div>
            </div>

            {isRecurring && (
              <>
                <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Reason (optional)</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Family vacation"
                  style={{ width: "100%", padding: 10, marginBottom: 14, borderRadius: 8, border: "1px solid var(--color-border)" }}
                />
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, marginBottom: 18 }}>
                  <input type="checkbox" checked={eligible} onChange={(e) => setEligible(e.target.checked)} />
                  Eligible for makeup credit
                </label>
              </>
            )}

            {error && <div style={{ color: "#b00020", fontSize: 13, marginBottom: 10 }}>{error}</div>}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setMode("choose")}
                style={{ flex: 1, padding: 12, borderRadius: 8, border: "1px solid var(--color-border)", background: "none" }}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{ flex: 1, padding: 12, borderRadius: 8, border: "none", background: "var(--color-accent)", color: "#fff", fontWeight: 600 }}
              >
                {saving ? "Saving\u2026" : "Move lesson"}
              </button>
            </div>
          </form>
        )}

        {mode === "cancel" && (
          <form onSubmit={handleCancelSubmit}>
            {isRecurring ? (
              <>
                <p style={{ fontSize: 14, marginBottom: 14 }}>
                  This cancels just the {dateStr} occurrence. The weekly lesson will continue as normal after that.
                </p>
                <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Reason (optional)</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Sick"
                  style={{ width: "100%", padding: 10, marginBottom: 14, borderRadius: 8, border: "1px solid var(--color-border)" }}
                />
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, marginBottom: 18 }}>
                  <input type="checkbox" checked={eligible} onChange={(e) => setEligible(e.target.checked)} />
                  Eligible for makeup credit
                </label>
              </>
            ) : (
              <p style={{ fontSize: 14, marginBottom: 18 }}>
                This will permanently delete this one-off lesson. This can't be undone.
              </p>
            )}

            {error && <div style={{ color: "#b00020", fontSize: 13, marginBottom: 10 }}>{error}</div>}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setMode("choose")}
                style={{ flex: 1, padding: 12, borderRadius: 8, border: "1px solid var(--color-border)", background: "none" }}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{ flex: 1, padding: 12, borderRadius: 8, border: "none", background: "#b00020", color: "#fff", fontWeight: 600 }}
              >
                {saving ? "Saving\u2026" : isRecurring ? "Cancel occurrence" : "Delete lesson"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}