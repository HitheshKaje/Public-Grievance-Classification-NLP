import React, { useState } from 'react';
import UserSidebar from '../components/user/UserSidebar';
import UserHeader from '../components/user/UserHeader';

export default function UserLayout({ children, activeTab, onSelectTab, onSelectPortal, currentPortal = 'user', currentUser, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f3f6fa] flex">
      {/* Citizen Sidebar Navigation */}
      <UserSidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <UserHeader
          onOpenSidebar={() => setSidebarOpen(true)}
          onSelectPortal={onSelectPortal}
          currentPortal={currentPortal}
          currentUser={currentUser}
          onLogout={onLogout}
        />

        <main className="flex-1 px-6 pb-8 pt-2 max-w-[1600px] w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
