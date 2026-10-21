import React, { useState, useEffect } from 'react';
import OfficerLayout from './layouts/OfficerLayout';
import OfficerDashboard from './pages/OfficerDashboard';
import UserLayout from './layouts/UserLayout';
import UserDashboard from './pages/UserDashboard';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  // Determine initial portal based on URL path or hash
  const getInitialPortal = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path.includes('admin') || hash.includes('admin')) return 'admin';
    if (path.includes('citizen') || path.includes('user') || hash.includes('citizen') || hash.includes('user')) return 'user';
    return 'officer'; // default
  };

  const [currentPortal, setCurrentPortal] = useState(getInitialPortal);
  const [officerTab, setOfficerTab] = useState('dashboard');
  const [userTab, setUserTab] = useState('dashboard');
  const [adminTab, setAdminTab] = useState('overview');

  // Sync portal changes with browser history and URL
  const handleSelectPortal = (portalId) => {
    setCurrentPortal(portalId);
    const targetPath = portalId === 'officer' ? '/officer' : portalId === 'user' ? '/citizen' : '/admin';
    window.history.pushState({}, '', targetPath);
  };

  // Listen for browser forward/back buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPortal(getInitialPortal());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 1. Admin Portal
  if (currentPortal === 'admin') {
    return (
      <AdminLayout
        activeTab={adminTab}
        onSelectTab={setAdminTab}
        onSelectPortal={handleSelectPortal}
        currentPortal={currentPortal}
      >
        <AdminDashboard activeTab={adminTab} />
      </AdminLayout>
    );
  }

  // 2. Citizen / User Portal
  if (currentPortal === 'user') {
    return (
      <UserLayout
        activeTab={userTab}
        onSelectTab={setUserTab}
        onSelectPortal={handleSelectPortal}
        currentPortal={currentPortal}
      >
        <UserDashboard
          activeTab={userTab}
          onNavigateTab={setUserTab}
        />
      </UserLayout>
    );
  }

  // 3. Officer Portal (Default)
  return (
    <OfficerLayout
      activeTab={officerTab}
      onSelectTab={setOfficerTab}
      onSelectPortal={handleSelectPortal}
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
