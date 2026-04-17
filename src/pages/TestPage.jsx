import { useState, useEffect, useRef, useCallback } from "react";
import { getTest, submitTest } from "../utils/api";

export default function TestPage({ testId, user, onNavigate, showToast }) {
  const [testData, setTestData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);

  // Load test data
  useEffect(() => {
    async function load() {
      try {
        const data = await getTest(testId);
        if (data.already_submitted) {
          showToast("You've already taken this test", "info");
          onNavigate("dashboard");
          return;
        }
        setTestData(data);
        setTimeLeft(data.duration * 60);
      } catch (err) {
        showToast(err.message, "error");
        onNavigate("dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [testId]);

  // Timer countdown
  useEffect(() => {
    if (!testData || submitted || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [testData, submitted]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && testData && !submitted) {
      handleSubmit(true);
    }
  }, [timeLeft, testData, submitted]);

  const handleSubmit = useCallback(async (auto = false) => {
    if (submitted || submitting) return;
    setSubmitting(true);
    setSubmitted(true);
    clearInterval(timerRef.current);

    try {
      const res = await submitTest(testId, answers);
      showToast(
        auto
          ? `Time's up! Score: ${res.score}/${res.total_marks}`
          : `Test submitted! Score: ${res.score}/${res.total_marks}`,
        "success"
      );
      onNavigate("result", res.id);
    } catch (err) {
      showToast(err.message, "error");
      setSubmitted(false);
      setSubmitting(false);
      onNavigate("dashboard");
    }
  }, [submitted, submitting, answers, testId]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <div className="loading-pulse" style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
        <p style={{ color: "var(--text-dim)" }}>Loading test...</p>
      </div>
    );
  }

  if (!testData) return null;

  const questions = testData.questions;
  const q = questions[currentQ];
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const isUrgent = timeLeft < 60;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="fade-in">
      {/* Header: Title + Timer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 className="page__heading" style={{ fontSize: 22 }}>{testData.title}</h2>
          <p className="page__sub">
            Question {currentQ + 1} of {questions.length} · {answeredCount} answered
          </p>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10,
          background: isUrgent ? "rgba(239,68,68,0.15)" : "var(--surface-alt)",
          border: `1px solid ${isUrgent ? "var(--red)" : "var(--border)"}`,
        }}>
          <span style={{ fontSize: 13, color: isUrgent ? "var(--red)" : "var(--text-dim)", fontWeight: 600 }}>⏱</span>
          <span style={{
            fontSize: 22, fontWeight: 800, fontVariantNumeric: "tabular-nums",
            color: isUrgent ? "var(--red)" : "var(--accent)",
          }}>
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress" style={{ marginBottom: 28 }}>
        <div className="progress__fill" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
      </div>

      {/* Question Card */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>
          Question {currentQ + 1}
        </div>
        <p style={{ fontSize: 18, fontWeight: 600, color: "var(--text-bright)", lineHeight: 1.6, margin: "0 0 24px" }}>
          {q.question_text}
        </p>
        <div style={{ display: "grid", gap: 10 }}>
          {q.options.map((opt, i) => {
            const selected = answers[q.id] === opt;
            return (
              <button
                key={i}
                className={`option-btn ${selected ? "option-btn--selected" : ""}`}
                onClick={() => setAnswers({ ...answers, [q.id]: opt })}
              >
                <span className="option-btn__letter">{String.fromCharCode(65 + i)}</span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question Navigation Dots */}
      <div className="q-dots" style={{ marginBottom: 24 }}>
        {questions.map((qq, i) => {
          let cls = "q-dot";
          if (i === currentQ) cls += " q-dot--active";
          if (answers[qq.id]) cls += " q-dot--answered";
          return (
            <button key={i} className={cls} onClick={() => setCurrentQ(i)}>
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <button className="btn btn--secondary" onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}>
          ← Previous
        </button>
        <div style={{ display: "flex", gap: 10 }}>
          {currentQ < questions.length - 1 ? (
            <button className="btn btn--primary" onClick={() => setCurrentQ(currentQ + 1)}>
              Next →
            </button>
          ) : (
            <button className="btn btn--success" onClick={() => handleSubmit(false)} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Test ✓"}
            </button>
          )}
        </div>
      </div>

      {/* Unanswered Warning */}
      {answeredCount < questions.length && currentQ === questions.length - 1 && (
        <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "var(--accent)" }}>
          ⚠ {questions.length - answeredCount} question(s) unanswered
        </p>
      )}
    </div>
  );
}
