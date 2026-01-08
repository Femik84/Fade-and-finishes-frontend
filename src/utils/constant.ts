export const USE_LOCAL = false;
export const LOCAL_IP = "192.168.43.110";

export const API_BASE_URL = USE_LOCAL
  ? `http://${LOCAL_IP}:8000/api/`
  : "https://fade-and-finishes.onrender.com/api/";


export async function apiGet<T = any>(path: string): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API GET ${url} failed: ${res.status} ${res.statusText} - ${text}`);
  }
  return res.json();
}