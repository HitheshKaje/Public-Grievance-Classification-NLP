import React, { useState } from 'react';
import UserLayout from './layouts/UserLayout';
import UserDashboard from './pages/UserDashboard';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  // 'user' (Citizen Dashboard) or 'admin' (Admin Dashboard)
  const [currentPortal, setCurrentPortal] = useState('user');
  const [userTab, setUserTab] = useState('dashboard');
  const [adminTab, setAdminTab] = useState('overview');

  const togglePortal = () => {
    setCurrentPortal(prev => (prev === 'user' ? 'admin' : 'user'));
  };

  if (currentPortal === 'admin') {
    return (
      <AdminLayout
        activeTab={adminTab}
        onSelectTab={setAdminTab}
        onSwitchRole={togglePortal}
      >
        <AdminDashboard activeTab={adminTab} />
      </AdminLayout>
    );
  }

  return (
    <UserLayout
      activeTab={userTab}
      onSelectTab={setUserTab}
      onSwitchRole={togglePortal}
    >
      <UserDashboard
        activeTab={userTab}
        onNavigateTab={setUserTab}
      />
    </UserLayout>
  );
}
