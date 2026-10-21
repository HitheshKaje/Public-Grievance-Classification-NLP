import React, { useState } from 'react';
import OfficerLayout from './layouts/OfficerLayout';
import OfficerDashboard from './pages/OfficerDashboard';
import UserLayout from './layouts/UserLayout';
import UserDashboard from './pages/UserDashboard';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  // 'officer' (Department Officer), 'user' (Citizen), or 'admin' (Admin)
  const [currentPortal, setCurrentPortal] = useState('officer');
  const [officerTab, setOfficerTab] = useState('dashboard');
  const [userTab, setUserTab] = useState('dashboard');
  const [adminTab, setAdminTab] = useState('overview');

  if (currentPortal === 'admin') {
    return (
      <AdminLayout
        activeTab={adminTab}
        onSelectTab={setAdminTab}
        onSelectPortal={setCurrentPortal}
        currentPortal={currentPortal}
      >
        <AdminDashboard activeTab={adminTab} />
      </AdminLayout>
    );
  }

  if (currentPortal === 'user') {
    return (
      <UserLayout
        activeTab={userTab}
        onSelectTab={setUserTab}
        onSelectPortal={setCurrentPortal}
        currentPortal={currentPortal}
      >
        <UserDashboard
          activeTab={userTab}
          onNavigateTab={setUserTab}
        />
      </UserLayout>
    );
  }

  // Default: Officer Dashboard
  return (
    <OfficerLayout
      activeTab={officerTab}
      onSelectTab={setOfficerTab}
      onSelectPortal={setCurrentPortal}
      currentPortal={currentPortal}
      departmentName="Water Supply Department"
    >
      <OfficerDashboard
        activeTab={officerTab}
        onNavigateTab={setOfficerTab}
        departmentName="Water Supply Department"
      />
    </OfficerLayout>
  );
}
