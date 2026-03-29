import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, CheckCircle, XCircle, User, Plus, Edit, Trash2, Mail, Download, CalendarDays, Users, Filter, Search, ChevronDown, ClipboardList, Sparkles, ArrowUpRight, FileText, Briefcase, HeartPulse, BellRing } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const LeaveManagement = () => {
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    date: '',
    student: '',
    type: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [error, setError] = useState('');
  const [parentLeaves, setParentLeaves] = useState([]);
  const totalAllowedLeaveDays = 24;

  useEffect(() => {
    fetchLeaveApplications();
    loadParentLeaves();
  }, []);

  const loadParentLeaves = () => {
    const saved = localStorage.getItem('parent-leave-applications');
    if (saved) {
      try { setParentLeaves(JSON.parse(saved)); return; } catch { /* ignore */ }
    }
    const mockParentLeaves = [
      { _id: 'pl_1', studentName: 'Aarav Sharma', parentName: 'Mr. Sharma', leaveType: 'sick', startDate: '2026-03-07', endDate: '2026-03-08', reason: 'Child is having fever and needs rest', status: 'pending', appliedDate: '2026-03-05' },
      { _id: 'pl_2', studentName: 'Diya Patel', parentName: 'Mr. Patel', leaveType: 'casual', startDate: '2026-03-10', endDate: '2026-03-10', reason: 'Family function - wedding ceremony', status: 'pending', appliedDate: '2026-03-04' },
      { _id: 'pl_3', studentName: 'Vivaan Patel', parentName: 'Mrs. Patel', leaveType: 'sick', startDate: '2026-03-06', endDate: '2026-03-07', reason: 'Doctor appointment and medical checkup', status: 'approved', appliedDate: '2026-03-03' },
      { _id: 'pl_4', studentName: 'Arjun Gupta', parentName: 'Mr. Gupta', leaveType: 'casual', startDate: '2026-03-12', endDate: '2026-03-12', reason: 'Out of station for personal work', status: 'pending', appliedDate: '2026-03-05' },
      { _id: 'pl_5', studentName: 'Ananya Singh', parentName: 'Mrs. Singh', leaveType: 'sick', startDate: '2026-03-04', endDate: '2026-03-05', reason: 'Child had food poisoning', status: 'rejected', appliedDate: '2026-03-03' },
    ];
    setParentLeaves(mockParentLeaves);
    localStorage.setItem('parent-leave-applications', JSON.stringify(mockParentLeaves));
  };

  const handleParentLeaveAction = (leaveId, action) => {
    const updated = parentLeaves.map(leave =>
      leave._id === leaveId ? { ...leave, status: action } : leave
    );
    setParentLeaves(updated);
    localStorage.setItem('parent-leave-applications', JSON.stringify(updated));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fetchLeaveApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/teacher/leaves', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 1000
      });
      setLeaveApplications(response.data.data);
    } catch (error) {
      console.error('Error fetching leave applications:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Calculate leave duration
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (diffDays > 2) {
      const msg = 'Leave application can only be for a maximum of 2 days.';
      setError(msg);
      alert(msg);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.post('http://localhost:5000/api/teacher/leaves', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setFormData({
          leaveType: 'casual',
          startDate: '',
          endDate: '',
          reason: ''
        });
        setShowApplyForm(false);
        setSuccess('Leave application submitted successfully!');
        setTimeout(() => setSuccess(''), 3000);
        fetchLeaveApplications();
      } else {
        throw new Error('Server returned unsuccessful status');
      }
    } catch (error) {
      console.error('Error submitting leave application:', error);

      // MOCK FALLBACK: If server fails, add a mock record locally for demonstration
      const mockLeave = {
        _id: 'mock_' + Date.now(),
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      setLeaveApplications([mockLeave, ...leaveApplications]);

      setFormData({
        leaveType: 'casual',
        startDate: '',
        endDate: '',
        reason: ''
      });
      setShowApplyForm(false);
      setSuccess('Leave (Offline Mode) submitted successfully!');
      setTimeout(() => setSuccess(''), 3000);

      alert('Application submitted (Development Mode). Note: Server connection was unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusPill = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'rejected':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getLeaveTypeMeta = (leaveType) => {
    switch ((leaveType || '').toLowerCase()) {
      case 'sick':
        return { label: 'Sick', icon: HeartPulse, accent: 'from-rose-500 to-pink-500' };
      case 'earned':
        return { label: 'Earned', icon: Briefcase, accent: 'from-blue-500 to-indigo-500' };
      case 'maternity':
      case 'paternity':
        return { label: 'Family', icon: Users, accent: 'from-violet-500 to-fuchsia-500' };
      case 'bereavement':
        return { label: 'Bereavement', icon: BellRing, accent: 'from-slate-600 to-slate-700' };
      default:
        return { label: 'Casual', icon: FileText, accent: 'from-emerald-500 to-teal-500' };
    }
  };

  const calculateLeaveDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    return Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
  };

  const getLeaveUsagePercent = () => {
    const used = leaveApplications.reduce((sum, app) => sum + calculateLeaveDays(app.startDate, app.endDate), 0);
    return Math.min(100, Math.round((used / totalAllowedLeaveDays) * 100));
  };

  const filteredParentLeaves = parentLeaves.filter(leave => {
    const matchesTab = activeTab === 'all' || leave.status === activeTab;
    const matchesType = !filters.type || leave.leaveType === filters.type;
    const matchesStudent = !filters.student || leave.studentName.toLowerCase().includes(filters.student.toLowerCase()) || leave.parentName.toLowerCase().includes(filters.student.toLowerCase());
    const matchesDate = !filters.date || leave.startDate === filters.date || leave.endDate === filters.date;
    return matchesTab && matchesType && matchesStudent && matchesDate;
  });

  const filteredMyLeaves = leaveApplications.filter(application => {
    const matchesType = !filters.type || application.leaveType === filters.type;
    const matchesDate = !filters.date || application.startDate === filters.date || application.endDate === filters.date;
    return matchesType && matchesDate;
  });

  const leaveSummary = {
    approved: leaveApplications.filter(app => app.status === 'approved').length,
    pending: leaveApplications.filter(app => app.status === 'pending').length,
    rejected: leaveApplications.filter(app => app.status === 'rejected').length
  };

  const leaveTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'casual', label: 'Casual' },
    { value: 'sick', label: 'Sick' },
    { value: 'earned', label: 'Earned' },
    { value: 'maternity', label: 'Maternity' },
    { value: 'paternity', label: 'Paternity' },
    { value: 'bereavement', label: 'Bereavement' },
    { value: 'other', label: 'Other' },
  ];

  const renderCalendarGrid = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startDay = first.getDay();
    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let day = 1; day <= last.getDate(); day++) days.push(day);

    return (
      <div className="grid grid-cols-7 gap-2 text-xs">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
          <div key={day} className="px-2 py-1 text-center font-semibold text-slate-400">{day}</div>
        ))}
        {days.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="rounded-2xl border border-dashed border-slate-100 bg-white/50 px-2 py-5" />;
          }
          const dayStr = new Date(year, month, day).toISOString().split('T')[0];
          const leavesOnDay = leaveApplications.filter(app => dayStr >= app.startDate && dayStr <= app.endDate);
          return (
            <div key={day} className="min-h-[88px] rounded-2xl border border-slate-100 bg-white/80 p-2 shadow-sm">
              <div className="font-semibold text-slate-700">{day}</div>
              <div className="mt-2 space-y-1">
                {leavesOnDay.slice(0, 2).map(item => (
                  <div key={item._id} className={`rounded-full px-2 py-1 text-[10px] font-semibold ${getStatusPill(item.status)}`}>
                    {item.leaveType}
                  </div>
                ))}
                {leavesOnDay.length > 2 && (
                  <div className="text-[10px] text-slate-400">+{leavesOnDay.length - 2} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative space-y-6 overflow-hidden">
      <div className="absolute -left-10 top-8 h-40 w-40 rounded-full bg-sky-200/30 blur-3xl" />
      <div className="absolute right-0 top-28 h-48 w-48 rounded-full bg-violet-200/25 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-emerald-200/20 blur-3xl" />

      <div className="relative overflow-hidden rounded-[20px] border border-white/60 bg-white/75 p-6 shadow-[0_12px_36px_rgba(148,163,184,0.18)] backdrop-blur-xl">
        <div className="absolute inset-x-6 bottom-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 opacity-80" />
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-100/50 blur-2xl" />
        <div className="relative flex items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-200/70">
              <CalendarDays className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Leave Management</h2>
              <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500">Apply for leave, review parent requests, and track leave usage in one clean workspace.</p>
            </div>
          </div>
          <button
            onClick={() => setShowApplyForm(true)}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-200/70 transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-500 hover:to-violet-500 hover:shadow-xl hover:shadow-violet-200/70"
          >
            <Plus className="h-4 w-4" />
            Apply Leave
            <ArrowUpRight className="h-4 w-4 opacity-70" />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 shadow-sm">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 shadow-sm">
          {success}
        </div>
      )}

      <div className="overflow-hidden rounded-[20px] border border-white/60 bg-white/75 shadow-[0_12px_36px_rgba(148,163,184,0.18)] backdrop-blur-xl">
        <div className="border-b border-slate-200/60 bg-slate-50/60 p-2">
          <div className="flex flex-wrap gap-2">
            {['all', 'approved', 'pending', 'rejected'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition-all duration-300 ${activeTab === tab ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-200/70' : 'text-slate-500 hover:bg-white hover:text-slate-700'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="p-6 md:p-7">
          <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_1fr_1fr_auto]">
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                name="student"
                value={filters.student}
                onChange={handleFilterChange}
                placeholder="Filter by student or parent"
                className="w-full rounded-2xl border border-slate-200 bg-white/80 py-3.5 pl-11 pr-4 text-slate-900 outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-100/60"
              />
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Calendar className="h-4 w-4" />
              </div>
              <input
                type="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
                className="w-full rounded-2xl border border-slate-200 bg-white/80 py-3.5 pl-11 pr-4 text-slate-900 outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-100/60"
              />
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Filter className="h-4 w-4" />
              </div>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-white/80 py-3.5 pl-11 pr-11 text-slate-900 outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-100/60"
              >
                {leaveTypeOptions.map(option => (
                  <option key={option.value || 'all'} value={option.value}>{option.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
            <button
              type="button"
              onClick={() => setShowCalendarView(prev => !prev)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white/80 px-5 py-3 font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50"
            >
              <CalendarDays className="h-4 w-4 text-indigo-500" />
              {showCalendarView ? 'Table View' : 'Calendar View'}
            </button>
          </div>
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-[20px] bg-gradient-to-br from-blue-600 to-indigo-600 p-5 text-white shadow-lg shadow-blue-200/70 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-100">Total Leave Days</p>
                  <p className="mt-2 text-4xl font-extrabold">{leaveApplications.reduce((sum, app) => sum + calculateLeaveDays(app.startDate, app.endDate), 0)}</p>
                </div>
                <Calendar className="h-8 w-8 text-white/90" />
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-white" style={{ width: `${getLeaveUsagePercent()}%` }} />
              </div>
              <p className="mt-3 text-xs text-blue-100">{getLeaveUsagePercent()}% of allowed leave used</p>
            </div>
            <div className="rounded-[20px] bg-gradient-to-br from-emerald-500 to-teal-500 p-5 text-white shadow-lg shadow-emerald-200/70 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-50">Present Days</p>
                  <p className="mt-2 text-4xl font-extrabold">8</p>
                </div>
                <CheckCircle className="h-8 w-8 text-white/90" />
              </div>
              <p className="mt-4 text-xs text-emerald-50">Stable attendance trend this month</p>
            </div>
            <div className="rounded-[20px] border border-slate-200/60 bg-white/80 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Leave Status</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">{leaveApplications.length}</p>
                </div>
                <Sparkles className="h-8 w-8 text-violet-500" />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-2xl bg-emerald-50 px-2 py-2 text-emerald-700">Approved {leaveSummary.approved}</div>
                <div className="rounded-2xl bg-amber-50 px-2 py-2 text-amber-700">Pending {leaveSummary.pending}</div>
                <div className="rounded-2xl bg-rose-50 px-2 py-2 text-rose-700">Rejected {leaveSummary.rejected}</div>
              </div>
            </div>
          </div>
          {showApplyForm && (
            <div className="rounded-[20px] border border-white/70 bg-white/80 p-6 shadow-[0_10px_30px_rgba(148,163,184,0.12)]">
              <div className="mb-1 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Apply for Leave</h3>
                  <p className="text-sm text-slate-500">Submit a new leave request in a polished two-column form.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowApplyForm(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-300 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                  aria-label="Close apply leave form"
                  title="Close"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-3 block text-sm font-semibold text-slate-700">Leave Type *</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <ClipboardList className="h-4 w-4" />
                    </div>
                    <select
                      name="leaveType"
                      value={formData.leaveType}
                      onChange={handleInputChange}
                      required
                      className="w-full appearance-none rounded-2xl border border-slate-200 bg-white/80 py-3.5 pl-11 pr-11 text-slate-900 outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-100/60"
                    >
                      <option value="casual">Casual Leave</option>
                      <option value="sick">Sick Leave</option>
                      <option value="earned">Earned Leave</option>
                      <option value="maternity">Maternity Leave</option>
                      <option value="paternity">Paternity Leave</option>
                      <option value="bereavement">Bereavement Leave</option>
                      <option value="other">Other</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
                <div>
                  <label className="mb-3 block text-sm font-semibold text-slate-700">Reason *</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <FileText className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-white/80 py-3.5 pl-11 pr-4 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100/60"
                      placeholder="Reason for leave"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-3 block text-sm font-semibold text-slate-700">Start Date *</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full rounded-2xl border border-slate-200 bg-white/80 py-3.5 pl-11 pr-4 text-slate-900 outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-100/60"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-3 block text-sm font-semibold text-slate-700">End Date *</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <CalendarDays className="h-4 w-4" />
                    </div>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                      className="w-full rounded-2xl border border-slate-200 bg-white/80 py-3.5 pl-11 pr-4 text-slate-900 outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-100/60"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition-all duration-300 ${loading ? 'cursor-not-allowed bg-slate-400' : 'bg-gradient-to-r from-blue-600 to-violet-600 shadow-lg shadow-blue-200/70 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-200/70'}`}
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowApplyForm(false)}
                  className="rounded-full border border-slate-200 bg-white/70 px-6 py-3 font-semibold text-slate-700 transition-all duration-300 hover:border-slate-300 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
              </form>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[20px] border border-white/70 bg-white/80 overflow-hidden shadow-[0_10px_30px_rgba(148,163,184,0.12)]">
        <div className="border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-orange-100 p-2 text-orange-600">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Parent Leave Applications</h3>
              <p className="text-sm text-slate-500">Approve or reject requests with a quick glance.</p>
            </div>
            <span className="ml-auto rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
              {filteredParentLeaves.filter(l => l.status === 'pending').length} Pending
            </span>
          </div>
        </div>
        <div className="p-6">
          {filteredParentLeaves.length > 0 ? (
            showCalendarView ? (
              <div>
                <div className="mb-4">
                  <h4 className="text-base font-bold text-slate-900">Calendar View</h4>
                  <p className="text-sm text-slate-500">Leave requests plotted by date.</p>
                </div>
                {renderCalendarGrid()}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-slate-400">
                      <th className="px-4 py-2">Student</th>
                      <th className="px-4 py-2">Parent</th>
                      <th className="px-4 py-2">Type</th>
                      <th className="px-4 py-2">Dates</th>
                      <th className="px-4 py-2">Reason</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParentLeaves.map((leave, index) => {
                      const meta = getLeaveTypeMeta(leave.leaveType);
                      const TypeIcon = meta.icon;
                      return (
                        <tr key={leave._id} className={`group rounded-2xl transition-all duration-300 ${index % 2 === 0 ? 'bg-slate-50/70' : 'bg-white'} hover:bg-blue-50/50`}>
                          <td className="rounded-l-2xl px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="rounded-full bg-slate-100 p-2 text-slate-500">
                                <User className="h-4 w-4" />
                              </div>
                              <span className="font-semibold text-slate-900">{leave.studentName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-slate-600">{leave.parentName}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${meta.accent} px-3 py-1 text-xs font-semibold text-white shadow-sm`}>
                              <TypeIcon className="h-3.5 w-3.5" />
                              {meta.label}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="font-medium text-slate-900">{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</div>
                            <div className="text-xs text-slate-400">{calculateLeaveDays(leave.startDate, leave.endDate)} day(s)</div>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600">
                            <div className="max-w-[240px]">{leave.reason}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(leave.status)}
                              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusPill(leave.status)}`}>
                                {leave.status}
                              </span>
                            </div>
                          </td>
                          <td className="rounded-r-2xl px-4 py-4">
                            {leave.status === 'pending' ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleParentLeaveAction(leave._id, 'approved')}
                                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-100"
                                >
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleParentLeaveAction(leave._id, 'rejected')}
                                  className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-rose-100"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs italic text-slate-400">Action taken</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 rounded-3xl bg-slate-50 p-5 text-slate-400">
                <CalendarDays className="h-12 w-12" />
              </div>
              <p className="text-lg font-semibold text-slate-700">No parent leave applications</p>
              <p className="mt-1 text-sm text-slate-500">Try adjusting the filters or wait for new requests.</p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[20px] border border-white/70 bg-white/80 overflow-hidden shadow-[0_10px_30px_rgba(148,163,184,0.12)]">
        <div className="border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-100 p-2 text-blue-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">My Leave Applications</h3>
              <p className="text-sm text-slate-500">Track your own requests and status updates.</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          {filteredMyLeaves.length > 0 ? (
            showCalendarView ? (
              <div className="space-y-4">
                {filteredMyLeaves.map(application => (
                  <div key={application._id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span className="font-semibold capitalize text-slate-900">{application.leaveType.replace('_', ' ')}</span>
                        </div>
                        <p className="mt-2 text-sm text-slate-500">
                          {new Date(application.startDate).toLocaleDateString()} - {new Date(application.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusPill(application.status)}`}>
                        {application.status}
                      </span>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-violet-500" style={{ width: `${Math.min(100, calculateLeaveDays(application.startDate, application.endDate) * 50)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-slate-400">
                      <th className="px-4 py-2">Leave Type</th>
                      <th className="px-4 py-2">Dates</th>
                      <th className="px-4 py-2">Reason</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Applied Date</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMyLeaves.map((application, index) => (
                      <tr key={application._id} className={`rounded-2xl transition-all duration-300 ${index % 2 === 0 ? 'bg-slate-50/70' : 'bg-white'} hover:bg-blue-50/50`}>
                        <td className="rounded-l-2xl px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span className="capitalize text-slate-900">{application.leaveType.replace('_', ' ')}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-medium text-slate-900">
                            {new Date(application.startDate).toLocaleDateString()} - {new Date(application.endDate).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-slate-500">{calculateLeaveDays(application.startDate, application.endDate)} days</div>
                        </td>
                        <td className="px-4 py-4 text-slate-600">{application.reason}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(application.status)}
                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusPill(application.status)}`}>
                              {application.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-600">{new Date(application.createdAt).toLocaleDateString()}</td>
                        <td className="rounded-r-2xl px-4 py-4">
                          <div className="flex gap-2">
                            <button className="rounded-full bg-slate-50 p-2 text-blue-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-50" title="Edit">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="rounded-full bg-slate-50 p-2 text-rose-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-rose-50" title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 rounded-3xl bg-slate-50 p-5 text-slate-400">
                <Calendar className="h-12 w-12" />
              </div>
              <p className="text-lg font-semibold text-slate-700">No leave applications found</p>
              <p className="mt-1 text-sm text-slate-500">Apply for leave using the button above.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-[20px] bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-white shadow-lg shadow-blue-200/70 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/15 p-3">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-blue-100">Total Leave Days</p>
                <p className="text-3xl font-extrabold">{leaveApplications.reduce((sum, app) => sum + calculateLeaveDays(app.startDate, app.endDate), 0)}</p>
              </div>
            </div>
            <button
              onClick={() => {
                const doc = new jsPDF();
                doc.setFontSize(18);
                doc.text('Total Leave Days Report', 14, 22);
                doc.setFontSize(11);
                doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 32);
                autoTable(doc, {
                  startY: 40,
                  head: [['Leave Type', 'Start Date', 'End Date', 'Days', 'Status']],
                  body: leaveApplications.map(app => [
                    app.leaveType.replace('_', ' ').replace(/^\w/, c => c.toUpperCase()),
                    new Date(app.startDate).toLocaleDateString(),
                    new Date(app.endDate).toLocaleDateString(),
                    calculateLeaveDays(app.startDate, app.endDate),
                    app.status.charAt(0).toUpperCase() + app.status.slice(1)
                  ]),
                });
                doc.text(`Total Leave Days: ${leaveApplications.reduce((sum, app) => sum + calculateLeaveDays(app.startDate, app.endDate), 0)}`, 14, doc.lastAutoTable.finalY + 12);
                doc.save('Total_Leave_Days_Report.pdf');
              }}
              className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-2 text-xs font-semibold text-white transition-all duration-300 hover:bg-white/25"
            >
              <Download className="h-4 w-4" />
              PDF
            </button>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white" style={{ width: `${getLeaveUsagePercent()}%` }} />
          </div>
        </div>

        <div className="rounded-[20px] bg-gradient-to-br from-emerald-500 to-teal-500 p-6 text-white shadow-lg shadow-emerald-200/70 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/15 p-3">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-emerald-50">Present Days</p>
                <p className="text-3xl font-extrabold">8</p>
              </div>
            </div>
            <button
              onClick={() => {
                const doc = new jsPDF();
                doc.setFontSize(18);
                doc.text('Present Days Report', 14, 22);
                doc.setFontSize(11);
                doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 32);
                autoTable(doc, {
                  startY: 40,
                  head: [['#', 'Date', 'Status']],
                  body: Array.from({ length: 8 }, (_, i) => [
                    i + 1,
                    new Date(2026, 2, i + 1).toLocaleDateString(),
                    'Present'
                  ]),
                });
                doc.text('Total Present Days: 8', 14, doc.lastAutoTable.finalY + 12);
                doc.save('Present_Days_Report.pdf');
              }}
              className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-2 text-xs font-semibold text-white transition-all duration-300 hover:bg-white/25"
            >
              <Download className="h-4 w-4" />
              PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveManagement;
