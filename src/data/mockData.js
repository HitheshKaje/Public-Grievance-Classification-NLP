// src/data/mockData.js
// Mock data layer representing public grievance records, taxonomies, and analytics

export const CATEGORIES = [
  { id: 'Civic Services', name: 'Civic Services', color: '#6366F1', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', department: 'Municipal Administration' },
  { id: 'Infrastructure', name: 'Infrastructure', color: '#F59E0B', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', department: 'Public Works Department (PWD)' },
  { id: 'Electricity', name: 'Electricity', color: '#EAB308', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', department: 'State Electricity Board' },
  { id: 'Water Supply', name: 'Water Supply', color: '#0EA5E9', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', department: 'Water Supply & Sewerage Board' },
  { id: 'Sanitation', name: 'Sanitation', color: '#10B981', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', department: 'Solid Waste Management' },
  { id: 'Public Safety', name: 'Public Safety', color: '#EF4444', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', department: 'City Police & Vigilance' },
  { id: 'Transport', name: 'Transport', color: '#8B5CF6', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', department: 'Metropolitan Transport Corp' },
  { id: 'Others', name: 'Others', color: '#64748B', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', department: 'General Grievance Cell' },
];

export const SUMMARY_STATS = {
  totalComplaints: 1245,
  totalTrend: '+12.4% from last month',
  classifiedComplaints: 1180,
  classifiedTrend: '94.8% auto-categorized',
  pendingReview: 65,
  pendingTrend: '-8.2% backlog reduction',
  categoriesCount: 8,
  categoriesTrend: 'Active Grievance Taxonomies'
};

export const CATEGORY_DISTRIBUTION = [
  { name: 'Water Supply', value: 240, percentage: 19.3, color: '#0EA5E9' },
  { name: 'Infrastructure', value: 215, percentage: 17.3, color: '#F59E0B' },
  { name: 'Electricity', value: 195, percentage: 15.7, color: '#EAB308' },
  { name: 'Sanitation', value: 185, percentage: 14.9, color: '#10B981' },
  { name: 'Public Safety', value: 140, percentage: 11.2, color: '#EF4444' },
  { name: 'Civic Services', value: 125, percentage: 10.0, color: '#6366F1' },
  { name: 'Transport', value: 95, percentage: 7.6, color: '#8B5CF6' },
  { name: 'Others', value: 50, percentage: 4.0, color: '#64748B' },
];

// 30 Days trend data
export const COMPLAINT_TRENDS = [
  { date: 'Aug 28', complaints: 38, classified: 36, pending: 2 },
  { date: 'Aug 29', complaints: 42, classified: 40, pending: 2 },
  { date: 'Aug 30', complaints: 35, classified: 33, pending: 2 },
  { date: 'Aug 31', complaints: 48, classified: 45, pending: 3 },
  { date: 'Sep 01', complaints: 52, classified: 50, pending: 2 },
  { date: 'Sep 02', complaints: 41, classified: 38, pending: 3 },
  { date: 'Sep 03', complaints: 39, classified: 38, pending: 1 },
  { date: 'Sep 04', complaints: 45, classified: 42, pending: 3 },
  { date: 'Sep 05', complaints: 50, classified: 48, pending: 2 },
  { date: 'Sep 06', complaints: 46, classified: 43, pending: 3 },
  { date: 'Sep 07', complaints: 37, classified: 35, pending: 2 },
  { date: 'Sep 08', complaints: 34, classified: 33, pending: 1 },
  { date: 'Sep 09', complaints: 44, classified: 42, pending: 2 },
  { date: 'Sep 10', complaints: 53, classified: 51, pending: 2 },
  { date: 'Sep 11', complaints: 49, classified: 46, pending: 3 },
  { date: 'Sep 12', complaints: 42, classified: 40, pending: 2 },
  { date: 'Sep 13', complaints: 38, classified: 37, pending: 1 },
  { date: 'Sep 14', complaints: 40, classified: 38, pending: 2 },
  { date: 'Sep 15', complaints: 47, classified: 45, pending: 2 },
  { date: 'Sep 16', complaints: 55, classified: 52, pending: 3 },
  { date: 'Sep 17', complaints: 48, classified: 45, pending: 3 },
  { date: 'Sep 18', complaints: 43, classified: 41, pending: 2 },
  { date: 'Sep 19', complaints: 39, classified: 38, pending: 1 },
  { date: 'Sep 20', complaints: 36, classified: 35, pending: 1 },
  { date: 'Sep 21', complaints: 41, classified: 39, pending: 2 },
  { date: 'Sep 22', complaints: 52, classified: 50, pending: 2 },
  { date: 'Sep 23', complaints: 58, classified: 55, pending: 3 },
  { date: 'Sep 24', complaints: 47, classified: 45, pending: 2 },
  { date: 'Sep 25', complaints: 50, classified: 48, pending: 2 },
  { date: 'Sep 26', complaints: 44, classified: 42, pending: 2 },
];

export const STATUS_BREAKDOWN = [
  { status: 'Resolved', count: 780, color: '#10B981' },
  { status: 'In Progress', count: 310, color: '#3B82F6' },
  { status: 'Under Review', count: 90, color: '#F59E0B' },
  { status: 'Pending', count: 65, color: '#EF4444' },
];

export const INITIAL_COMPLAINTS = [
  {
    id: 'GRV-2026-1049',
    text: 'Street light not working in our area',
    details: 'The street light on 4th Cross, Gandhi Nagar has been non-functional for over 10 days, causing safety concerns for night commuters.',
    category: 'Electricity',
    confidence: 0.92,
    date: '2026-09-26',
    status: 'In Progress',
    department: 'State Electricity Board',
    citizenId: 'CIT-8921',
    ward: 'Ward 14 - North Zone',
    priority: 'Medium'
  },
  {
    id: 'GRV-2026-1048',
    text: 'Garbage not collected for a week',
    details: 'Door-to-door solid waste collection vehicle has not visited 7th Main layout for the past 7 days. Stench and stray dog nuisance spreading.',
    category: 'Sanitation',
    confidence: 0.88,
    date: '2026-09-25',
    status: 'Pending',
    department: 'Solid Waste Management',
    citizenId: 'CIT-7412',
    ward: 'Ward 22 - Central Zone',
    priority: 'High'
  },
  {
    id: 'GRV-2026-1047',
    text: 'Water supply is irregular',
    details: 'Potable municipal water supply is arriving once in 4 days at extremely low pressure, unable to fill overhead tanks for residents.',
    category: 'Water Supply',
    confidence: 0.90,
    date: '2026-09-25',
    status: 'Under Review',
    department: 'Water Supply & Sewerage Board',
    citizenId: 'CIT-3309',
    ward: 'Ward 08 - South Zone',
    priority: 'High'
  },
  {
    id: 'GRV-2026-1046',
    text: 'Potholes on main road',
    details: 'Massive craters and potholes on the Outer Ring Road near flyover junction causing frequent bike skids and traffic gridlocks.',
    category: 'Infrastructure',
    confidence: 0.87,
    date: '2026-09-24',
    status: 'In Progress',
    department: 'Public Works Department (PWD)',
    citizenId: 'CIT-5182',
    ward: 'Ward 31 - East Zone',
    priority: 'High'
  },
  {
    id: 'GRV-2026-1045',
    text: 'Need police patrolling at night',
    details: 'Instances of harassment and noise nuisance by rogue motorcyclists between 11 PM and 2 AM. Residents request regular mobile beat patrols.',
    category: 'Public Safety',
    confidence: 0.85,
    date: '2026-09-23',
    status: 'Under Review',
    department: 'City Police & Vigilance',
    citizenId: 'CIT-9041',
    ward: 'Ward 19 - West Zone',
    priority: 'Medium'
  },
  {
    id: 'GRV-2026-1044',
    text: 'Delay in birth certificate issuance at municipal ward office',
    details: 'Application submitted 25 days ago with all verified documents. Ward revenue inspector stating portal system down without explanation.',
    category: 'Civic Services',
    confidence: 0.94,
    date: '2026-09-22',
    status: 'Resolved',
    department: 'Municipal Administration',
    citizenId: 'CIT-1284',
    ward: 'Ward 05 - Central Zone',
    priority: 'Low'
  },
  {
    id: 'GRV-2026-1043',
    text: 'Bus route 401 frequency dropped drastically during peak hours',
    details: 'Commuters waiting over 45 minutes for state transport buses during morning office rush between 8:30 AM and 10 AM.',
    category: 'Transport',
    confidence: 0.89,
    date: '2026-09-21',
    status: 'In Progress',
    department: 'Metropolitan Transport Corp',
    citizenId: 'CIT-6672',
    ward: 'Ward 12 - South Zone',
    priority: 'Medium'
  },
  {
    id: 'GRV-2026-1042',
    text: 'Broken drainage pipeline spilling sewage onto sidewalk',
    details: 'Cracked concrete underground pipeline overflowing near government primary school. Urgent repair needed before health hazards occur.',
    category: 'Sanitation',
    confidence: 0.93,
    date: '2026-09-20',
    status: 'Resolved',
    department: 'Solid Waste Management',
    citizenId: 'CIT-4019',
    ward: 'Ward 28 - East Zone',
    priority: 'Critical'
  },
  {
    id: 'GRV-2026-1041',
    text: 'High voltage fluctuation damaged domestic appliances',
    details: 'Repeated power surges reaching 280V occurred on Tuesday evening, blowing transformer fuses and damaging home inverters and TVs.',
    category: 'Electricity',
    confidence: 0.91,
    date: '2026-09-19',
    status: 'Resolved',
    department: 'State Electricity Board',
    citizenId: 'CIT-7811',
    ward: 'Ward 03 - North Zone',
    priority: 'High'
  },
  {
    id: 'GRV-2026-1040',
    text: 'Illegal encroachment of public pedestrian footpaths by shops',
    details: 'Commercial shops on Station Road have permanently blocked sidewalks with tin sheds and display boards, forcing pedestrians onto busy carriageway.',
    category: 'Civic Services',
    confidence: 0.86,
    date: '2026-09-18',
    status: 'In Progress',
    department: 'Municipal Administration',
    citizenId: 'CIT-2290',
    ward: 'Ward 15 - West Zone',
    priority: 'Medium'
  },
  {
    id: 'GRV-2026-1039',
    text: 'Contaminated tap water with yellowish mud odor',
    details: 'Water running from municipal taps smells strongly of rust and contains muddy sediment. Unsafe for drinking or cooking.',
    category: 'Water Supply',
    confidence: 0.95,
    date: '2026-09-17',
    status: 'Resolved',
    department: 'Water Supply & Sewerage Board',
    citizenId: 'CIT-5022',
    ward: 'Ward 09 - South Zone',
    priority: 'Critical'
  },
  {
    id: 'GRV-2026-1038',
    text: 'Speed breakers unpainted and missing warning signboards',
    details: 'Newly laid asphalt humps on 80ft road lack reflective white stripes or reflector studs, leading to severe spine shocks for drivers.',
    category: 'Infrastructure',
    confidence: 0.89,
    date: '2026-09-16',
    status: 'Resolved',
    department: 'Public Works Department (PWD)',
    citizenId: 'CIT-3419',
    ward: 'Ward 20 - North Zone',
    priority: 'Medium'
  }
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: 'High Confidence Auto-Routing',
    message: 'Complaint GRV-2026-1049 auto-assigned to State Electricity Board (92% confidence)',
    time: '10 mins ago',
    unread: true,
    type: 'classification'
  },
  {
    id: 2,
    title: 'Grievance Backlog Cleared',
    message: 'Ward 28 Sanitation tickets decreased by 18% following resolution drive',
    time: '2 hours ago',
    unread: true,
    type: 'system'
  },
  {
    id: 3,
    title: 'System Alert',
    message: 'NLP Inference pipeline processed 140 tickets today with 94.2% average confidence',
    time: '5 hours ago',
    unread: false,
    type: 'report'
  }
];

export const SAMPLE_COMPLAINTS = [
  "Street light not working in our area",
  "Garbage not collected for a week",
  "Water supply is irregular",
  "Potholes on main road",
  "Need police patrolling at night",
  "Bus route 401 frequency dropped drastically during peak hours",
  "Delay in birth certificate issuance at municipal ward office",
  "High voltage fluctuation damaged domestic appliances"
];
