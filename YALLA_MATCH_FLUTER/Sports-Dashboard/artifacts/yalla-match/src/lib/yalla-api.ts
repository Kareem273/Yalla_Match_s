const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export type ApiReservation = {
  id: string; courtId: string; courtName?: string; customerName?: string; customerPhone?: string;
  date: string; fromHour: number; toHour: number; price: number; source?: string; status: string; paymentStatus: string;
  qrToken?: string; paymentScreenshotUrl?: string; createdAtUtc: string; rejectionReason?: string;
};

export type ApiRefund = {
  id: string; reservationId: string; courtName?: string; customerName?: string; customerPhone?: string;
  date: string; fromHour: number; toHour: number; amount: number; reason?: string; refundedAtUtc: string;
};

export type ApiCourt = { id: string; name: string; place: string; sportType?: string; price: number; locationUrl?: string; paymentPhone?: string; ownerId?: string };
export type ApiDashboardSummary = { activeCourts: number; blockedSlots: number };
export type ApiDashboardOverview = {
  reservations: ApiReservation[];
  courts: ApiCourt[];
  refunds: ApiRefund[];
  summary: ApiDashboardSummary;
  pendingRefundRequestsCount: number;
};

function getValidToken(): string | null {
  const token = localStorage.getItem('yalla-admin-token');
  if (!token || token === 'undefined' || token === 'null') {
    localStorage.removeItem('yalla-admin-token');
    return null;
  }
  return token;
}

function handle401Unauthorized() {
  localStorage.removeItem('yalla-admin-token');
  localStorage.removeItem('yalla-admin-email');
  if (window.location.pathname !== '/') {
    window.location.assign('/');
  }
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password })
  });

  if (!response.ok) {
    let errorMsg = 'Invalid email or password';
    try {
      const data = await response.json();
      errorMsg = data.message || errorMsg;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  const data = await response.json();
  const token = data.token || data.Token;
  const userEmail = data.email || data.Email || email;
  const role = data.role || data.Role || 'Admin';
  if (!token) throw new Error('No auth token received from server');
  localStorage.setItem('yalla-admin-role', role);
  return { token: token as string, email: userEmail as string, role: role as string };
}

export async function apiGet<T>(path: string): Promise<T> {
  const token = getValidToken();
  const response = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  if (response.status === 401) {
    handle401Unauthorized();
    throw new Error('Unauthorized');
  }

  if (!response.ok) throw new Error('Unable to load data');
  return response.json() as Promise<T>;
}

export async function apiAdmin<T>(path: string, method: 'POST' | 'PUT' | 'DELETE', body?: unknown): Promise<T> {
  const token = getValidToken();
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  if (response.status === 401) {
    handle401Unauthorized();
    throw new Error('Unauthorized');
  }

  if (!response.ok) throw new Error((await response.text()) || 'Request failed');
  return response.status === 204 ? (undefined as T) : (response.json() as Promise<T>);
}

export async function apiAdminForm<T>(path: string, form: FormData, method: 'POST' | 'PUT' = 'POST'): Promise<T> {
  const token = getValidToken();
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });

  if (response.status === 401) {
    handle401Unauthorized();
    throw new Error('Unauthorized');
  }

  if (!response.ok) throw new Error((await response.text()) || 'Request failed');
  return response.json() as Promise<T>;
}

export function resolveApiUrl(path: string): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const base = API_URL.replace(/\/+$/, '');
  if (base.endsWith('/api') && cleanPath.startsWith('/api/')) {
    return `${base.replace(/\/api$/, '')}${cleanPath}`;
  }
  return `${base}${cleanPath}`;
}

export function apiMediaUrl(path?: string): string {
  if (!path) return '';
  return resolveApiUrl(path);
}

export async function fetchProtectedMediaBlobUrl(path: string): Promise<string> {
  const token = getValidToken();
  const url = resolveApiUrl(path);
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (response.status === 401) {
    handle401Unauthorized();
    throw new Error('Unauthorized');
  }
  if (!response.ok) throw new Error('Unable to load the payment receipt.');

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export async function openProtectedMedia(path: string): Promise<void> {
  const objectUrl = await fetchProtectedMediaBlobUrl(path);
  const receiptWindow = window.open(objectUrl, '_blank', 'noopener,noreferrer');
  if (!receiptWindow) {
    const a = document.createElement('a');
    a.href = objectUrl;
    a.target = '_blank';
    a.rel = 'noopener,noreferrer';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 120_000);
}

export interface ApiAuditLog {
  id: string;
  timestamp: string;
  adminEmail: string;
  adminRole: string;
  action: string;
  details: string;
  category: string;
}
