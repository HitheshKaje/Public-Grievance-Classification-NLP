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
