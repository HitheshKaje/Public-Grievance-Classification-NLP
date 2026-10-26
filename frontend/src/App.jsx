import React, { useState, useEffect } from 'react';
import OfficerLayout from './layouts/OfficerLayout';
import OfficerDashboard from './pages/OfficerDashboard';
import UserLayout from './layouts/UserLayout';
import UserDashboard from './pages/UserDashboard';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import { getCurrentUser, logout } from './services/authService';

export default function App() {
  // Determine initial portal based on URL path or hash
  const getInitialPortal = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path.includes('admin') || hash.includes('admin')) return 'admin';
    if (path.includes('citizen') || path.includes('user') || hash.includes('citizen') || hash.includes('user')) return 'user';
    return 'officer'; // default
  };

  const isLoginRoute = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return path.includes('login') || hash.includes('login');
  };

  const [isExplicitLogin, setIsExplicitLogin] = useState(isLoginRoute);
  const [currentUser, setCurrentUser] = useState(getCurrentUser);
  const [currentPortal, setCurrentPortal] = useState(() => {
    if (currentUser?.role === 'admin') return 'admin';
    if (currentUser?.role === 'citizen') return 'user';
    if (currentUser?.role === 'officer') return 'officer';
    return getInitialPortal();
  });

  const [officerTab, setOfficerTab] = useState('dashboard');
  const [userTab, setUserTab] = useState('dashboard');
  const [adminTab, setAdminTab] = useState('overview');

  // Handle successful login
  const handleLoginSuccess = (user, role) => {
    setIsExplicitLogin(false);
    setCurrentUser(user);
    const targetRole = role || user?.role;
    let targetPortal = 'officer';
    let targetPath = '/officer';

    if (targetRole === 'admin') {
      targetPortal = 'admin';
      targetPath = '/admin';
    } else if (targetRole === 'citizen' || targetRole === 'user') {
      targetPortal = 'user';
      targetPath = '/citizen';
    }

    setCurrentPortal(targetPortal);
    window.history.pushState({}, '', targetPath);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setIsExplicitLogin(true);
    window.history.pushState({}, '', '/login');
  };

  // Sync portal changes with browser history and URL
  const handleSelectPortal = (portalId) => {
    setCurrentPortal(portalId);
    const targetPath = portalId === 'officer' ? '/officer' : portalId === 'user' ? '/citizen' : '/admin';
    window.history.pushState({}, '', targetPath);
  };

  // Listen for browser forward/back buttons
  useEffect(() => {
    const handlePopState = () => {
      setIsExplicitLogin(isLoginRoute());
      setCurrentPortal(getInitialPortal());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // If not authenticated or on /login route, render LoginPage
  if (!currentUser || isExplicitLogin) {
    return (
      <LoginPage
        initialPortal={currentPortal}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // 1. Admin Portal
  if (currentPortal === 'admin') {
    return (
      <AdminLayout
        activeTab={adminTab}
        onSelectTab={setAdminTab}
        onSelectPortal={handleSelectPortal}
        currentPortal={currentPortal}
        currentUser={currentUser}
        onLogout={handleLogout}
      >
        <AdminDashboard 
          activeTab={adminTab} 
          onNavigateTab={setAdminTab}
          onSelectPortal={handleSelectPortal}
        />
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
        currentUser={currentUser}
        onLogout={handleLogout}
      >
        <UserDashboard
          activeTab={userTab}
          onNavigateTab={setUserTab}
          currentUser={currentUser}
        />
      </UserLayout>
    );
  }

  // 3. Officer Portal (Default)
  const officerDepartment = currentUser?.department || "Water Supply Department";

  return (
    <OfficerLayout
      activeTab={officerTab}
      onSelectTab={setOfficerTab}
      onSelectPortal={handleSelectPortal}
      currentPortal={currentPortal}
      departmentName={officerDepartment}
      currentUser={currentUser}
      onLogout={handleLogout}
    >
      <OfficerDashboard
        activeTab={officerTab}
        onNavigateTab={setOfficerTab}
        departmentName={officerDepartment}
      />
    </OfficerLayout>
  );
}
