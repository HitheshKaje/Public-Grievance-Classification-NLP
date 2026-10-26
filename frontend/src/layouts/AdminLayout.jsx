import React, { useState } from 'react';
import Sidebar, { SIDEBAR_ITEMS } from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

export default function AdminLayout({ children, activeTab, onSelectTab, onSelectPortal, currentPortal = 'admin', currentUser, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeItem = SIDEBAR_ITEMS.find(item => item.id === activeTab);
  const activeTitle = activeItem ? activeItem.label : "Overview";

  return (
    <div className="min-h-screen bg-[#f3f6fa] flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          onOpenSidebar={() => setSidebarOpen(true)}
          activeTabTitle={activeTitle}
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
