import React from 'react';
import { 
  Briefcase, 
  ArrowRight, 
  Droplets, 
  Zap, 
  Milestone, 
  Lightbulb, 
  Plus, 
  GraduationCap, 
  Trash2 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function CommonCategoriesCard({ onViewAll, onSelectCategory }) {
  const { t } = useLanguage();

  const categories = [
    {
      id: 'water',
      name: t('cat_water', 'Water Supply'),
      icon: Droplets,
      bgColor: 'bg-[#eff6ff]',
      borderColor: 'border-blue-100',
      iconColor: 'text-blue-600',
      iconBg: 'bg-white',
    },
    {
      id: 'electricity',
      name: t('cat_electricity', 'Electricity'),
      icon: Zap,
      bgColor: 'bg-[#fffbeb]',
      borderColor: 'border-amber-100',
      iconColor: 'text-amber-500',
      iconBg: 'bg-white',
    },
    {
      id: 'roads',
      name: t('cat_roads', 'Roads & Infrastructure'),
      icon: Milestone,
      bgColor: 'bg-[#fff1f2]',
      borderColor: 'border-rose-100',
      iconColor: 'text-rose-500',
      iconBg: 'bg-white',
    },
    {
      id: 'lighting',
      name: t('cat_lighting', 'Street Lighting'),
      icon: Lightbulb,
      bgColor: 'bg-[#faf5ff]',
      borderColor: 'border-purple-100',
      iconColor: 'text-purple-600',
      iconBg: 'bg-white',
    },
    {
      id: 'healthcare',
      name: t('cat_healthcare', 'Public Healthcare'),
      icon: Plus,
      bgColor: 'bg-[#fdf2f8]',
      borderColor: 'border-pink-100',
      iconColor: 'text-pink-500',
      iconBg: 'bg-white',
    },
    {
      id: 'education',
      name: t('cat_education', 'Public Education'),
      icon: GraduationCap,
      bgColor: 'bg-[#ecfdf5]',
      borderColor: 'border-emerald-100',
      iconColor: 'text-emerald-600',
      iconBg: 'bg-white',
    },
    {
      id: 'sanitation',
      name: t('cat_sanitation', 'Sanitation & Garbage'),
      icon: Trash2,
      bgColor: 'bg-[#f0fdfa]',
      borderColor: 'border-teal-100',
      iconColor: 'text-teal-600',
      iconBg: 'bg-white',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4.5 w-4.5 text-amber-500 stroke-[2.2]" />
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">
            {t('common_categories', 'Common Complaint Categories')}
          </h2>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>{t('view_all', 'View All')}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 7 Horizontal Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory && onSelectCategory(cat.id)}
              className={`p-3.5 rounded-xl border ${cat.bgColor} ${cat.borderColor} hover:shadow-sm transition-all flex flex-col items-center justify-center text-center cursor-pointer group`}
            >
              <div className={`h-9 w-9 rounded-full ${cat.iconBg} ${cat.iconColor} flex items-center justify-center shadow-xs mb-2 group-hover:scale-105 transition-transform`}>
                <Icon className="h-4.5 w-4.5 stroke-[2.2]" />
              </div>
              <span className="text-[11px] font-semibold text-slate-800 line-clamp-1">
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
