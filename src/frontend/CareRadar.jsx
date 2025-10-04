import React, { useState, useEffect } from 'react';
import { Search, Mic, Activity, AlertCircle, TrendingUp, Users, Clock, Sparkles, User, Settings, Bell, Save, BookmarkPlus, History } from 'lucide-react';
import PatientDetail from './PatientDetail';
import Analytics from './Analytics';

const CareRadar = () => {
  const [activeMode, setActiveMode] = useState('query');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [metrics, setMetrics] = useState({
    activeAlerts: 0,
    patientsMonitored: 0,
    avgResponseTime: 0
  });
  const [queryResult, setQueryResult] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  
  // User preferences state
  const [preferences, setPreferences] = useState({
    highAlertThreshold: 20,
    mediumAlertThreshold: 10,
    emailNotifications: true,
    smsNotifications: false,
    autoRefresh: true,
    savedQueries: []
  });

  // Track activity
  const addActivity = (type, description) => {
    const activity = {
      id: Date.now(),
      type,
      description,
      timestamp: new Date().toISOString()
    };
    setRecentActivity(prev => [activity, ...prev].slice(0, 10));
  };

  useEffect(() => {
    if (activeMode === 'radar') {
      fetchAlerts();
      if (preferences.autoRefresh) {
        const interval = setInterval(fetchAlerts, 30000);
        return () => clearInterval(interval);
      }
    }
  }, [activeMode, preferences.autoRefresh]);

  const fetchAlerts = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/alerts');
    const data = await response.json();
    
    console.log('Raw alerts data:', data); // Debug log
    
    // Safety check - ensure alerts is an array
    const alertsArray = Array.isArray(data.alerts) ? data.alerts : [];
    setAlerts(alertsArray);
    
    // Update metrics from API response
    if (data.metrics) {
      setMetrics(data.metrics);
    }
    
    addActivity('alert', `Radar scan completed: ${alertsArray.length} alerts found`);
  } catch (error) {
    console.error('Failed to fetch alerts:', error);
    setAlerts([]); // Set empty array on error
  }
};

  const handleQuery = async () => {
    if (!query.trim()) {
      alert('Please enter a question');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: query })
      });
      
      if (!response.ok) {
        throw new Error('Query failed');
      }
      
      const data = await response.json();
      setQueryResult(data);
      addActivity('query', `Searched: "${query}" - ${data.results.length} results`);
      
    } catch (error) {
      console.error('Query failed:', error);
      alert('Failed to query. Make sure backend is running!');
    } finally {
      setIsLoading(false);
    }
  };

  const saveQuery = () => {
    if (query.trim() && !preferences.savedQueries.includes(query)) {
      setPreferences(prev => ({
        ...prev,
        savedQueries: [...prev.savedQueries, query]
      }));
      addActivity('save', `Saved query: "${query}"`);
      alert('Query saved!');
    }
  };

  const handlePatientClick = (patientId) => {
    setSelectedPatient(patientId);
    addActivity('view', `Viewed patient ${patientId}`);
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
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button className="px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-full transition-all">
              Dr. Sarah Chen
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-purple-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-purple-900">Settings & Preferences</h2>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-purple-400 hover:text-purple-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Alert Preferences */}
              <div>
                <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Alert Thresholds
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-purple-600 mb-2 block">
                      High Priority Threshold (cases)
                    </label>
                    <input
                      type="number"
                      value={preferences.highAlertThreshold}
                      onChange={(e) => setPreferences(prev => ({ ...prev, highAlertThreshold: parseInt(e.target.value) }))}
                      className="w-full px-4 py-2 rounded-xl border border-purple-200 focus:outline-none focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-purple-600 mb-2 block">
                      Medium Priority Threshold (cases)
                    </label>
                    <input
                      type="number"
                      value={preferences.mediumAlertThreshold}
                      onChange={(e) => setPreferences(prev => ({ ...prev, mediumAlertThreshold: parseInt(e.target.value) }))}
                      className="w-full px-4 py-2 rounded-xl border border-purple-200 focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>
              </div>

              {/* Notification Preferences */}
              <div>
                <h3 className="text-lg font-semibold text-purple-900 mb-4">Notifications</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications}
                      onChange={(e) => setPreferences(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                      className="w-5 h-5 rounded border-purple-300 text-purple-600 focus:ring-purple-400"
                    />
                    <span className="text-purple-700">Email notifications for high-priority alerts</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.smsNotifications}
                      onChange={(e) => setPreferences(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                      className="w-5 h-5 rounded border-purple-300 text-purple-600 focus:ring-purple-400"
                    />
                    <span className="text-purple-700">SMS notifications for critical alerts</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.autoRefresh}
                      onChange={(e) => setPreferences(prev => ({ ...prev, autoRefresh: e.target.checked }))}
                      className="w-5 h-5 rounded border-purple-300 text-purple-600 focus:ring-purple-400"
                    />
                    <span className="text-purple-700">Auto-refresh radar every 30 seconds</span>
                  </label>
                </div>
              </div>

              {/* Saved Queries */}
              <div>
                <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                  <BookmarkPlus className="w-5 h-5" />
                  Saved Query Templates ({preferences.savedQueries.length})
                </h3>
                {preferences.savedQueries.length > 0 ? (
                  <div className="space-y-2">
                    {preferences.savedQueries.map((q, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                        <span className="text-sm text-purple-700">{q}</span>
                        <button
                          onClick={() => {
                            setQuery(q);
                            setShowSettings(false);
                          }}
                          className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                        >
                          Use
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-purple-400">No saved queries yet. Save queries from the search box.</p>
                )}
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Recent Activity
                </h3>
                {recentActivity.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.type === 'alert' ? 'bg-red-400' :
                          activity.type === 'query' ? 'bg-blue-400' :
                          activity.type === 'view' ? 'bg-green-400' :
                          'bg-purple-400'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm text-purple-700">{activity.description}</p>
                          <p className="text-xs text-purple-400 mt-1">
                            {new Date(activity.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-purple-400">No recent activity</p>
                )}
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

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
                  onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
                  placeholder="Which diabetic patients over 60 haven't had an A1c test in six months?"
                  className="w-full px-6 py-4 rounded-2xl bg-purple-50/50 border border-purple-100 focus:outline-none focus:border-purple-300 text-purple-900 placeholder-purple-300"
                />
              </div>
              <button 
                onClick={saveQuery}
                className="px-6 py-4 bg-purple-100 hover:bg-purple-200 rounded-2xl transition-all"
                title="Save query"
              >
                <BookmarkPlus className="w-5 h-5 text-purple-600" />
              </button>
              <button className="px-6 py-4 bg-purple-100 hover:bg-purple-200 rounded-2xl transition-all">
                <Mic className="w-5 h-5 text-purple-600" />
              </button>
              <button
                onClick={handleQuery}
                disabled={isLoading}
                className="px-8 py-4 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-2xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-purple-400">Try:</span>
              <button 
                onClick={() => setQuery('COPD patients with 2+ ED visits')}
                className="px-3 py-1 text-sm bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-full transition-all"
              >
                COPD patients with 2+ ED visits
              </button>
              <button 
                onClick={() => setQuery('diabetic patients over 60 without A1c test in 6 months')}
                className="px-3 py-1 text-sm bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-full transition-all"
              >
                Overdue diabetic screenings
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-12 shadow-xl border border-purple-100/50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-400 rounded-full animate-spin"></div>
                <p className="text-purple-400">Analyzing patient data with AI...</p>
              </div>
            </div>
          ) : queryResult ? (
            <>
              <div className="bg-gradient-to-br from-purple-400/20 to-pink-400/20 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-purple-200/50 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-900 mb-2">AI Analysis</h3>
                    <p className="text-purple-700 leading-relaxed">{queryResult.narrative}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-purple-100/50 overflow-hidden">
                <div className="p-6 border-b border-purple-100">
                  <h3 className="font-semibold text-purple-900">Patient Results ({queryResult.results.length})</h3>
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
                      {queryResult.results.map((patient, idx) => (
                        <tr 
                          key={idx} 
                          className="border-t border-purple-50 hover:bg-purple-50/30 transition-all cursor-pointer"
                          onClick={() => handlePatientClick(patient.id)}
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

              <details className="mt-6 bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-purple-100/50 overflow-hidden">
                <summary className="px-6 py-4 cursor-pointer text-purple-600 font-medium hover:bg-purple-50/30 transition-all">
                  Show Generated SQL
                </summary>
                <div className="px-6 pb-6">
                  <code className="block p-4 bg-purple-50/50 rounded-xl text-sm text-purple-700 font-mono overflow-x-auto">
                    {queryResult.sql}
                  </code>
                  <p className="text-xs text-purple-400 mt-2">Execution time: {queryResult.executionTime}ms</p>
                </div>
              </details>
            </>
          ) : (
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-12 shadow-xl border border-purple-100/50 text-center">
              <Sparkles className="w-12 h-12 text-purple-300 mx-auto mb-4" />
              <p className="text-purple-600">Enter a clinical question above to start querying</p>
            </div>
          )}
        </div>
      )}

      {/* Radar Mode */}
      {activeMode === 'radar' && (
        <div className="max-w-7xl mx-auto px-6 pb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-purple-900 mb-1">Live Clinical Radar</h2>
              <p className="text-purple-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {preferences.autoRefresh ? 'Auto-refreshing every 30 seconds' : 'Auto-refresh disabled'}
              </p>
            </div>
            <button 
              onClick={fetchAlerts}
              className="px-6 py-3 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-2xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              Scan Now
            </button>
          </div>

          {alerts.length > 0 ? (
            <div className="grid gap-6">
              {alerts.map((alert) => (
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
          ) : (
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-12 shadow-xl border border-purple-100/50 text-center">
              <Activity className="w-12 h-12 text-purple-300 mx-auto mb-4" />
              <p className="text-purple-600">Loading alerts...</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-6 mt-6">
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-purple-100/50">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <h4 className="text-sm font-medium text-purple-600">Active Alerts</h4>
              </div>
              <p className="text-3xl font-bold text-purple-900">{metrics.activeAlerts || alerts.length}</p>
            </div>
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-purple-100/50">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-purple-400" />
                <h4 className="text-sm font-medium text-purple-600">Patients Monitored</h4>
              </div>
              <p className="text-3xl font-bold text-purple-900">{metrics.patientsMonitored.toLocaleString() || '0'}</p>
            </div>
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-purple-100/50">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-5 h-5 text-purple-400" />
                <h4 className="text-sm font-medium text-purple-600">Avg Response Time</h4>
              </div>
              <p className="text-3xl font-bold text-purple-900">{metrics.avgResponseTime || 450}ms</p>
            </div>
          </div>
        </div>
      )}

      {activeMode === 'analytics' && (
        <Analytics />
      )}
    </div>
  );
};

export default CareRadar;