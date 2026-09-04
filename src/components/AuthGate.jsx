import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

const ALLOWED_EMAILS = [
  "debfayridley@gmail.com",
  "georidleyyyc@gmail.com",
];

export default function AuthGate({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading, null = signed out

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  if (user === undefined) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--color-text-muted)" }}>
        Loading&hellip;
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2 style={{ marginBottom: 20 }}>Piano Studio Scheduler</h2>
        <button
          onClick={() => signInWithPopup(auth, googleProvider)}
          style={{
            padding: "12px 20px", borderRadius: 8, border: "none",
            background: "var(--color-accent)", color: "#fff", fontWeight: 600, fontSize: 15,
          }}
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  if (!ALLOWED_EMAILS.includes(user.email)) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2 style={{ marginBottom: 10 }}>Not authorized</h2>
        <p style={{ color: "var(--color-text-muted)", marginBottom: 20 }}>
          {user.email} doesn't have access to this app.
        </p>
        <button
          onClick={() => signOut(auth)}
          style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid var(--color-border)", background: "none" }}
        >
          Sign out
        </button>
      </div>
    );
  }

  return children;
}