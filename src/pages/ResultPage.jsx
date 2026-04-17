import { useState, useEffect } from "react";
import { getResult } from "../utils/api";

export default function ResultPage({ resultId, onNavigate, showToast }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getResult(resultId);
        setResult(data);
      } catch (err) {
        showToast(err.message, "error");
        onNavigate("dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [resultId]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <div className="loading-pulse" style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
        <p style={{ color: "var(--text-dim)" }}>Loading result...</p>
      </div>
    );
  }

  if (!result) return null;

  const pct = Math.round((result.score / result.total_marks) * 100);
  const grade = pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B" : pct >= 60 ? "C" : pct >= 40 ? "D" : "F";
  const gradeColor = pct >= 70 ? "var(--green)" : pct >= 40 ? "var(--accent)" : "var(--red)";

  // Parse answers (stored as JSON string or object)
  let details = [];
  try {
    details = typeof result.answers === "string" ? JSON.parse(result.answers) : result.answers || [];
  } catch { details = []; }

  return (
    <div className="fade-in">
      {/* Score Card */}
      <div className="card" style={{ textAlign: "center", marginBottom: 28, background: "linear-gradient(135deg, var(--surface-alt) 0%, var(--surface) 100%)", padding: "40px 28px" }}>
        <p style={{ fontSize: 14, color: "var(--text-dim)", marginBottom: 8 }}>Thank you for taking the test!</p>
        <div style={{ fontSize: 56, fontWeight: 900, color: gradeColor, fontFamily: "'Playfair Display', Georgia, serif", marginBottom: 4 }}>
          {grade}
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, color: "var(--text-bright)", marginBottom: 4 }}>
          {result.score}/{result.total_marks}
        </div>
        <div style={{ fontSize: 14, color: "var(--text-dim)", marginBottom: 20 }}>
          {result.test_title || "Test"} · {pct}% accuracy
        </div>
        <div className="score-bar" style={{ maxWidth: 300, margin: "0 auto" }}>
          <div className="score-bar__fill" style={{ width: `${pct}%`, background: gradeColor }} />
        </div>
        <p style={{ color: "var(--text-dim)", fontSize: 13, marginTop: 16 }}>
          Submitted {new Date(result.submitted_at).toLocaleString()}
        </p>
      </div>

      {/* Answer Review */}
      {details.length > 0 && (
        <>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-bright)", marginBottom: 16, fontFamily: "'Playfair Display', Georgia, serif" }}>
            Answer Review
          </h3>
          <div style={{ display: "grid", gap: 12 }}>
            {details.map((d, i) => (
              <div className="card" key={i} style={{
                borderLeft: `4px solid ${d.correct ? "var(--green)" : "var(--red)"}`,
                padding: 20,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12, marginBottom: 10 }}>
                  <p style={{ margin: 0, fontWeight: 600, color: "var(--text-bright)", fontSize: 15, lineHeight: 1.5 }}>
                    <span style={{ color: "var(--text-dim)", marginRight: 8 }}>Q{i + 1}.</span>
                    {d.question}
                  </p>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{d.correct ? "✅" : "❌"}</span>
                </div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13 }}>
                  <span style={{ color: d.correct ? "var(--green)" : "var(--red)" }}>
                    Your answer: <strong>{d.user_answer || "—"}</strong>
                  </span>
                  {!d.correct && (
                    <span style={{ color: "var(--green)" }}>
                      Correct: <strong>{d.correct_answer}</strong>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Back Button */}
      <div style={{ marginTop: 28, textAlign: "center" }}>
        <button className="btn btn--primary" onClick={() => onNavigate("dashboard")}>
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
