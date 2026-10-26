import React, { useState } from 'react';
import OfficerSidebar from '../components/officer/OfficerSidebar';
import OfficerHeader from '../components/officer/OfficerHeader';

export default function OfficerLayout({ children, activeTab, onSelectTab, onSelectPortal, currentPortal = 'officer', departmentName, currentUser, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f3f6fa] flex">
      {/* Officer Sidebar Navigation */}
      <OfficerSidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <OfficerHeader
          onOpenSidebar={() => setSidebarOpen(true)}
          onSelectPortal={onSelectPortal}
          currentPortal={currentPortal}
          departmentName={departmentName}
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
