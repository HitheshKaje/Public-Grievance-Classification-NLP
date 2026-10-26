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
    if (path.includes('officer') || hash.includes('officer')) return 'officer';
    return null;
  };

  const isLoginRoute = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return path === '/' || path === '' || path.includes('login') || hash.includes('login');
  };

  const [currentUser, setCurrentUser] = useState(getCurrentUser);
  // Default to showing LoginPage if on root '/', '/login', or when user is not authenticated
  const [isExplicitLogin, setIsExplicitLogin] = useState(() => isLoginRoute() || !getCurrentUser());
  const [currentPortal, setCurrentPortal] = useState(() => {
    const portal = getInitialPortal();
    if (portal) return portal;
    const user = getCurrentUser();
    if (user?.role === 'admin') return 'admin';
    if (user?.role === 'citizen') return 'user';
    if (user?.role === 'officer') return 'officer';
    return 'officer';
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

  // Enforce LoginPage when starting at root '/' or unauthenticated
  useEffect(() => {
    const path = window.location.pathname.toLowerCase();
    if (path === '/' || path === '' || !currentUser) {
      window.history.replaceState({}, '', '/login');
      setIsExplicitLogin(true);
    }
  }, [currentUser]);

  // Listen for browser forward/back buttons
  useEffect(() => {
    const handlePopState = () => {
      const loginRoute = isLoginRoute();
      setIsExplicitLogin(loginRoute || !getCurrentUser());
      const portal = getInitialPortal();
      if (portal) {
        setCurrentPortal(portal);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // If not authenticated or on /login or root route, render LoginPage
  if (!currentUser || isExplicitLogin) {
    return (
      <LoginPage
        initialPortal={currentPortal || 'officer'}
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
  const officerDepartment = currentUser?.department || "General Administration";

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
        currentUser={currentUser}
      />
    </OfficerLayout>
  );
}
