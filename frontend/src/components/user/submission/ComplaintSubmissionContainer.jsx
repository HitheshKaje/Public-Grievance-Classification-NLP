import React, { useState } from 'react';
import SubmissionMethodSelector from './SubmissionMethodSelector';
import WriteComplaintForm from './WriteComplaintForm';
import PdfComplaintUpload from './PdfComplaintUpload';
import ImageComplaintUpload from './ImageComplaintUpload';
import VoiceComplaintUpload from './VoiceComplaintUpload';
import ComplaintReviewStep from './ComplaintReviewStep';
import ComplaintConfirmationView from './ComplaintConfirmationView';
import { submitGrievance } from '../../../services/complaintService';

const INITIAL_FORM_DATA = {
  title: '',
  description: '',
  location: '',
  citizenName: '',
  phone: '',
  email: '',
  pdfFile: null,
  imageFile: null,
  audioFile: null,
  audioBlob: null,
  audioDuration: 0,
  attachments: []
};

export default function ComplaintSubmissionContainer({ onNavigateTab, onTrackGrievance }) {
  const [method, setMethod] = useState('write'); // 'write' | 'pdf' | 'image' | 'voice'
  const [currentLanguage, setCurrentLanguage] = useState('en'); // 'en' | 'kn' | 'hi'
  const [step, setStep] = useState('fill'); // 'fill' | 'review' | 'confirmed'
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  const handleUpdateFormData = (updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleResetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setSubmitError(null);
    setSubmittedComplaint(null);
    setStep('fill');
  };

  const handleSubmitFinal = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = await submitGrievance(formData, method);
      const complaintData = response.complaint || response;
      setSubmittedComplaint(complaintData);
      setStep('confirmed');
    } catch (err) {
      setSubmitError(
        err.message || 'Failed to submit grievance. Please verify server connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMethodChange = (newMethod) => {
    setMethod(newMethod);
    // Clear other primary files when switching methods
    if (newMethod === 'write') {
      setFormData((prev) => ({ ...prev, pdfFile: null, imageFile: null, audioFile: null, audioBlob: null }));
    } else if (newMethod === 'pdf') {
      setFormData((prev) => ({ ...prev, imageFile: null, audioFile: null, audioBlob: null }));
    } else if (newMethod === 'image') {
      setFormData((prev) => ({ ...prev, pdfFile: null, audioFile: null, audioBlob: null }));
    } else if (newMethod === 'voice') {
      setFormData((prev) => ({ ...prev, pdfFile: null, imageFile: null }));
    }
  };

  return (
    <div className="space-y-5">
      {/* Step Header / Title Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Submit a Public Grievance
          </h2>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            step === 'fill' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-50 text-slate-500'
          }`}>
            <span>1. Details</span>
          </div>
          <span className="text-slate-300">&rarr;</span>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            step === 'review' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-50 text-slate-500'
          }`}>
            <span>2. Review</span>
          </div>
          <span className="text-slate-300">&rarr;</span>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            step === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-500'
          }`}>
            <span>3. Confirmation</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-7 shadow-sm">
        {step === 'fill' && (
          <div className="space-y-6">
            {/* Method Cards & Multilingual Selector */}
            <SubmissionMethodSelector
              selectedMethod={method}
              onSelectMethod={handleMethodChange}
              currentLanguage={currentLanguage}
              onSelectLanguage={setCurrentLanguage}
            />

            <div className="pt-2 border-t border-slate-100">
              {method === 'write' && (
                <WriteComplaintForm
                  formData={formData}
                  onUpdateFormData={handleUpdateFormData}
                  onProceedToReview={() => setStep('review')}
                />
              )}

              {method === 'pdf' && (
                <PdfComplaintUpload
                  formData={formData}
                  onUpdateFormData={handleUpdateFormData}
                  onProceedToReview={() => setStep('review')}
                />
              )}

              {method === 'image' && (
                <ImageComplaintUpload
                  formData={formData}
                  onUpdateFormData={handleUpdateFormData}
                  onProceedToReview={() => setStep('review')}
                />
              )}

              {method === 'voice' && (
                <VoiceComplaintUpload
                  formData={formData}
                  onUpdateFormData={handleUpdateFormData}
                  onProceedToReview={() => setStep('review')}
                />
              )}
            </div>
          </div>
        )}

        {step === 'review' && (
          <ComplaintReviewStep
            formData={formData}
            method={method}
            onBackToEdit={() => setStep('fill')}
            onSubmitFinal={handleSubmitFinal}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        )}

        {step === 'confirmed' && (
          <ComplaintConfirmationView
            formData={formData}
            method={method}
            submittedComplaint={submittedComplaint}
            onSubmitAnother={handleResetForm}
            onReturnToDashboard={() => onNavigateTab && onNavigateTab('dashboard')}
            onTrackGrievance={onTrackGrievance}
          />
        )}
      </div>
    </div>
  );
}
