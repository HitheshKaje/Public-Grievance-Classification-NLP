import React, { useState } from 'react';
import { MapPin, User, Phone, Mail, ArrowRight, Info, AlertCircle } from 'lucide-react';
import SupportingDocumentsDropzone from './SupportingDocumentsDropzone';

export default function WriteComplaintForm({ formData, onUpdateFormData, onProceedToReview }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.title?.trim()) {
      errs.title = 'Complaint title is required.';
    } else if (formData.title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters long.';
    }

    if (!formData.description?.trim()) {
      errs.description = 'Please describe your grievance in detail.';
    } else if (formData.description.trim().length < 20) {
      errs.description = 'Description should be at least 20 characters so the NLP classifier can route it effectively.';
    }

    if (!formData.location?.trim()) {
      errs.location = 'Incident location or area is required.';
    }

    if (formData.phone && !/^[0-9+\-\s]{8,15}$/.test(formData.phone.trim())) {
      errs.phone = 'Please enter a valid phone number or leave blank.';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address or leave blank.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onProceedToReview();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Complaint Title */}
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1">
          Complaint Title <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title || ''}
          onChange={(e) => {
            onUpdateFormData({ title: e.target.value });
            if (errors.title) setErrors({ ...errors, title: '' });
          }}
          placeholder="Brief summary of the issue (e.g., Major drinking water pipeline leakage in 4th Block)"
          className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${
            errors.title
              ? 'border-rose-400 focus:ring-1 focus:ring-rose-400 bg-rose-50/30'
              : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          }`}
        />
        {errors.title && (
          <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            <span>{errors.title}</span>
          </p>
        )}
      </div>

      {/* Complaint Description with Character Counter */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-slate-700">
            Complaint Description <span className="text-rose-500">*</span>
          </label>
          <span className={`text-[11px] font-mono ${
            (formData.description?.length || 0) < 20 ? 'text-amber-600' : 'text-slate-400'
          }`}>
            {formData.description?.length || 0} / 2000 chars (min 20)
          </span>
        </div>
        <textarea
          rows={5}
          value={formData.description || ''}
          maxLength={2000}
          onChange={(e) => {
            onUpdateFormData({ description: e.target.value });
            if (errors.description) setErrors({ ...errors, description: '' });
          }}
          placeholder="Describe the problem clearly. Mention when it started, how it affects residents, and specific context to assist department officers..."
          className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white text-slate-800 placeholder-slate-400 focus:outline-none transition-all leading-relaxed ${
            errors.description
              ? 'border-rose-400 focus:ring-1 focus:ring-rose-400 bg-rose-50/30'
              : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          }`}
        />
        {errors.description && (
          <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            <span>{errors.description}</span>
          </p>
        )}
      </div>

      {/* Incident Location */}
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1">
          Incident / Problem Location <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={formData.location || ''}
            onChange={(e) => {
              onUpdateFormData({ location: e.target.value });
              if (errors.location) setErrors({ ...errors, location: '' });
            }}
            placeholder="Street name, landmark, Ward number, locality, or pin code"
            className={`w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border bg-white text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${
              errors.location
                ? 'border-rose-400 focus:ring-1 focus:ring-rose-400 bg-rose-50/30'
                : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            }`}
          />
        </div>
        {errors.location && (
          <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            <span>{errors.location}</span>
          </p>
        )}
      </div>

      {/* Contact Details (Optional / Updates) */}
      <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-3">
        <span className="text-xs font-semibold text-slate-800 block">
          Citizen Contact Details
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-medium text-slate-600 block mb-1">Citizen Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={formData.citizenName || ''}
                onChange={(e) => onUpdateFormData({ citizenName: e.target.value })}
                placeholder="Your full name"
                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-600 block mb-1">Mobile Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => {
                  onUpdateFormData({ phone: e.target.value });
                  if (errors.phone) setErrors({ ...errors, phone: '' });
                }}
                placeholder="+91 98765 43210"
                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            {errors.phone && <p className="text-[10px] text-rose-600 mt-0.5">{errors.phone}</p>}
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-600 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => {
                  onUpdateFormData({ email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                placeholder="citizen@example.com"
                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            {errors.email && <p className="text-[10px] text-rose-600 mt-0.5">{errors.email}</p>}
          </div>
        </div>
      </div>

      {/* Supporting Documents (Optional) */}
      <SupportingDocumentsDropzone
        attachments={formData.attachments || []}
        onAttachmentsChange={(files) => onUpdateFormData({ attachments: files })}
      />

      {/* Form Action */}
      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          className="bg-[#1e6bf3] hover:bg-blue-700 text-white rounded-xl px-6 py-2.5 flex items-center gap-2 text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <span>Review Complaint</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
