import React, { useState, useEffect } from 'react';
import OfficerLayout from './layouts/OfficerLayout';
import OfficerDashboard from './pages/OfficerDashboard';
import UserLayout from './layouts/UserLayout';
import UserDashboard from './pages/UserDashboard';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
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
    return path.includes('login') || hash.includes('login');
  };

  const [currentUser, setCurrentUser] = useState(getCurrentUser);
  const [showLogin, setShowLogin] = useState(() => isLoginRoute());
  const [loginRegister, setLoginRegister] = useState(false);
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

  // Handle navigation from Landing Page to Login
  const handleNavigateToLogin = (role = 'officer', isRegister = false) => {
    const targetPortal = role === 'citizen' ? 'user' : role;
    setCurrentPortal(targetPortal);
    setLoginRegister(isRegister);
    setShowLogin(true);
    window.history.pushState({}, '', '/login');
  };

  // Return to landing page
  const handleBackToLanding = () => {
    setShowLogin(false);
    window.history.pushState({}, '', '/');
  };

  // Handle successful login
  const handleLoginSuccess = (user, role) => {
    setShowLogin(false);
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
    setShowLogin(false);
    window.history.pushState({}, '', '/');
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
      const loginRoute = isLoginRoute();
      setShowLogin(loginRoute);
      const portal = getInitialPortal();
      if (portal) {
        setCurrentPortal(portal);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 1. Unauthenticated: Show Landing Page by default, or LoginPage if login requested
  if (!currentUser) {
    if (showLogin) {
      return (
        <LoginPage
          initialPortal={currentPortal === 'user' ? 'citizen' : currentPortal || 'officer'}
          initialRegister={loginRegister}
          onLoginSuccess={handleLoginSuccess}
          onBackToHome={handleBackToLanding}
        />
      );
    }

    return (
      <LandingPage 
        onNavigateToLogin={handleNavigateToLogin}
      />
    );
  }

  // 2. If authenticated user explicitly opens /login
  if (showLogin) {
    return (
      <LoginPage
        initialPortal={currentPortal === 'user' ? 'citizen' : currentPortal || 'officer'}
        initialRegister={loginRegister}
        onLoginSuccess={handleLoginSuccess}
        onBackToHome={() => setShowLogin(false)}
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
