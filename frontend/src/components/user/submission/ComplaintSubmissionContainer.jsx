import React, { useState } from 'react';
import SubmissionMethodSelector from './SubmissionMethodSelector';
import WriteComplaintForm from './WriteComplaintForm';
import PdfComplaintUpload from './PdfComplaintUpload';
import ImageComplaintUpload from './ImageComplaintUpload';
import ComplaintReviewStep from './ComplaintReviewStep';
import ComplaintConfirmationView from './ComplaintConfirmationView';

const INITIAL_FORM_DATA = {
  title: '',
  description: '',
  location: '',
  citizenName: '',
  phone: '',
  email: '',
  pdfFile: null,
  imageFile: null,
  attachments: []
};

export default function ComplaintSubmissionContainer({ onNavigateTab }) {
  const [method, setMethod] = useState('write'); // 'write' | 'pdf' | 'image'
  const [currentLanguage, setCurrentLanguage] = useState('en'); // 'en' | 'kn' | 'hi'
  const [step, setStep] = useState('fill'); // 'fill' | 'review' | 'confirmed'
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const handleUpdateFormData = (updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleResetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setStep('fill');
  };

  const handleMethodChange = (newMethod) => {
    setMethod(newMethod);
    // If switching methods, clear specific files to avoid mixing up primary payload
    if (newMethod === 'write') {
      setFormData((prev) => ({ ...prev, pdfFile: null, imageFile: null }));
    } else if (newMethod === 'pdf') {
      setFormData((prev) => ({ ...prev, imageFile: null }));
    } else if (newMethod === 'image') {
      setFormData((prev) => ({ ...prev, pdfFile: null }));
    }
  };

  return (
    <div className="space-y-5">
      {/* Step Header / Title Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Submit a Public Grievance
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Choose your preferred submission format. Our AI model will automatically analyze and route your grievance.
          </p>
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
            </div>
          </div>
        )}

        {step === 'review' && (
          <ComplaintReviewStep
            formData={formData}
            method={method}
            onBackToEdit={() => setStep('fill')}
            onSubmitFinal={() => setStep('confirmed')}
          />
        )}

        {step === 'confirmed' && (
          <ComplaintConfirmationView
            formData={formData}
            method={method}
            onSubmitAnother={handleResetForm}
            onReturnToDashboard={() => onNavigateTab && onNavigateTab('dashboard')}
          />
        )}
      </div>
    </div>
  );
}
