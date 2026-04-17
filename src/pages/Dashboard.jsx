import { useState, useEffect } from "react";
import { getTests, getResults } from "../utils/api";

export default function Dashboard({ user, onNavigate, showToast }) {
  const [tests, setTests] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [testList, resultList] = await Promise.all([
        getTests(),
        getResults(),
      ]);
      setTests(testList);
      setResults(resultList);
    } catch (err) {
      showToast("Failed to load data: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  const completedIds = new Set(results.map((r) => r.test_id));

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <div className="loading-pulse" style={{ fontSize: 40, marginBottom: 16 }}>📝</div>
        <p style={{ color: "var(--text-dim)" }}>Loading tests...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 32 }}>
        <h2 className="page__heading">
          {user.role === "admin" ? "Admin Dashboard" : "Available Tests"}
        </h2>
        <p className="page__sub">
          {user.role === "admin"
            ? `${tests.length} tests created · Manage your assessments`
            : `${tests.length} tests available · ${results.length} completed`}
        </p>
      </div>

      {/* Admin Controls */}
      {user.role === "admin" && (
        <div className="card" style={{ marginBottom: 24, borderColor: "var(--accent-dim)", background: "linear-gradient(135deg, var(--surface-alt) 0%, var(--surface) 100%)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h3 style={{ margin: 0, color: "var(--accent)", fontSize: 16, fontWeight: 700 }}>Admin Controls</h3>
              <p style={{ margin: "4px 0 0", color: "var(--text-dim)", fontSize: 13 }}>Upload new tests via JSON</p>
            </div>
            <button className="btn btn--primary" onClick={() => onNavigate("admin")}>Upload Test</button>
          </div>
        </div>
      )}

      {/* Tests List */}
      {tests.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
          <p style={{ color: "var(--text-dim)", fontSize: 15 }}>No tests available yet</p>
          {user.role === "admin" && (
            <button className="btn btn--primary" style={{ marginTop: 16 }} onClick={() => onNavigate("admin")}>
              Create First Test
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {tests.map((test) => {
            const done = completedIds.has(test.id);
            const result = results.find((r) => r.test_id === test.id);
            return (
              <div className="card" key={test.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--text-bright)" }}>{test.title}</h3>
                  <div style={{ display: "flex", gap: 20, marginTop: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, color: "var(--text-dim)" }}>⏱ {test.duration} min</span>
                    <span style={{ fontSize: 13, color: "var(--text-dim)" }}>📋 {test.question_count} questions</span>
                    {done && result && (
                      <span style={{ fontSize: 13, color: "var(--green)", fontWeight: 600 }}>
                        ✓ Score: {result.score}/{result.total_marks}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {done ? (
                    <button className="btn btn--secondary" onClick={() => onNavigate("result", result.id)}>View Result</button>
                  ) : (
                    <button className="btn btn--primary" onClick={() => onNavigate("test", test.id)}>Take Test</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Results History */}
      {results.length > 0 && (
        <div style={{ marginTop: 36 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-bright)", marginBottom: 16, fontFamily: "'Playfair Display', Georgia, serif" }}>
            Your Results
          </h3>
          <div style={{ display: "grid", gap: 12 }}>
            {results.map((r) => {
              const pct = Math.round((r.score / r.total_marks) * 100);
              const barColor = pct >= 70 ? "var(--green)" : pct >= 40 ? "var(--accent)" : "var(--red)";
              return (
                <div className="card" key={r.id} style={{ cursor: "pointer", padding: 20 }} onClick={() => onNavigate("result", r.id)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontWeight: 600, color: "var(--text)" }}>{r.test_title || "Test"}</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: barColor }}>{pct}%</span>
                  </div>
                  <div className="score-bar">
                    <div className="score-bar__fill" style={{ width: `${pct}%`, background: barColor }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                    <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{r.score}/{r.total_marks} correct</span>
                    <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{new Date(r.submitted_at).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
