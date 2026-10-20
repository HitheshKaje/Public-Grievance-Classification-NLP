import React, { useState } from 'react';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <AdminLayout activeTab={activeTab} onSelectTab={setActiveTab}>
      <AdminDashboard activeTab={activeTab} />
    </AdminLayout>
  );
}
