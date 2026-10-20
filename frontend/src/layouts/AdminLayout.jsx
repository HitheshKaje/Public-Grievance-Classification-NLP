import React, { useState } from 'react';
import Sidebar, { SIDEBAR_ITEMS } from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

export default function AdminLayout({ children, activeTab, onSelectTab }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeItem = SIDEBAR_ITEMS.find(item => item.id === activeTab);
  const activeTitle = activeItem ? activeItem.label : "Overview";

  return (
    <div className="min-h-screen bg-slate-50 flex">
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
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
