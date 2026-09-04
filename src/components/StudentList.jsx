import { hasOwedMakeup } from "../data/lessons";

export default function StudentList({ students, exceptions, onSelectStudent, onAddStudent }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontWeight: 600, fontSize: 16 }}>Students</span>
        <button
          onClick={onAddStudent}
          style={{ border: "1px solid var(--color-accent)", color: "var(--color-accent)", background: "none", borderRadius: 6, padding: "6px 12px", fontSize: 13, fontWeight: 600 }}
        >
          + Add student
        </button>
      </div>

      {students.length === 0 && (
        <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>No students yet. Add your first student to get started.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {students.map((s) => {
          const owesMakeup = hasOwedMakeup(exceptions, s.id);
          return (
            <button
              key={s.id}
              onClick={() => onSelectStudent(s.id)}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                border: "1px solid var(--color-border)", borderRadius: 8, padding: "10px 12px",
                background: "var(--color-surface)", textAlign: "left",
              }}
            >
              <span>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{s.firstName} {s.lastInitial}.</div>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{s.parentName}</div>
              </span>
              {owesMakeup && (
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-blocked-text)", background: "var(--color-blocked-bg)", borderRadius: 5, padding: "3px 8px" }}>
                  Makeup owed
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
