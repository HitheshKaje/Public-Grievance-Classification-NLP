// src/services/api.js
// Centralized API service layer configured with VITE_API_URL and resilient fallback

import {
  CATEGORIES,
  SUMMARY_STATS,
  CATEGORY_DISTRIBUTION,
  COMPLAINT_TRENDS,
  INITIAL_COMPLAINTS,
  STATUS_BREAKDOWN
} from '../data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// In-memory session store so newly registered complaints appear throughout the app
let sessionComplaints = [...INITIAL_COMPLAINTS];

/**
 * Intelligent client-side NLP classifier simulation for seamless operation
 * when the backend server is not active during demo/evaluation.
 */
function simulateNLPClassification(text) {
  const lower = text.toLowerCase();
  
  // Keyword scoring weights
  const scores = {
    'Water Supply': 0.05,
    'Infrastructure': 0.05,
    'Electricity': 0.05,
    'Sanitation': 0.05,
    'Public Safety': 0.05,
    'Civic Services': 0.05,
    'Transport': 0.05,
    'Others': 0.05,
  };

  // Water Supply keywords
  if (/water|pipeline|leakage|drain|tap|sewage|borewell|drinking water|supply|tanker|pressure/i.test(lower)) {
    scores['Water Supply'] += 0.85;
  }
  // Infrastructure keywords
  if (/road|pothole|bridge|flyover|footpath|sidewalk|asphalt|divider|crater|construction|street paving/i.test(lower)) {
    scores['Infrastructure'] += 0.85;
  }
  // Electricity keywords
  if (/light|street light|electricity|power|transformer|wire|voltage|surge|blackout|meter|bulb|pole/i.test(lower)) {
    scores['Electricity'] += 0.85;
  }
  // Sanitation keywords
  if (/garbage|waste|trash|dump|stench|cleaning|sanitation|dustbin|compost|sweeping|drainage overflow|litter/i.test(lower)) {
    scores['Sanitation'] += 0.85;
  }
  // Public Safety keywords
  if (/police|safety|crime|theft|patrol|harassment|drunk|threat|drugs|vigilance|dark spot|assault/i.test(lower)) {
    scores['Public Safety'] += 0.85;
  }
  // Transport keywords
  if (/bus|route|traffic|signal|auto|metro|transit|transport|driver|commute|station|fare|depot/i.test(lower)) {
    scores['Transport'] += 0.85;
  }
  // Civic Services keywords
  if (/certificate|license|tax|property|birth|death|ration|revenue|ward office|bribe|delay|portal|official/i.test(lower)) {
    scores['Civic Services'] += 0.85;
  }

  // Normalize scores into probabilities
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const probabilities = Object.entries(scores)
    .map(([cat, score]) => ({
      category: cat,
      probability: Math.round((score / total) * 100) / 100
    }))
    .sort((a, b) => b.probability - a.probability);

  const top = probabilities[0];
  const matchedCategory = CATEGORIES.find(c => c.name === top.category) || CATEGORIES[7];
  
  // Calculate a realistic high confidence score (0.85 - 0.96)
  const confidence = Math.min(0.96, Math.max(0.78, Math.round((top.probability * 0.9 + 0.1) * 100) / 100));

  return {
    category: top.category,
    confidence: confidence,
    department: matchedCategory.department,
    probabilities: probabilities.slice(0, 4), // top 4 candidates
    timestamp: new Date().toISOString(),
    isMockFallback: true,
  };
}

/**
 * Classify a new complaint text
 * Calls POST /api/classify on the backend or falls back seamlessly
 * @param {string} text 
 * @returns {Promise<{category: string, confidence: number, probabilities?: Array, department?: string}>}
 */
export async function classifyComplaint(text) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(`${API_BASE_URL}/classify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      // Ensure expected schema format
      return {
        category: data.category,
        confidence: typeof data.confidence === 'number' ? data.confidence : parseFloat(data.confidence),
        probabilities: data.probabilities || [
          { category: data.category, probability: data.confidence },
        ],
        department: data.department || (CATEGORIES.find(c => c.name === data.category)?.department || 'Assigned Department'),
        isMockFallback: false
      };
    }
    throw new Error(`API responded with status: ${response.status}`);
  } catch (err) {
    // Graceful fallback to simulation engine so the dashboard is fully functional
    console.info(`[API Service] Using resilient simulated NLP response for classify (${err.message})`);
    // Artificial small delay to reflect real inference latency
    await new Promise(r => setTimeout(r, 450));
    return simulateNLPClassification(text);
  }
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

  try {
    const queryParams = new URLSearchParams({
      search,
      category,
      status,
      sortBy,
      page: page.toString(),
      limit: limit.toString()
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${API_BASE_URL}/complaints?${queryParams.toString()}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      return await response.json();
    }
    throw new Error(`HTTP error ${response.status}`);
  } catch (err) {
    // Local filter and pagination logic on session complaints
    let filtered = [...sessionComplaints];

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(item => 
        item.id.toLowerCase().includes(q) ||
        item.text.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.department && item.department.toLowerCase().includes(q))
      );
    }

    if (category && category !== 'All') {
      filtered = filtered.filter(item => item.category === category);
    }

    if (status && status !== 'All') {
      filtered = filtered.filter(item => item.status === status);
    }

    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === 'confidence_high') {
      filtered.sort((a, b) => b.confidence - a.confidence);
    } else if (sortBy === 'confidence_low') {
      filtered.sort((a, b) => a.confidence - b.confidence);
    }

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginatedComplaints = filtered.slice(startIndex, startIndex + limit);

    return {
      complaints: paginatedComplaints,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit) || 1
    };
  }
}

/**
 * Fetch aggregate analytics metrics and time series
 * @param {string} timeRange 
 * @returns {Promise<Object>}
 */
export async function getAnalytics(timeRange = '30d') {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${API_BASE_URL}/analytics?range=${timeRange}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      return await response.json();
    }
    throw new Error(`HTTP error ${response.status}`);
  } catch (err) {
    return {
      summary: SUMMARY_STATS,
      categoryDistribution: CATEGORY_DISTRIBUTION,
      complaintTrends: COMPLAINT_TRENDS,
      statusBreakdown: STATUS_BREAKDOWN
    };
  }
}

/**
 * Fetch available categories taxonomy
 * @returns {Promise<Array>}
 */
export async function getCategories() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${API_BASE_URL}/categories`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      return await response.json();
    }
    throw new Error(`HTTP error ${response.status}`);
  } catch (err) {
    return CATEGORIES;
  }
}

/**
 * Register a newly classified complaint into the system
 * @param {Object} complaint 
 * @returns {Promise<Object>}
 */
export async function submitNewComplaint(complaint) {
  const newRecord = {
    id: `GRV-2026-${Math.floor(1050 + Math.random() * 900)}`,
    text: complaint.text,
    details: complaint.text,
    category: complaint.category,
    confidence: complaint.confidence,
    date: new Date().toISOString().split('T')[0],
    status: 'Pending',
    department: complaint.department || (CATEGORIES.find(c => c.name === complaint.category)?.department || 'Municipal Grievance Cell'),
    citizenId: `CIT-${Math.floor(1000 + Math.random() * 9000)}`,
    ward: 'Ward 01 - City Central',
    priority: complaint.confidence > 0.9 ? 'High' : 'Medium'
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${API_BASE_URL}/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      sessionComplaints.unshift(data);
      return data;
    }
  } catch (e) {
    // Save to local session complaints
    sessionComplaints.unshift(newRecord);
  }

  return newRecord;
}

/**
 * Update complaint status
 * @param {string} id 
 * @param {string} newStatus 
 */
export async function updateComplaintStatus(id, newStatus) {
  const index = sessionComplaints.findIndex(c => c.id === id);
  if (index !== -1) {
    sessionComplaints[index] = { ...sessionComplaints[index], status: newStatus };
    return sessionComplaints[index];
  }
  return null;
}
