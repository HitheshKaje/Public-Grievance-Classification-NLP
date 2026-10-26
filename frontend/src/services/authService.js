// Frontend Authentication Service for Dynamic MongoDB User Management

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const USER_STORAGE_KEY = 'pgms_auth_user';
const TOKEN_STORAGE_KEY = 'pgms_auth_token';

/**
 * Log in with email, password, and optional target portal role.
 * Validates credentials dynamically against MongoDB.
 */
export async function login({ email, password, role }) {
  const payload = {
    email: email.trim().toLowerCase(),
    password: password.trim(),
    role: role || undefined
  };

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.detail || `Authentication failed (Status ${response.status})`;
    throw new Error(errorMsg);
  }

  if (data?.user && data?.token) {
    setCurrentUser(data.user, data.token);
  }

  return data;
}

/**
 * Register a new user dynamically into MongoDB.
 */
export async function register({ name, email, password, role = 'citizen', department, phone }) {
  const payload = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: password.trim(),
    role,
    department: role === 'officer' ? department?.trim() : undefined,
    phone: phone?.trim() || undefined
  };

  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.detail || `Registration failed (Status ${response.status})`;
    throw new Error(errorMsg);
  }

  // Session is not set upon registration; user must sign in with their registered credentials
  return data;
}

/**
 * Store user and token in localStorage.
 */
export function setCurrentUser(user, token) {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    }
  } catch (err) {
    console.error('Failed to store authentication state:', err);
  }
}

/**
 * Retrieve current logged-in user from localStorage.
 */
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('Failed to retrieve authentication state:', err);
    return null;
  }
}

/**
 * Retrieve auth token.
 */
export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Clear authentication session.
 */
export function logout() {
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear auth state:', err);
  }
}

/**
 * Check admin capacity status (strict maximum of 2 admins allowed).
 */
export async function getAdminSlotStatus() {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/admin-slot-status`);
    if (!res.ok) return { max_admins: 2, current_admins: 2, slots_available: 0, registration_allowed: false };
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch admin capacity:', err);
    return { max_admins: 2, current_admins: 2, slots_available: 0, registration_allowed: false };
  }
}
