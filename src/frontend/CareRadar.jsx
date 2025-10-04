import React, { useState } from 'react';
import { Search, Mic, Activity, AlertCircle, TrendingUp, Users, Clock, Sparkles } from 'lucide-react';
import PatientDetail from './PatientDetail'; // ADD THIS LINE AT TOP
import Analytics from './Analytics';
import { useEffect } from 'react';

const CareRadar = () => {
  
  const [activeMode, setActiveMode] = useState('query');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null); // ADD THIS LINE
    const mockAlerts = [
    {
      id: 1,
      severity: 'high',
      emoji: '🔴',
      title: 'Chest Pain Encounters Increased',
      metric: '24 cases this week vs 15 baseline',
      change: '+60%',
      action: 'Review triage protocols',
      timestamp: '2 min ago'
    },
    {
      id: 2,
      severity: 'medium',
      emoji: '🟡',
      title: 'COPD Patients Clustering',
      metric: '18 uncontrolled cases in North wing',
      change: '+35%',
      action: 'Schedule respiratory review',
      timestamp: '15 min ago'
    },
    {
      id: 3,
      severity: 'low',
      emoji: '🟢',
      title: 'Hypertensive Crisis Events',
      metric: '5 cases this week vs 7 baseline',
      change: '-28%',
      action: 'Continue monitoring',
      timestamp: '1 hour ago'
    }
  ];
    const [alerts, setAlerts] = useState(mockAlerts);
    

useEffect(() => {
  if (activeMode === 'radar') {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }
}, [activeMode]);

const fetchAlerts = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/alerts');
    const data = await response.json();
    setAlerts(data.alerts);
  } catch (error) {
    console.error('Failed to fetch alerts:', error);
  }
};

  // Mock data
  const mockQueryResult = {
    sql: "SELECT patient_id, age, last_a1c_date FROM patients WHERE 'diabetes' IN conditions AND age > 60 AND last_a1c_date < now() - INTERVAL 6 MONTH",
    results: [
      { id: 'P2847', name: 'Patient 2847', age: 67, lastTest: '2024-12-15', overdue: '9 months' },
      { id: 'P1923', name: 'Patient 1923', age: 72, lastTest: '2024-11-20', overdue: '10 months' },
      { id: 'P4521', name: 'Patient 4521', age: 64, lastTest: '2025-01-10', overdue: '8 months' },
    ],
    narrative: "12 patients match your criteria. 8 are overdue by more than 9 months, representing a significant care gap that requires immediate attention."
  };


  // Replace handleQuery function
const handleQuery = async () => {
  setIsLoading(true);
  
  try {
    const response = await fetch('http://localhost:8000/api/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question: query })
    });
    
    const data = await response.json();
    setQueryResult(data);  // Add this state: const [queryResult, setQueryResult] = useState(null);
    
  } catch (error) {
    console.error('Query failed:', error);
    alert('Failed to query. Make sure backend is running!');
  } finally {
    setIsLoading(false);
  }
};

  if (selectedPatient) {
    return (
      <PatientDetail 
        patientId={selectedPatient}
        onBack={() => setSelectedPatient(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-purple-100/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                CareRadar
              </h1>
              <p className="text-xs text-purple-400">Clinical AI Command Center</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-full transition-all">
              Dr. Sarah Chen
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full"></div>
          </div>
        </div>
      </header>

      {/* Mode Toggle */}
<div className="max-w-7xl mx-auto px-6 py-6">
  <div className="inline-flex bg-white/70 backdrop-blur-md rounded-2xl p-1.5 shadow-lg border border-purple-100/50">
    <button
      onClick={() => setActiveMode('query')}
      className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
        activeMode === 'query'
          ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-md'
          : 'text-purple-400 hover:text-purple-600'
      }`}
    >
      <Search className="w-4 h-4" />
      Query Mode
    </button>
    <button
      onClick={() => setActiveMode('radar')}
      className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
        activeMode === 'radar'
          ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-md'
          : 'text-purple-400 hover:text-purple-600'
      }`}
    >
      <Activity className="w-4 h-4" />
      Radar Mode
    </button>
    <button
      onClick={() => setActiveMode('analytics')}
      className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
        activeMode === 'analytics'
          ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-md'
          : 'text-purple-400 hover:text-purple-600'
      }`}
    >
      <TrendingUp className="w-4 h-4" />
      Analytics
    </button>
  </div>
</div>

      {/* Query Mode */}
      {activeMode === 'query' && (
        <div className="max-w-7xl mx-auto px-6 pb-12">
          {/* Search Input */}
          <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-purple-100/50 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-purple-900">Ask a clinical question</h2>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Which diabetic patients over 60 haven't had an A1c test in six months?"
                  className="w-full px-6 py-4 rounded-2xl bg-purple-50/50 border border-purple-100 focus:outline-none focus:border-purple-300 text-purple-900 placeholder-purple-300"
                />
              </div>
              <button className="px-6 py-4 bg-purple-100 hover:bg-purple-200 rounded-2xl transition-all">
                <Mic className="w-5 h-5 text-purple-600" />
              </button>
              <button
                onClick={handleQuery}
                className="px-8 py-4 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-2xl font-medium hover:shadow-lg transition-all"
              >
                Search
              </button>
            </div>

            {/* Example Queries */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-purple-400">Try:</span>
              <button className="px-3 py-1 text-sm bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-full transition-all">
                COPD patients with 2+ ED visits
              </button>
              <button className="px-3 py-1 text-sm bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-full transition-all">
                Overdue diabetic screenings
              </button>
            </div>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-12 shadow-xl border border-purple-100/50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-400 rounded-full animate-spin"></div>
                <p className="text-purple-400">Analyzing patient data...</p>
              </div>
            </div>
          ) : (
            <>
              {/* AI Narrative */}
              <div className="bg-gradient-to-br from-purple-400/20 to-pink-400/20 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-purple-200/50 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-900 mb-2">AI Analysis</h3>
                    <p className="text-purple-700 leading-relaxed">{mockQueryResult.narrative}</p>
                  </div>
                </div>
              </div>

              {/* Results Table */}
              <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-purple-100/50 overflow-hidden">
                <div className="p-6 border-b border-purple-100">
                  <h3 className="font-semibold text-purple-900">Patient Results (12)</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-purple-50/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-purple-600">Patient ID</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-purple-600">Age</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-purple-600">Last A1c Test</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-purple-600">Overdue By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockQueryResult.results.map((patient, idx) => (
                        <tr 
                          key={idx} 
                          className="border-t border-purple-50 hover:bg-purple-50/30 transition-all cursor-pointer"
                          onClick={() => setSelectedPatient(patient.id)}
                        >
                          <td className="px-6 py-4 text-purple-900 font-medium">{patient.id}</td>
                          <td className="px-6 py-4 text-purple-700">{patient.age}</td>
                          <td className="px-6 py-4 text-purple-700">{patient.lastTest}</td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                              {patient.overdue}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SQL Display */}
              <details className="mt-6 bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-purple-100/50 overflow-hidden">
                <summary className="px-6 py-4 cursor-pointer text-purple-600 font-medium hover:bg-purple-50/30 transition-all">
                  Show Generated SQL
                </summary>
                <div className="px-6 pb-6">
                  <code className="block p-4 bg-purple-50/50 rounded-xl text-sm text-purple-700 font-mono overflow-x-auto">
                    {mockQueryResult.sql}
                  </code>
                </div>
              </details>
            </>
          )}
        </div>
      )}

      {/* Radar Mode */}
      {activeMode === 'radar' && (
        <div className="max-w-7xl mx-auto px-6 pb-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-purple-900 mb-1">Live Clinical Radar</h2>
              <p className="text-purple-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Last scan: 2 minutes ago
              </p>
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-2xl font-medium hover:shadow-lg transition-all flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Scan Now
            </button>
          </div>

          {/* Alert Cards */}
          <div className="grid gap-6">
            {mockAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border-l-4 ${
                  alert.severity === 'high'
                    ? 'border-red-400'
                    : alert.severity === 'medium'
                    ? 'border-yellow-400'
                    : 'border-green-400'
                } hover:shadow-2xl transition-all`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-3xl">{alert.emoji}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-purple-900">{alert.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          alert.severity === 'high'
                            ? 'bg-red-100 text-red-600'
                            : alert.severity === 'medium'
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-green-100 text-green-600'
                        }`}>
                          {alert.change}
                        </span>
                      </div>
                      <p className="text-purple-700 mb-3">{alert.metric}</p>
                      <div className="flex items-center gap-4">
                        <button className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl text-sm font-medium transition-all">
                          {alert.action}
                        </button>
                        <span className="text-sm text-purple-400">{alert.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  <button className="text-purple-400 hover:text-purple-600 transition-all">
                    <AlertCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-6 mt-6">
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-purple-100/50">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <h4 className="text-sm font-medium text-purple-600">Active Alerts</h4>
              </div>
              <p className="text-3xl font-bold text-purple-900">24</p>
            </div>
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-purple-100/50">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-purple-400" />
                <h4 className="text-sm font-medium text-purple-600">Patients Monitored</h4>
              </div>
              <p className="text-3xl font-bold text-purple-900">1,847</p>
            </div>
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-purple-100/50">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-5 h-5 text-purple-400" />
                <h4 className="text-sm font-medium text-purple-600">Avg Response Time</h4>
              </div>
              <p className="text-3xl font-bold text-purple-900">450ms</p>
            </div>
          </div>
        </div>
      )}
      {/* Analytics Mode - ADD THIS */}
      {activeMode === 'analytics' && (
        <Analytics />
      )}

    </div>
  );

};



export default CareRadar;