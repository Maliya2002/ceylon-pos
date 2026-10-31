import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PosTerminal from './components/PosTerminal';
import KitchenDisplay from './components/KitchenDisplay';
import TablesManager from './components/TablesManager';
import MenuManager from './components/MenuManager';
import ReportsDashboard from './components/ReportsDashboard';
import { api } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('pos'); // pos, kds, tables, menu, reports
  const [tables, setTables] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [targetTableForPos, setTargetTableForPos] = useState(null);
  const [targetExistingOrderForPos, setTargetExistingOrderForPos] = useState(null);
  const [language, setLanguage] = useState('en'); // 'en' or 'si'

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    let user = api.getCurrentUser();
    if (!user) {
      try {
        const loginRes = await api.login('cashier', 'cashier123');
        user = loginRes.user;
      } catch (err) {
        console.warn('Auto-login cashier error:', err);
      }
    }
    setCurrentUser(user);
    loadTables();
  };

  const loadTables = async () => {
    try {
      const data = await api.getTables();
      setTables(data);
    } catch (err) {
      console.error('Failed to load tables:', err);
    }
  };

  const handleSwitchUser = async (username) => {
    try {
      const password = `${username}123`;
      const res = await api.login(username, password);
      setCurrentUser(res.user);
      if (res.user.role === 'KITCHEN') {
        setActiveTab('kds');
      }
    } catch (err) {
      alert('Failed to switch user persona: ' + err.message);
    }
  };

  const handleSelectTableForNewOrder = (tableId, existingOrder = null) => {
    setTargetTableForPos(tableId);
    setTargetExistingOrderForPos(existingOrder);
    setActiveTab('pos');
  };

  const handleClearTargetTable = () => {
    setTargetTableForPos(null);
    setTargetExistingOrderForPos(null);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-900 font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        language={language}
        setLanguage={setLanguage}
      />

      {/* Screen Views */}
      <main className="flex-1 flex overflow-hidden">
        {activeTab === 'pos' && (
          <PosTerminal
            tables={tables}
            onRefreshTables={loadTables}
            initialTableId={targetTableForPos}
            existingOrder={targetExistingOrderForPos}
            onClearTargetTable={handleClearTargetTable}
          />
        )}

        {activeTab === 'kds' && (
          <KitchenDisplay />
        )}

        {activeTab === 'tables' && (
          <TablesManager
            tables={tables}
            onRefreshTables={loadTables}
            onSelectTableForNewOrder={handleSelectTableForNewOrder}
          />
        )}

        {activeTab === 'menu' && (
          <MenuManager />
        )}

        {activeTab === 'reports' && (
          <ReportsDashboard />
        )}
      </main>
    </div>
  );
}
