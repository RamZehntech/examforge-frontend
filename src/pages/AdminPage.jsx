import { useState } from "react";
import { createTest } from "../utils/api";

export default function AdminPage({ onNavigate, showToast }) {
  const [json, setJson] = useState(`{
  "title": "Science Quiz",
  "duration": 10,
  "questions": [
    {
      "question": "What gas do plants absorb?",
      "options": ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
      "correct_answer": "Carbon Dioxide"
    },
    {
      "question": "Speed of light is approximately?",
      "options": ["300,000 km/s", "150,000 km/s", "1,000 km/s", "30,000 km/s"],
      "correct_answer": "300,000 km/s"
    }
  ]
}`);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handlePreview = () => {
    try {
      const data = JSON.parse(json);
      if (!data.title || !data.duration || !data.questions?.length) throw new Error("Missing required fields: title, duration, questions");
      data.questions.forEach((q, i) => {
        if (!q.question || !q.options?.length || !q.correct_answer) throw new Error(`Question ${i + 1} is incomplete`);
        if (!q.options.includes(q.correct_answer)) throw new Error(`Question ${i + 1}: correct_answer "${q.correct_answer}" is not in options`);
      });
      setPreview(data);
      showToast("JSON validated successfully!", "success");
    } catch (e) {
      showToast(`Invalid JSON: ${e.message}`, "error");
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!preview) return;
    setUploading(true);
    try {
      await createTest(preview);
      showToast(`Test "${preview.title}" created with ${preview.questions.length} questions!`, "success");
      setPreview(null);
      setJson("");
      onNavigate("dashboard");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h2 className="page__heading">Upload Test</h2>
        <p className="page__sub">Paste your test JSON below and preview before publishing</p>
      </div>

      {/* JSON Editor */}
      <div className="card" style={{ marginBottom: 20 }}>
        <label className="form-label">Test JSON</label>
        <textarea
          className="form-input form-textarea"
          value={json}
          onChange={(e) => setJson(e.target.value)}
          rows={16}
        />
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button className="btn btn--primary" onClick={handlePreview}>Validate & Preview</button>
          <button className="btn btn--secondary" onClick={() => onNavigate("dashboard")}>Cancel</button>
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <div className="card" style={{ borderColor: "var(--green)", marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 8px", color: "var(--green)", fontSize: 16, fontWeight: 700 }}>
            Preview: {preview.title}
          </h3>
          <p style={{ margin: "0 0 16px", color: "var(--text-dim)", fontSize: 13 }}>
            Duration: {preview.duration} min · {preview.questions.length} questions
          </p>

          {preview.questions.map((q, i) => (
            <div key={i} style={{ padding: 14, background: "var(--bg)", borderRadius: 8, marginBottom: 8 }}>
              <p style={{ margin: "0 0 8px", fontWeight: 600, color: "var(--text)", fontSize: 14 }}>
                Q{i + 1}. {q.question}
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {q.options.map((o, j) => (
                  <span key={j} style={{
                    padding: "4px 12px", borderRadius: 6, fontSize: 12,
                    background: o === q.correct_answer ? "rgba(16,185,129,0.15)" : "var(--surface-alt)",
                    color: o === q.correct_answer ? "var(--green)" : "var(--text-dim)",
                    border: `1px solid ${o === q.correct_answer ? "var(--green)" : "var(--border)"}`,
                  }}>
                    {o} {o === q.correct_answer && "✓"}
                  </span>
                ))}
              </div>
            </div>
          ))}

          <button
            className="btn btn--success btn--full"
            style={{ marginTop: 16 }}
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? "Publishing..." : "Publish Test"}
          </button>
        </div>
      )}

      {/* JSON Format Reference */}
      <div className="card" style={{ background: "var(--surface-alt)" }}>
        <h4 style={{ margin: "0 0 10px", color: "var(--accent)", fontSize: 14, fontWeight: 700 }}>
          JSON Format Reference
        </h4>
        <pre style={{
          margin: 0, fontSize: 12, color: "var(--text-dim)", lineHeight: 1.6, whiteSpace: "pre-wrap",
          fontFamily: "'Fira Code', 'Courier New', monospace",
        }}>{`{
  "title": "Test Title",
  "duration": 10,        // minutes
  "questions": [
    {
      "question": "Your question text?",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "A"  // must match an option exactly
    }
  ]
}`}</pre>
      </div>
    </div>
  );
}
