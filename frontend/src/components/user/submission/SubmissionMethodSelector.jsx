import React from 'react';
import { PenTool, FileText, Camera, Mic, Globe2 } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export default function SubmissionMethodSelector({ selectedMethod, onSelectMethod, onSelectLanguage }) {
  const { language, setLanguage, t } = useLanguage();

  const handleLang = (langId) => {
    setLanguage(langId);
    if (onSelectLanguage) onSelectLanguage(langId);
  };

  const methods = [
    {
      id: 'write',
      title: t('method_text', 'Write a Complaint'),
      description: t('method_text_desc', 'Fill out our structured grievance form with title, details, and incident location.'),
      icon: PenTool,
      badge: 'Direct Entry',
      color: 'blue',
      borderClass: 'hover:border-blue-300',
      activeClass: 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20',
      iconClass: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'pdf',
      title: t('method_pdf', 'Upload PDF Document'),
      description: t('method_pdf_desc', 'Submit an existing typed complaint, petition, or official representation letter.'),
      icon: FileText,
      badge: 'Document Mode',
      color: 'rose',
      borderClass: 'hover:border-rose-300',
      activeClass: 'border-rose-600 bg-rose-50/40 ring-2 ring-rose-500/20',
      iconClass: 'bg-rose-100 text-rose-600',
    },
    {
      id: 'image',
      title: t('method_photo', 'Upload Photographs'),
      description: t('method_photo_desc', 'Attach visual evidence (damaged road, leak, broken light) with problem description.'),
      icon: Camera,
      badge: 'Visual Evidence',
      color: 'emerald',
      borderClass: 'hover:border-emerald-300',
      activeClass: 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20',
      iconClass: 'bg-emerald-100 text-emerald-600',
    },
    {
      id: 'voice',
      title: t('method_voice', 'Voice Grievance'),
      description: t('method_voice_desc', 'Record or upload an audio complaint. Transcribed & classified by NLP.'),
      icon: Mic,
      badge: 'Speech / Audio',
      color: 'violet',
      borderClass: 'hover:border-violet-300',
      activeClass: 'border-violet-600 bg-violet-50/40 ring-2 ring-violet-500/20',
      iconClass: 'bg-violet-100 text-violet-600',
    },
  ];

  const languages = [
    { id: 'en', label: 'English', native: 'English' },
    { id: 'kn', label: 'ಕನ್ನಡ (Kannada)', native: 'ಕನ್ನಡ' },
    { id: 'hi', label: 'हिन्दी (Hindi)', native: 'हिन्दी' },
  ];

  return (
    <div className="space-y-4">
      {/* Language Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Globe2 className="h-4 w-4 text-blue-600" />
          <span>{t('filing_language', 'Dashboard & Filing Language:')}</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {languages.map((lang) => {
            const isSelected = language === lang.id;
            return (
              <button
                key={lang.id}
                type="button"
                id={`submission-lang-${lang.id}`}
                onClick={() => handleLang(lang.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs scale-105'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
                title={`Switch language to ${lang.label}`}
              >
                <span>{lang.label}</span>
                <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Method Selection 4-Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {methods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onSelectMethod(method.id)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? method.activeClass
                  : `border-slate-200/80 bg-white ${method.borderClass} hover:shadow-xs`
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className={`h-8 w-8 rounded-lg ${method.iconClass} flex items-center justify-center`}>
                  <Icon className="h-4 w-4 stroke-[2]" />
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {method.badge}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800">{method.title}</h3>
                <span className={`h-2 w-2 rounded-full ${isSelected ? 'bg-blue-600 ring-2 ring-blue-200' : 'bg-slate-300'}`} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
