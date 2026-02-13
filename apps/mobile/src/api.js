import { API_BASE } from "./config";
import { auth } from "./firebase";

export async function apiFetch(path, { method="GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(()=>null);
  if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
  return data;
}
