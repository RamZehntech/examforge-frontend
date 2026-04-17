import { useState } from "react";
import { register, login } from "../utils/api";

export default function AuthPage({ onAuth, showToast }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === "login" && (!form.email || !form.password)) return showToast("Please fill all fields", "error");
    if (mode === "register" && (!form.name || !form.email || !form.password)) return showToast("Please fill all fields", "error");
    if (form.password.length < 6) return showToast("Password must be at least 6 characters", "error");

    setLoading(true);
    try {
      let res;
      if (mode === "login") {
        res = await login(form.email, form.password);
      } else {
        res = await register(form.name, form.email, form.password);
      }
      showToast(mode === "login" ? "Welcome back!" : "Account created!", "success");
      onAuth(res);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: 20 }}>
      {/* Glow effect */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 400, background: "radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 420, position: "relative" }} className="fade-in">
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, background: "var(--gradient)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, color: "#000", fontFamily: "'Playfair Display', Georgia, serif" }}>E</div>
            <span style={{ fontSize: 28, fontWeight: 800, color: "var(--text-bright)", fontFamily: "'Playfair Display', Georgia, serif" }}>ExamForge</span>
          </div>
          <p style={{ color: "var(--text-dim)", fontSize: 14 }}>Online Assessment Platform</p>
        </div>

        {/* Card */}
        <div className="card">
          {/* Tabs */}
          <div style={{ display: "flex", marginBottom: 28, background: "var(--bg)", borderRadius: 8, padding: 3 }}>
            {["login", "register"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  flex: 1, padding: "10px 0", border: "none", borderRadius: 6, cursor: "pointer",
                  fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1,
                  transition: "all 0.2s", fontFamily: "inherit",
                  background: mode === m ? "var(--gradient)" : "transparent",
                  color: mode === m ? "#000" : "var(--text-dim)",
                }}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {mode === "register" && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="Your name" value={form.name} onChange={set("name")} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="you@email.com" value={form.email} onChange={set("email")} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="Min 6 characters" value={form.password} onChange={set("password")} />
            </div>

            <button type="submit" className="btn btn--primary btn--full" disabled={loading} style={{ marginTop: 8, padding: "14px 0" }}>
              {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-dim)", marginTop: 18 }}>
            {mode === "login" ? "Demo admin: admin@exam.com / admin123" : "Students register here, admins use the demo account"}
          </p>
        </div>
      </div>
    </div>
  );
}
