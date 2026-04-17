import { useState, useCallback } from "react";
import "./index.css";
import { getStoredUser, clearAuth } from "./utils/api";
import Toast from "./components/Toast";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import TestPage from "./pages/TestPage";
import ResultPage from "./pages/ResultPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  const [auth, setAuth] = useState(() => getStoredUser());
  const [page, setPage] = useState("dashboard");
  const [pageData, setPageData] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type, key: Date.now() });
  }, []);

  const navigate = useCallback((p, data = null) => {
    setPage(p);
    setPageData(data);
    window.scrollTo(0, 0);
  }, []);

  const handleAuth = (res) => {
    setAuth(res);
    setPage("dashboard");
  };

  const handleLogout = () => {
    clearAuth();
    setAuth(null);
    setPage("dashboard");
    setPageData(null);
    showToast("Logged out", "info");
  };

  // ─── Not logged in ───
  if (!auth) {
    return (
      <>
        <AuthPage onAuth={handleAuth} showToast={showToast} />
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </>
    );
  }

  // ─── Logged in ───
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header */}
      <header className="header">
        <div className="header__inner">
          <button className="header__logo" onClick={() => navigate("dashboard")}>
            <div className="header__icon">E</div>
            <span className="header__title">ExamForge</span>
          </button>
          <div className="header__right">
            <span className="header__user">{auth.user.name}</span>
            <span className={`header__badge header__badge--${auth.user.role}`}>
              {auth.user.role}
            </span>
            <button className="btn btn--ghost" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="page">
        {page === "dashboard" && (
          <Dashboard user={auth.user} onNavigate={navigate} showToast={showToast} />
        )}
        {page === "test" && (
          <TestPage testId={pageData} user={auth.user} onNavigate={navigate} showToast={showToast} />
        )}
        {page === "result" && (
          <ResultPage resultId={pageData} onNavigate={navigate} showToast={showToast} />
        )}
        {page === "admin" && (
          <AdminPage onNavigate={navigate} showToast={showToast} />
        )}
      </main>

      {/* Toast */}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
