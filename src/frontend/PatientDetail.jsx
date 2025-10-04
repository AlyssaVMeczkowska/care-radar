import React from 'react';
import { ArrowLeft, AlertTriangle, Calendar, Activity, TrendingUp, FileText, Clock, Phone, Mail, MapPin } from 'lucide-react';

const PatientDetail = ({ patientId, onBack }) => {

    
  // Mock patient data - replace with actual API call using patientId
  const patient = {
    id: patientId || 'P2847',
    name: 'Sarah Martinez',
    age: 67,
    mrn: 'MRN-284756',
    gender: 'Female',
    dob: '1958-03-15',
    phone: '(555) 123-4567',
    email: 'sarah.martinez@email.com',
    address: '123 Main St, New York, NY 10001',
    primaryCare: 'Dr. James Wilson',
    riskScore: 78,
    conditions: ['Type 2 Diabetes', 'Hypertension', 'Hyperlipidemia'],
    allergies: ['Penicillin', 'Sulfa drugs'],
    lastVisit: '2024-09-15',
    nextAppointment: '2025-10-15'
  };

  
  const careGaps = [
    {
      id: 1,
      type: 'A1c Test',
      status: 'overdue',
      dueDate: '2024-12-15',
      overdueDays: 293,
      priority: 'high',
      description: 'Last test was 9 months ago. Recommended every 3-6 months for diabetic patients.'
    },
    {
      id: 2,
      type: 'Annual Eye Exam',
      status: 'overdue',
      dueDate: '2025-01-20',
      overdueDays: 257,
      priority: 'high',
      description: 'Diabetic retinopathy screening is overdue.'
    },
    {
      id: 3,
      type: 'Foot Exam',
      status: 'due-soon',
      dueDate: '2025-11-01',
      overdueDays: 0,
      priority: 'medium',
      description: 'Annual diabetic foot examination due in 28 days.'
    }
  ];

  const timeline = [
    {
      id: 1,
      date: '2025-09-28',
      type: 'ER Visit',
      title: 'Emergency Room',
      description: 'Chief complaint: Chest pain. Discharged after cardiac workup negative.',
      provider: 'Dr. Emily Roberts',
      status: 'critical'
    },
    {
      id: 2,
      date: '2025-08-12',
      type: 'Lab Results',
      title: 'Blood Work',
      description: 'A1c: 8.2% (elevated), Glucose: 185 mg/dL',
      provider: 'Quest Diagnostics',
      status: 'warning'
    },
    {
      id: 3,
      date: '2025-07-05',
      type: 'Office Visit',
      title: 'Primary Care Follow-up',
      description: 'Medication adjustment: Increased Metformin to 1000mg BID',
      provider: 'Dr. James Wilson',
      status: 'normal'
    },
    {
      id: 4,
      date: '2025-05-20',
      type: 'Prescription',
      title: 'Medication Refill',
      description: 'Lisinopril 10mg, Atorvastatin 20mg, Metformin 500mg',
      provider: 'CVS Pharmacy',
      status: 'normal'
    },
    {
      id: 5,
      date: '2025-03-15',
      type: 'Office Visit',
      title: 'Annual Physical',
      description: 'Routine exam. BP: 138/85, Weight: 182 lbs, BMI: 29.2',
      provider: 'Dr. James Wilson',
      status: 'normal'
    }
  ];

  const aiSummary = "High-risk diabetic patient requiring immediate attention. Currently 9 months overdue for A1c testing with last recorded value at 8.2% (poorly controlled). Recent ER visit for chest pain raises concerns about cardiovascular complications. Multiple care gaps identified. Recommend urgent outreach for comprehensive diabetes management review and cardiac risk assessment.";

  const getRiskColor = (score) => {
    if (score >= 75) return 'from-red-400 to-pink-400';
    if (score >= 50) return 'from-yellow-400 to-orange-400';
    return 'from-green-400 to-emerald-400';
  };

  const getRiskLabel = (score) => {
    if (score >= 75) return 'High Risk';
    if (score >= 50) return 'Medium Risk';
    return 'Low Risk';
  };

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-12">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-md border-b border-purple-100/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-all mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Results
          </button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-purple-900 mb-2">{patient.name}</h1>
              <div className="flex items-center gap-4 text-sm text-purple-600">
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {patient.mrn}
                </span>
                <span>•</span>
                <span>{patient.age} years old</span>
                <span>•</span>
                <span>{patient.gender}</span>
                <span>•</span>
                <span>DOB: {patient.dob}</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl transition-all flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Call
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Schedule
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Overview */}
          <div className="space-y-6">
            {/* Risk Score */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-purple-100/50">
              <h3 className="text-sm font-medium text-purple-600 mb-4">Risk Score</h3>
              <div className="relative">
                <div className="w-32 h-32 mx-auto mb-4">
                  <svg className="transform -rotate-90 w-32 h-32">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-purple-100"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${(patient.riskScore / 100) * 351.86} 351.86`}
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" className="text-red-400" stopColor="currentColor" />
                        <stop offset="100%" className="text-pink-400" stopColor="currentColor" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-900">{patient.riskScore}</div>
                      <div className="text-xs text-purple-400">/ 100</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`text-center px-4 py-2 rounded-xl bg-gradient-to-r ${getRiskColor(patient.riskScore)} text-white font-medium`}>
                {getRiskLabel(patient.riskScore)}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-purple-100/50">
              <h3 className="text-sm font-medium text-purple-600 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-purple-400 mt-1" />
                  <div>
                    <div className="text-sm text-purple-900">{patient.phone}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-purple-400 mt-1" />
                  <div>
                    <div className="text-sm text-purple-900">{patient.email}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-purple-400 mt-1" />
                  <div>
                    <div className="text-sm text-purple-900">{patient.address}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Info */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-purple-100/50">
              <h3 className="text-sm font-medium text-purple-600 mb-4">Medical Information</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-purple-400 mb-2">Active Conditions</div>
                  <div className="flex flex-wrap gap-2">
                    {patient.conditions.map((condition, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-purple-400 mb-2">Allergies</div>
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.map((allergy, idx) => (
                      <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-purple-400 mb-1">Primary Care Provider</div>
                  <div className="text-sm text-purple-900">{patient.primaryCare}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Timeline & Details */}
          <div className="col-span-2 space-y-6">
            {/* AI Summary */}
            <div className="bg-gradient-to-br from-purple-400/20 to-pink-400/20 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-purple-200/50">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900 mb-2">AI Clinical Summary</h3>
                  <p className="text-purple-700 leading-relaxed">{aiSummary}</p>
                </div>
              </div>
            </div>

            {/* Care Gaps */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-purple-100/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-purple-900">Care Gaps</h3>
                <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                  {careGaps.filter(g => g.status === 'overdue').length} Overdue
                </span>
              </div>
              <div className="space-y-3">
                {careGaps.map((gap) => (
                  <div
                    key={gap.id}
                    className={`p-4 rounded-2xl border-l-4 ${
                      gap.priority === 'high'
                        ? 'bg-red-50/50 border-red-400'
                        : 'bg-yellow-50/50 border-yellow-400'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-5 h-5 ${
                          gap.priority === 'high' ? 'text-red-500' : 'text-yellow-500'
                        }`} />
                        <h4 className="font-semibold text-purple-900">{gap.type}</h4>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        gap.status === 'overdue'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {gap.status === 'overdue' ? `${gap.overdueDays} days overdue` : 'Due Soon'}
                      </span>
                    </div>
                    <p className="text-sm text-purple-700 mb-3">{gap.description}</p>
                    <button className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl text-sm font-medium transition-all">
                      Schedule Now
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-purple-100/50">
              <h3 className="text-lg font-semibold text-purple-900 mb-6">Patient Timeline</h3>
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-purple-200"></div>
                
                <div className="space-y-6">
                  {timeline.map((event) => (
                    <div key={event.id} className="relative pl-14">
                      <div className={`absolute left-3 w-6 h-6 rounded-full flex items-center justify-center ${
                        event.status === 'critical'
                          ? 'bg-red-400'
                          : event.status === 'warning'
                          ? 'bg-yellow-400'
                          : 'bg-purple-300'
                      }`}>
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      
                      <div className="bg-purple-50/50 rounded-2xl p-4 hover:bg-purple-50 transition-all">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-purple-900">{event.title}</h4>
                            <div className="text-xs text-purple-400 flex items-center gap-2 mt-1">
                              <Clock className="w-3 h-3" />
                              {event.date}
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-white text-purple-600 rounded-full text-xs font-medium">
                            {event.type}
                          </span>
                        </div>
                        <p className="text-sm text-purple-700 mb-2">{event.description}</p>
                        <div className="text-xs text-purple-400">{event.provider}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;