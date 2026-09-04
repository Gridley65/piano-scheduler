import { useState } from "react";

const DURATIONS = [30, 45, 60];

const emptyStudent = {
  firstName: "", lastInitial: "", parentName: "", phone: "", email: "",
  notes: "", defaultDuration: 30,
};

export default function StudentForm({ student, studentExceptions, onSave, onDelete, onBack }) {
  const [form, setForm] = useState(student || emptyStudent);
  const isEditing = Boolean(student);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSave() {
    if (!form.firstName || !form.lastInitial) {
      alert("First name and last initial are required.");
      return;
    }
    onSave(form);
  }

  const rescheduleRecords = (studentExceptions || []).filter((e) => e.type === "cancelled" && e.rescheduleReason);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <button onClick={onBack} aria-label="Back to students" style={{ border: "none", background: "none", fontSize: 18 }}>&larr;</button>
        <span style={{ fontWeight: 600, fontSize: 16 }}>{isEditing ? "Edit student" : "Add student"}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Field label="First name">
          <input value={form.firstName} onChange={(e) => update("firstName", e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Last initial">
          <input value={form.lastInitial} maxLength={1} onChange={(e) => update("lastInitial", e.target.value.toUpperCase())} style={inputStyle} />
        </Field>
        <Field label="Parent name">
          <input value={form.parentName} onChange={(e) => update("parentName", e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Phone">
          <input value={form.phone} onChange={(e) => update("phone", e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Email">
          <input value={form.email} onChange={(e) => update("email", e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Default lesson length">
          <select value={form.defaultDuration} onChange={(e) => update("defaultDuration", Number(e.target.value))} style={inputStyle}>
            {DURATIONS.map((d) => <option key={d} value={d}>{d} min</option>)}
          </select>
        </Field>
        <Field label="Notes">
          <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={4} style={{ ...inputStyle, resize: "vertical" }} />
        </Field>

        {isEditing && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Reschedule history</div>
            {rescheduleRecords.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>No reschedules recorded.</p>
            )}
            {rescheduleRecords.map((r) => (
              <div key={r.id} style={{ border: "1px solid var(--color-border)", borderRadius: 8, padding: 10, marginBottom: 6, fontSize: 13 }}>
                <div>Original: {r.date} at {r.startTime}</div>
                <div>Reason: {r.rescheduleReason}</div>
                <div>Eligible for makeup: {r.rescheduleEligible ? "Yes" : "No"}</div>
                <div style={{ color: r.makeupOwed ? "var(--color-blocked-text)" : "var(--color-text-muted)" }}>
                  {r.makeupOwed ? "Makeup still owed" : "Resolved"}
                </div>
              </div>
            ))}
          </div>
        )}

        <button onClick={handleSave} style={{ background: "var(--color-accent)", color: "white", border: "none", borderRadius: 8, padding: "12px 0", fontSize: 14, fontWeight: 600, marginTop: 8 }}>
          Save student
        </button>
        {isEditing && (
          <button onClick={() => onDelete(form.id)} style={{ background: "none", color: "var(--color-blocked-text)", border: "1px solid var(--color-blocked-text)", borderRadius: 8, padding: "10px 0", fontSize: 13 }}>
            Delete student
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "var(--color-text-muted)" }}>
      {label}
      {children}
    </label>
  );
}

const inputStyle = {
  border: "1px solid var(--color-border)", borderRadius: 6, padding: "8px 10px",
  fontSize: 14, color: "var(--color-text)", background: "var(--color-surface)",
};
