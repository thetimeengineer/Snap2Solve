export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5003/api";

const TOKEN_KEY = "civicfix_admin_token";

export function setToken(token: string) {
  try { localStorage.setItem(TOKEN_KEY, token); } catch {}
}

export function getToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function clearToken() {
  try { localStorage.removeItem(TOKEN_KEY); } catch {}
}

async function safeFetchJson(url: string, options: any = {}) {
  const token = getToken();
  const headers: any = { 
    "Content-Type": "application/json",
    ...options.headers 
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const fetchOptions = {
    ...options,
    headers
  };

  try {
    const res = await fetch(url, fetchOptions);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `Fetch failed: ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API fetch failed for ${url}:`, err);
    throw err;
  }
}

export async function login(email: string, password: string) {
  const data = await safeFetchJson(`${API_BASE}/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (data.token) {
    // Only allow admins
    if (data.user.role !== 'admin') {
      throw new Error("Access denied. Admin only.");
    }
    setToken(data.token);
  }
  return data;
}

export async function register(data: any) {
  const result = await safeFetchJson(`${API_BASE}/auth/register`, {
    method: "POST",
    body: JSON.stringify({ ...data, role: 'admin' }),
  });

  if (result.token) {
    setToken(result.token);
  }
  return result;
}

export async function createIssue(formData: FormData) {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/issues`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Fetch failed: ${res.status}`);
  }
  return await res.json();
}

export async function fetchIssues(params: Record<string, string> = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE}/issues${query ? `?${query}` : ''}`;
  return await safeFetchJson(url);
}

export async function fetchIssue(id: string) {
  return await safeFetchJson(`${API_BASE}/issues/${id}`);
}

export async function updateIssue(id: string, data: any) {
  return await safeFetchJson(`${API_BASE}/issues/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteIssue(id: string) {
  return await safeFetchJson(`${API_BASE}/issues/${id}`, {
    method: "DELETE",
  });
}

export async function fetchUsers() {
  return await safeFetchJson(`${API_BASE}/users`);
}

export async function fetchAnalytics() {
  // If backend doesn't have an analytics endpoint yet, we'll need to mock it or compute it
  try {
    return await safeFetchJson(`${API_BASE}/analytics`);
  } catch {
    // Fallback or compute locally from issues
    const { issues } = await fetchIssues({ limit: '1000' });
    const stats = {
      totalReports: issues.length,
      resolvedReports: issues.filter((i: any) => i.status === 'closed' || i.status === 'resolved').length,
      pendingReports: issues.filter((i: any) => i.status === 'open' || i.status === 'reported').length,
      inProgressReports: issues.filter((i: any) => i.status === 'in_progress' || i.status === 'acknowledged').length,
    };
    return stats;
  }
}

export async function fetchComments(issueId: string) {
  return await safeFetchJson(`${API_BASE}/issues/${issueId}/comments`);
}

export async function createComment(issueId: string, text: string) {
  return await safeFetchJson(`${API_BASE}/issues/${issueId}/comments`, {
    method: "POST",
    body: JSON.stringify({ body: text }),
  });
}
