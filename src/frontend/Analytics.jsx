import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Users, Activity, AlertCircle, Calendar, Download, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

const Analytics = () => {
  const [dateRange, setDateRange] = useState('30d');

  // Mock data for patient volume over time
  const volumeData = [
    { date: 'Week 1', encounters: 145, admissions: 23 },
    { date: 'Week 2', encounters: 168, admissions: 28 },
    { date: 'Week 3', encounters: 192, admissions: 31 },
    { date: 'Week 4', encounters: 178, admissions: 26 },
    { date: 'Week 5', encounters: 210, admissions: 35 },
    { date: 'Week 6', encounters: 225, admissions: 38 },
    { date: 'Week 7', encounters: 198, admissions: 29 },
    { date: 'Week 8', encounters: 234, admissions: 42 }
  ];

  // Mock data for conditions
  const conditionsData = [
    { condition: 'Diabetes', count: 342, change: +12 },
    { condition: 'Hypertension', count: 428, change: +8 },
    { condition: 'COPD', count: 186, change: +24 },
    { condition: 'Heart Disease', count: 251, change: -5 },
    { condition: 'Asthma', count: 167, change: +15 }
  ];

  // Mock data for alert severity
  const alertSeverityData = [
    { name: 'High', value: 24, color: '#f87171' },
    { name: 'Medium', value: 45, color: '#fbbf24' },
    { name: 'Low', value: 31, color: '#34d399' }
  ];

  // Mock data for department metrics
  const departmentData = [
    { dept: 'Cardiology', patients: 234, avgWait: 18 },
    { dept: 'Primary Care', patients: 567, avgWait: 12 },
    { dept: 'Emergency', patients: 189, avgWait: 45 },
    { dept: 'Endocrinology', patients: 178, avgWait: 22 },
    { dept: 'Pulmonary', patients: 145, avgWait: 15 }
  ];

  // Mock summary stats
  const stats = [
    {
      title: 'Total Patients',
      value: '1,847',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'from-purple-400 to-pink-400'
    },
    {
      title: 'Active Alerts',
      value: '24',
      change: '+8.3%',
      trend: 'up',
      icon: AlertCircle,
      color: 'from-red-400 to-pink-400'
    },
    {
      title: 'Avg Response Time',
      value: '450ms',
      change: '-15.2%',
      trend: 'down',
      icon: Activity,
      color: 'from-green-400 to-emerald-400'
    },
    {
      title: 'Care Gaps Closed',
      value: '127',
      change: '+23.4%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-blue-400 to-cyan-400'
    }
  ];

  const COLORS = ['#a78bfa', '#ec4899', '#f472b6', '#c084fc', '#e879f9'];

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
              <button className="px-4 py-2 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
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
              <AreaChart data={volumeData}>
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

          {/* Alert Severity Distribution */}
          <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-purple-100/50">
            <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-purple-400" />
              Alert Severity Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={alertSeverityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {alertSeverityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
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
              Top Conditions by Encounter
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={conditionsData} layout="horizontal">
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
                  {conditionsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Department Metrics */}
          <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-purple-100/50">
            <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              Department Performance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" />
                <XAxis dataKey="dept" stroke="#c084fc" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#c084fc" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    border: '1px solid #e9d5ff',
                    borderRadius: '12px'
                  }}
                />
                <Legend />
                <Bar dataKey="patients" fill="#a78bfa" radius={[8, 8, 0, 0]} name="Patient Count" />
                <Bar dataKey="avgWait" fill="#ec4899" radius={[8, 8, 0, 0]} name="Avg Wait (min)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conditions Table */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-purple-100/50 overflow-hidden">
          <div className="p-6 border-b border-purple-100">
            <h3 className="text-lg font-semibold text-purple-900">Trending Conditions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-purple-600">Condition</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-purple-600">Patient Count</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-purple-600">Change (30d)</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-purple-600">Trend</th>
                </tr>
              </thead>
              <tbody>
                {conditionsData.map((condition, idx) => (
                  <tr key={idx} className="border-t border-purple-50 hover:bg-purple-50/30 transition-all">
                    <td className="px-6 py-4 text-purple-900 font-medium">{condition.condition}</td>
                    <td className="px-6 py-4 text-purple-700">{condition.count}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        condition.change > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {condition.change > 0 ? '+' : ''}{condition.change}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {condition.change > 0 ? (
                        <TrendingUp className="w-5 h-5 text-red-500" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-green-500" />
                      )}
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