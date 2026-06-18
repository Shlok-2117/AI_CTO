const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Network error' }))
    throw new Error(err.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

export const authApi = {
  register: (data: { email: string; password: string; name?: string }) =>
    apiFetch<{ token: string; user: User }>('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    apiFetch<{ token: string; user: User }>('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => apiFetch('/api/auth/logout', { method: 'POST' }),
}

export const generateApi = {
  create: (problem: string) =>
    apiFetch<{ id: string; projectName: string; result: any }>('/api/generate', { method: 'POST', body: JSON.stringify({ problem }) }),
  getById: (id: string) => apiFetch<{ result: unknown }>(`/api/generate/${id}`),
}

export const historyApi = {
  getAll: () => apiFetch<unknown[]>('/api/history'),
  delete: (id: string) => apiFetch(`/api/history/${id}`, { method: 'DELETE' }),
}

interface User { id: string; email: string; name?: string }
