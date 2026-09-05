import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import CausalAnalysis from './pages/CausalAnalysis';
import CustomerAnalysis from './pages/CustomerAnalysis';
import DataUploadPage from './pages/DataUploadPage';
import Optimization from './pages/Optimization';
import Prescription from './pages/Prescription';
import Reports from './pages/Reports';
import Monitoring from './pages/Monitoring';
import Settings from './pages/Settings';
import { checkHealth } from './services/api';

function App() {
  const [apiConnected, setApiConnected] = useState(true);

  useEffect(() => {
    async function verifyConnection() {
      try {
        const res = await checkHealth();
        setApiConnected(res.status === 'ok');
      } catch (e) {
        setApiConnected(false);
      }
    }
    
    verifyConnection();
    
    // Check connection health every 15 seconds
    const interval = setInterval(verifyConnection, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Header apiConnected={apiConnected} />
          <div className="page-container">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/upload" element={<DataUploadPage />} />
              <Route path="/causal-analysis" element={<CausalAnalysis />} />
              <Route path="/customers" element={<CustomerAnalysis />} />
              <Route path="/prescription" element={<Prescription />} />
              <Route path="/optimization" element={<Optimization />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/monitoring" element={<Monitoring />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
