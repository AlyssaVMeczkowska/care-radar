import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, Activity, AlertCircle, Calendar, Download, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

const Analytics = () => {
  const [dateRange, setDateRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/analytics');
      const data = await response.json();
      console.log('Analytics data received:', data);
      console.log('volumeData:', data.volumeData);
      console.log('conditionsData:', data.conditionsData);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ['#a78bfa', '#ec4899', '#f472b6', '#c084fc', '#e879f9'];
  const PIE_COLORS = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa'];

  if (isLoading || !analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-400 rounded-full animate-spin"></div>
          <p className="text-purple-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Patients',
      value: analyticsData.totalPatients.toLocaleString(),
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'from-purple-400 to-pink-400'
    },
    {
      title: 'Total Encounters',
      value: analyticsData.volumeData.reduce((sum, week) => sum + week.encounters, 0).toLocaleString(),
      change: '+8.3%',
      trend: 'up',
      icon: Activity,
      color: 'from-red-400 to-pink-400'
    },
    {
      title: 'Conditions Tracked',
      value: analyticsData.conditionsData.length.toString(),
      change: '+5.2%',
      trend: 'up',
      icon: AlertCircle,
      color: 'from-green-400 to-emerald-400'
    },
    {
      title: 'Encounter Types',
      value: analyticsData.encounterTypesData.length.toString(),
      change: '+2.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-blue-400 to-cyan-400'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-12">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-md border-b border-purple-100/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-purple-900 mb-2">Analytics Dashboard</h1>
              <p className="text-purple-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Real-time clinical insights and trends
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 bg-white border border-purple-200 rounded-xl text-purple-700 focus:outline-none focus:border-purple-400"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button 
                onClick={fetchAnalytics}
                className="px-4 py-2 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-purple-100/50">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {stat.change}
                </span>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-900 mb-1">{stat.value}</div>
                <div className="text-sm text-purple-600">{stat.title}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Patient Volume Over Time */}
          <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-purple-100/50">
            <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Patient Volume Trends
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.volumeData}>
                <defs>
                  <linearGradient id="colorEncounters" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAdmissions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" />
                <XAxis dataKey="date" stroke="#c084fc" />
                <YAxis stroke="#c084fc" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    border: '1px solid #e9d5ff',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)'
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="encounters" stroke="#a78bfa" fillOpacity={1} fill="url(#colorEncounters)" name="Encounters" />
                <Area type="monotone" dataKey="admissions" stroke="#ec4899" fillOpacity={1} fill="url(#colorAdmissions)" name="Admissions" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Encounter Types Distribution */}
          <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-purple-100/50">
            <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-purple-400" />
              Encounter Types Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.encounterTypesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.encounterTypesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    border: '1px solid #e9d5ff',
                    borderRadius: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Top Conditions */}
          <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-purple-100/50">
            <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Top Conditions by Patient Count
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.conditionsData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" />
                <XAxis type="number" stroke="#c084fc" />
                <YAxis dataKey="condition" type="category" width={120} stroke="#c084fc" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    border: '1px solid #e9d5ff',
                    borderRadius: '12px'
                  }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {analyticsData.conditionsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chief Complaints */}
          <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-purple-100/50">
            <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              Top Chief Complaints
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.complaintsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" />
                <XAxis dataKey="complaint" stroke="#c084fc" angle={-45} textAnchor="end" height={120} />
                <YAxis stroke="#c084fc" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    border: '1px solid #e9d5ff',
                    borderRadius: '12px'
                  }}
                />
                <Bar dataKey="count" fill="#a78bfa" radius={[8, 8, 0, 0]} name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conditions Table */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-purple-100/50 overflow-hidden">
          <div className="p-6 border-b border-purple-100">
            <h3 className="text-lg font-semibold text-purple-900">Top Conditions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-purple-600">Condition</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-purple-600">Patient Count</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-purple-600">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.conditionsData.map((condition, idx) => (
                  <tr key={idx} className="border-t border-purple-50 hover:bg-purple-50/30 transition-all">
                    <td className="px-6 py-4 text-purple-900 font-medium">{condition.condition}</td>
                    <td className="px-6 py-4 text-purple-700">{condition.count}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-purple-100 rounded-full h-2">
                          <div 
                            className="bg-purple-400 h-2 rounded-full" 
                            style={{ width: `${(condition.count / analyticsData.totalPatients * 100)}%` }}
                          />
                        </div>
                        <span className="text-sm text-purple-600 min-w-[50px]">
                          {((condition.count / analyticsData.totalPatients) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;