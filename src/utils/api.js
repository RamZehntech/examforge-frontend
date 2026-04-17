// ============================================
// 🔴 IMPORTANT: Change this to your Render URL
// ============================================
const API_BASE = "https://examforge-backend-1-hb4q.onrender.com";

// Get stored token
function getToken() {
  return localStorage.getItem("examforge_token");
}

// Save auth data
export function saveAuth(data) {
  localStorage.setItem("examforge_token", data.token);
  localStorage.setItem("examforge_user", JSON.stringify(data.user));
}

// Get stored user
export function getStoredUser() {
  try {
    const token = getToken();
    const user = localStorage.getItem("examforge_user");
    if (token && user) return { token, user: JSON.parse(user) };
  } catch {}
  return null;
}

// Clear auth
export function clearAuth() {
  localStorage.removeItem("examforge_token");
  localStorage.removeItem("examforge_user");
}

// Base fetch wrapper with auth
async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data;
}

// ==========================================
// Auth APIs
// ==========================================
export async function register(name, email, password) {
  const data = await apiFetch("/api/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  saveAuth(data);
  return data;
}

export async function login(email, password) {
  const data = await apiFetch("/api/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  saveAuth(data);
  return data;
}

// ==========================================
// Test APIs
// ==========================================
export async function getTests() {
  return apiFetch("/api/tests");
}

export async function getTest(id) {
  return apiFetch(`/api/tests/${id}`);
}

export async function createTest(testData) {
  return apiFetch("/api/tests", {
    method: "POST",
    body: JSON.stringify(testData),
  });
}

// ==========================================
// Submission APIs
// ==========================================
export async function submitTest(testId, answers) {
  return apiFetch("/api/submit", {
    method: "POST",
    body: JSON.stringify({ test_id: testId, answers }),
  });
}

export async function getResults() {
  return apiFetch("/api/results");
}

export async function getResult(id) {
  return apiFetch(`/api/result/${id}`);
}
