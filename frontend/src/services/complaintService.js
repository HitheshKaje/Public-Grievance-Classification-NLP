// Frontend API service for Grievance Submissions & Real-Time Tracking

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Submits a new citizen grievance to the FastAPI backend.
 * Uses FormData so attached files (PDF, images, voice audio, attachments)
 * are uploaded safely and referenced in MongoDB.
 */
export async function submitGrievance(formData, method = 'write') {
  const payload = new FormData();

  payload.append('title', formData.title?.trim() || '');
  payload.append('description', formData.description?.trim() || '');
  payload.append('location', formData.location?.trim() || '');
  payload.append('method', method);

  if (formData.citizenName?.trim()) {
    payload.append('citizen_name', formData.citizenName.trim());
  }
  if (formData.phone?.trim()) {
    payload.append('phone', formData.phone.trim());
  }
  if (formData.email?.trim()) {
    payload.append('email', formData.email.trim());
  }

  // Primary attached files
  if (formData.pdfFile instanceof File) {
    payload.append('pdfFile', formData.pdfFile);
  }
  if (formData.imageFile instanceof File) {
    payload.append('imageFile', formData.imageFile);
  }
  if (formData.audioFile instanceof File) {
    payload.append('audioFile', formData.audioFile);
  } else if (formData.audioBlob instanceof Blob) {
    payload.append('audioFile', formData.audioBlob, `voice_grievance_${Date.now()}.webm`);
  }

  // Supporting attachments
  if (Array.isArray(formData.attachments)) {
    formData.attachments.forEach((file) => {
      if (file instanceof File) {
        payload.append('attachments', file);
      }
    });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/complaints`, {
      method: 'POST',
      body: payload
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.detail || `Submission failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    if (!data?.complaint_id) {
      throw new Error('Server response did not include a valid Complaint ID.');
    }

    return data;
  } catch (error) {
    console.error('Error submitting complaint to API:', error);
    throw error;
  }
}

/**
 * Fetches real complaint status and MongoDB details using the generated Complaint ID.
 */
export async function trackGrievance(complaintId) {
  if (!complaintId || !complaintId.trim()) {
    throw new Error('Please enter a valid Complaint ID.');
  }

  const cleanId = complaintId.trim();

  try {
    const response = await fetch(`${API_BASE_URL}/complaints/track/${encodeURIComponent(cleanId)}`);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(data?.detail || `No grievance found with reference ID "${cleanId}".`);
      }
      throw new Error(data?.detail || `Failed to fetch grievance status (HTTP ${response.status}).`);
    }

    return data?.complaint || data;
  } catch (error) {
    console.error('Error tracking complaint from API:', error);
    throw error;
  }
}

/**
 * Fetches real-time officer statistics and recent updates from MongoDB.
 */
export async function fetchOfficerStats(department = 'All') {
  try {
    const params = new URLSearchParams();
    if (department) params.append('department', department);
    const response = await fetch(`${API_BASE_URL}/officer/stats?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to load officer stats (HTTP ${response.status})`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching officer stats:', error);
    throw error;
  }
}

/**
 * Fetches complaints with search, status, and department filters.
 */
export async function fetchComplaints({
  search = '',
  category = 'All',
  status = 'All',
  department = 'All',
  sortBy = 'newest',
  page = 1,
  limit = 10
} = {}) {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    if (department) params.append('department', department);
    if (sortBy) params.append('sortBy', sortBy);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);

    const response = await fetch(`${API_BASE_URL}/complaints?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to load complaints (HTTP ${response.status})`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching complaints:', error);
    throw error;
  }
}

/**
 * Updates a complaint's status in MongoDB (e.g., 'Pending', 'In Progress', 'Resolved').
 */
export async function updateComplaintStatus(complaintId, status, remarks = '') {
  try {
    const response = await fetch(`${API_BASE_URL}/complaints/${encodeURIComponent(complaintId)}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status, remarks })
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.detail || `Failed to update status (HTTP ${response.status})`);
    }
    return data;
  } catch (error) {
    console.error('Error updating complaint status:', error);
    throw error;
  }
}

/**
 * Assigns or forwards a complaint to a specific department in MongoDB.
 */
export async function assignComplaint(complaintId, department, forwardingStatus = 'Forwarded') {
  try {
    const response = await fetch(`${API_BASE_URL}/complaints/${encodeURIComponent(complaintId)}/assign`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ department, forwarding_status: forwardingStatus })
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.detail || `Failed to assign complaint (HTTP ${response.status})`);
    }
    return data;
  } catch (error) {
    console.error('Error assigning complaint:', error);
    throw error;
  }
}

/**
 * Fetches real-time Admin Dashboard statistics, flow counts, and activity logs from MongoDB.
 */
export async function fetchAdminStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/stats`);
    if (!response.ok) {
      throw new Error(`Failed to load admin stats (HTTP ${response.status})`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
}

/**
 * Fetches registered officers list from MongoDB.
 */
export async function fetchOfficers(department = '') {
  try {
    const params = new URLSearchParams();
    if (department && department !== 'All') params.append('department', department);
    const response = await fetch(`${API_BASE_URL}/officers?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to load officers (HTTP ${response.status})`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching officers:', error);
    throw error;
  }
}

/**
 * Registers a new officer in MongoDB from the Admin Panel.
 */
export async function createOfficer(officerData) {
  try {
    const response = await fetch(`${API_BASE_URL}/officers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(officerData)
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.detail || `Failed to create officer (HTTP ${response.status})`);
    }
    return data;
  } catch (error) {
    console.error('Error registering officer:', error);
    throw error;
  }
}

/**
 * Deletes an officer from MongoDB.
 */
export async function deleteOfficer(officerId) {
  try {
    const response = await fetch(`${API_BASE_URL}/officers/${encodeURIComponent(officerId)}`, {
      method: 'DELETE'
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.detail || `Failed to delete officer (HTTP ${response.status})`);
    }
    return data;
  } catch (error) {
    console.error('Error deleting officer:', error);
    throw error;
  }
}

/**
 * Converts a complaint into a formal Government Work Order & Dispatch document and forwards it to the department officer.
 */
export async function forwardComplaintWithWorkOrder(complaintId, workOrderData) {
  try {
    const response = await fetch(`${API_BASE_URL}/complaints/${encodeURIComponent(complaintId)}/forward`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(workOrderData)
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.detail || `Failed to forward complaint (HTTP ${response.status})`);
    }
    return data;
  } catch (error) {
    console.error('Error forwarding complaint with work order:', error);
    throw error;
  }
}

const USER_COMPLAINTS_KEY = 'pgms_citizen_submitted_ids';

/**
 * Retrieves the list of Complaint IDs submitted by this citizen in the current browser.
 */
export function getLocalUserComplaintIds() {
  try {
    const raw = localStorage.getItem(USER_COMPLAINTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read local citizen complaints:', e);
    return [];
  }
}

/**
 * Persists a newly submitted Complaint ID to local storage and broadcasts an event for live dashboard updates.
 */
export function saveLocalUserComplaintId(complaintId) {
  if (!complaintId || typeof complaintId !== 'string') return;
  const cleanId = complaintId.trim();
  if (!cleanId) return;

  try {
    const existing = getLocalUserComplaintIds();
    if (!existing.includes(cleanId)) {
      const updated = [cleanId, ...existing];
      localStorage.setItem(USER_COMPLAINTS_KEY, JSON.stringify(updated));
    }
    // Dispatch custom event for real-time listener components
    window.dispatchEvent(
      new CustomEvent('pgms_complaint_submitted', {
        detail: { complaintId: cleanId }
      })
    );
  } catch (e) {
    console.error('Failed to save citizen complaint ID locally:', e);
  }
}

/**
 * Fetches real-time citizen dashboard statistics and processing counts from the backend MongoDB API.
 */
export async function fetchUserStats({ complaintIds = '', citizenId = '', phone = '' } = {}) {
  try {
    const params = new URLSearchParams();
    if (complaintIds && complaintIds.trim()) {
      params.append('complaint_ids', complaintIds.trim());
    }
    if (citizenId && citizenId.trim()) {
      params.append('citizen_id', citizenId.trim());
    }
    if (phone && phone.trim()) {
      params.append('phone', phone.trim());
    }

    const queryString = params.toString();
    const url = `${API_BASE_URL}/user/stats${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load citizen stats (HTTP ${response.status})`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching citizen stats:', error);
    throw error;
  }
}



