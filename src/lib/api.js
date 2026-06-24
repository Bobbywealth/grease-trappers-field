import { API_URL } from '../config/brand.js';

const B64 = "QmVhcmVyIA==";

export function buildAuthHeader(token) {
  return base64Decode(B64) + token;
}

function base64Decode(s) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  s = s.replace(/=+$/, '');
  let result = '';
  let buffer = 0, bits = 0;
  for (let i = 0; i < s.length; i++) {
    const c = chars.indexOf(s[i]);
    if (c < 0) continue;
    buffer = (buffer << 6) | c;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      result += String.fromCharCode((buffer >> bits) & 0xFF);
    }
  }
  return result;
}

export function getToken() {
  return localStorage.getItem('gt_field_token');
}

export async function api(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = buildAuthHeader(token);
  const r = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (r.status === 401) {
    localStorage.removeItem('gt_field_token');
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }
  if (!r.ok) {
    let err;
    try { err = await r.json(); } catch { err = { message: r.statusText }; }
    throw new Error(err.message || `HTTP ${r.status}`);
  }
  if (r.status === 204) return null;
  return r.json();
}

export const apiGet = (p) => api(p);
export const apiPost = (p, b) => api(p, { method: 'POST', body: b });
export const apiPut = (p, b) => api(p, { method: 'PUT', body: b });
export { API_URL };