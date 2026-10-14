// src/services/api.js
// Centralized API service layer configured with VITE_API_URL

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Fetch aggregate analytics metrics and time series
 * @param {number} timeRange 
 * @returns {Promise<Object>}
 */
export async function getAnalytics(timeRange = 30) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const response = await fetch(`${API_BASE_URL}/analytics?range=${timeRange}`, {
    signal: controller.signal
  });
  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
  return await response.json();
}

/**
 * Fetch complaints list with filtering, searching, and sorting
 * @param {Object} params 
 * @returns {Promise<{complaints: Array, total: number, page: number, totalPages: number}>}
 */
export async function getComplaints(params = {}) {
  const {
    search = '',
    category = 'All',
    status = 'All',
    sortBy = 'newest',
    page = 1,
    limit = 8
  } = params;

  const queryParams = new URLSearchParams({
    search,
    category,
    status,
    sortBy,
    page: page.toString(),
    limit: limit.toString()
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const response = await fetch(`${API_BASE_URL}/complaints?${queryParams.toString()}`, {
    signal: controller.signal
  });
  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
  return await response.json();
}

/**
 * Classify a new complaint text
 * Calls POST /api/classify on the backend
 * @param {string} text 
 * @returns {Promise<{category: string, confidence: number, department?: string}>}
 */
export async function classifyComplaint(text) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const response = await fetch(`${API_BASE_URL}/classify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
    signal: controller.signal
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    if (response.status === 503) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || 'Classification model is not available yet.');
    }
    throw new Error(`API responded with status: ${response.status}`);
  }
  
  return await response.json();
}

/**
 * Fetch available categories taxonomy
 * @returns {Promise<Array>}
 */
export async function getCategories() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const response = await fetch(`${API_BASE_URL}/categories`, {
    signal: controller.signal
  });
  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
  return await response.json();
}

/**
 * Fetch a single complaint by ID
 * @param {string} id 
 * @returns {Promise<Object>}
 */
export async function getComplaintById(id) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const response = await fetch(`${API_BASE_URL}/complaints/${id}`, {
    signal: controller.signal
  });
  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
  return await response.json();
}

/**
 * Submit a new complaint manually (if needed)
 * @param {Object} complaint 
 * @returns {Promise<Object>}
 */
export async function submitNewComplaint(complaint) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const response = await fetch(`${API_BASE_URL}/complaints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(complaint),
    signal: controller.signal
  });
  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
  return await response.json();
}
