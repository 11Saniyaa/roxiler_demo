export class ApiError extends Error {
  constructor(message, status, fields) {
    super(message);
    this.status = status;
    this.fields = fields || null;
  }
}

const TOKEN_KEY = 'roxiler_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function api(path, { method = 'GET', body } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const response = await fetch(path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const silent = path.startsWith('/api/auth/login') || path.startsWith('/api/auth/me');
    if (response.status === 401 && !silent) {
      clearToken();
      window.location.assign('/login');
    }
    throw new ApiError(data.message || 'Request failed.', response.status, data.fields);
  }
  return data;
}
