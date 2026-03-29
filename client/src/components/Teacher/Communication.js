import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Users, Bell, UserPlus, AtSign, Search, ChevronDown, MessageCircle, Sparkles, ArrowUpRight } from 'lucide-react';

const Communication = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState('compose'); // compose, announcements
  const [messageData, setMessageData] = useState({
    recipientType: 'class',
    recipientId: '',
    subject: '',
    message: '',
    priority: 'medium'
  });
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const studentDropdownRef = useRef(null);

  useEffect(() => {
    fetchClasses();
    fetchStudents();
    fetchAnnouncements();
    fetchConversations();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (studentDropdownRef.current && !studentDropdownRef.current.contains(event.target)) {
        setShowStudentDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.assignedClass) {
      // Find the class ID that matches the user's assigned class
      const classToSelect = classes.find(cls => cls.className === currentUser.assignedClass);
      if (classToSelect) {
        setMessageData(prev => ({
          ...prev,
          recipientId: classToSelect._id
        }));
      }
    }
  }, [classes, currentUser]);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/teacher/classes', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 1000
      });
      // Filter for classes 8, 9, 10
      let filteredClasses = response.data.data.filter(cls =>
        ['8', '9', '10'].includes(cls.className)
      );
      if (!filteredClasses || filteredClasses.length === 0) {
        filteredClasses = [{ _id: 'mock_class_8b', className: '8', section: 'B' }];
      }
      setClasses(filteredClasses);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([{ _id: 'mock_class_8b', className: '8', section: 'B' }]);
    }
  };

  const fetchStudents = async () => {
    const mockNames = [
      'Aarav Sharma', 'Vivaan Patel', 'Aditya Singh', 'Vihaan Kumar', 'Arjun Gupta',
      'Sai Krishna', 'Reyansh Reddy', 'Ayaan Khan', 'Krishna Iyer', 'Ishaan Verma',
      'Rudra Joshi', 'Dhruv Desai', 'Kabir Das', 'Atharv Yadav', 'Rishi Tiwari',
      'Adwait Pandey', 'Aanya Sharma', 'Diya Patel', 'Ananya Singh', 'Myra Kumar',
      'Kavya Gupta', 'Siya Reddy', 'Navya Khan', 'Aaradhya Iyer', 'Saanvi Verma',
      'Nyra Joshi', 'Sneha Desai', 'Ira Das', 'Riya Yadav', 'Tara Tiwari',
      'Kiara Pandey', 'Advik Nair', 'Pranav Menon', 'Rohan Sethi', 'Karthik Pillai',
      'Siddharth Rao', 'Neel Thakur', 'Dev Bhardwaj', 'Rahul Chatterjee', 'Nikhil Sen'
    ];

    const generateMockStudents = () => mockNames.map((name, index) => ({
      _id: `MOCK_STU_${index + 1}`,
      rollNumber: `R${String(index + 1).padStart(3, '0')}`,
      name,
      className: '8',
      section: 'B',
      fatherName: `Mr. ${name.split(' ')[1] || 'Parent'}`,
      motherName: `Mrs. ${name.split(' ')[1] || 'Parent'}`,
    }));

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/student/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 1000
      });
      let fetchedStudents = response.data.data || [];

      if (fetchedStudents.length === 0) {
        fetchedStudents = generateMockStudents();
      }

      setStudents(fetchedStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents(generateMockStudents());
    }
  };

  const [sections, setSections] = useState([]);

  useEffect(() => {
    if (messageData.recipientId) {
      const selectedClass = classes.find(c => c._id === messageData.recipientId);
      if (selectedClass) {
        // In a real app, you would fetch sections for the class
        setSections(['A', 'B', 'C']); // Mock sections
      }
    }
  }, [messageData.recipientId, classes]);

  const fetchAnnouncements = async () => {
    try {
      // Mock data for announcements
      setAnnouncements([
        {
          id: 1,
          title: 'School Assembly Tomorrow',
          content: 'There will be a school assembly tomorrow at 9 AM in the main hall.',
          date: '2024-01-15',
          author: 'Principal',
          priority: 'high'
        },
        {
          id: 2,
          title: 'Math Test Postponed',
          content: 'The math test scheduled for Friday has been postponed to Monday.',
          date: '2024-01-14',
          author: 'Math Department',
          priority: 'medium'
        }
      ]);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      // Mock data for conversations
      setConversations([
        {
          id: 1,
          participant: 'John Smith (Parent)',
          lastMessage: 'Hi, I wanted to discuss my child\'s progress...',
          timestamp: '2 hours ago',
          unread: 2
        },
        {
          id: 2,
          participant: 'Sarah Johnson (Student)',
          lastMessage: 'Can you please clarify the assignment deadline?',
          timestamp: '1 day ago',
          unread: 0
        },
        {
          id: 3,
          participant: 'Mrs. Davis (Colleague)',
          lastMessage: 'Thanks for sharing the lesson plan!',
          timestamp: '3 days ago',
          unread: 0
        }
      ]);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMessageData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetMessageForm = () => {
    setMessageData({
      recipientType: 'class',
      recipientId: '',
      subject: '',
      message: '',
      priority: 'medium'
    });
    setStudentSearchTerm('');
    setShowStudentDropdown(false);
  };

  const handleSendAnnouncement = async () => {
    if (!messageData.subject || !messageData.message) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Mock API call
      setTimeout(() => {
        setSuccess('Announcement sent successfully!');
        resetMessageForm();
        setLoading(false);
        setTimeout(() => setSuccess(''), 3000);
      }, 1000);
    } catch (error) {
      console.error('Error sending announcement:', error);
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageData.subject || !messageData.message) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Mock API call
      setTimeout(() => {
        setSuccess('Message sent successfully!');
        resetMessageForm();
        setLoading(false);
        setTimeout(() => setSuccess(''), 3000);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      setLoading(false);
    }
  };

  const handleRecipientTypeChange = (type) => {
    setMessageData(prev => ({
      ...prev,
      recipientType: type,
      recipientId: ''
    }));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityMeta = (priority) => {
    switch (priority) {
      case 'high':
        return {
          label: 'High',
          dot: 'bg-red-500',
          ring: 'focus:ring-red-100 focus:border-red-300'
        };
      case 'low':
        return {
          label: 'Low',
          dot: 'bg-emerald-500',
          ring: 'focus:ring-emerald-100 focus:border-emerald-300'
        };
      default:
        return {
          label: 'Medium',
          dot: 'bg-amber-500',
          ring: 'focus:ring-amber-100 focus:border-amber-300'
        };
    }
  };

  const recipientOptions = [
    { value: 'class', label: 'Class', icon: Users, accent: 'from-blue-600 to-indigo-600' },
    { value: 'student', label: 'Student', icon: UserPlus, accent: 'from-violet-600 to-fuchsia-600' },
    { value: 'parent', label: 'Parent', icon: AtSign, accent: 'from-teal-600 to-cyan-600' }
  ];

  const currentPriority = getPriorityMeta(messageData.priority);

  const filteredStudents = students.filter(student => {
    return (
      (student.name && student.name.toLowerCase().includes(studentSearchTerm.toLowerCase())) ||
      (student.rollNumber && student.rollNumber.toLowerCase().includes(studentSearchTerm.toLowerCase()))
    );
  });

  return (
    <div className="relative space-y-6 overflow-hidden">
      <div className="absolute -left-10 top-10 h-36 w-36 rounded-full bg-sky-200/30 blur-3xl" />
      <div className="absolute right-0 top-24 h-44 w-44 rounded-full bg-violet-200/25 blur-3xl" />
      <div className="absolute bottom-0 right-16 h-32 w-32 rounded-full bg-cyan-200/20 blur-3xl" />

      <div className="relative overflow-hidden rounded-[20px] border border-white/60 bg-white/70 p-6 shadow-[0_12px_36px_rgba(148,163,184,0.18)] backdrop-blur-xl">
        <div className="absolute inset-x-6 bottom-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 opacity-80" />
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-indigo-100/50 blur-2xl" />
        <div className="relative flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-200/70">
            <MessageCircle className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Announcement</h2>
            <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500">Send announcements to students & parents from one polished, distraction-free workspace.</p>
          </div>
        </div>
      </div>

      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 shadow-sm">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="overflow-hidden rounded-[20px] border border-white/60 bg-white/70 shadow-[0_12px_36px_rgba(148,163,184,0.18)] backdrop-blur-xl">
        <div className="flex border-b border-slate-200/60 bg-slate-50/60 p-2 gap-2">
          <button
            onClick={() => setActiveTab('compose')}
            className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-300 ${activeTab === 'compose'
              ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-200/70'
              : 'text-slate-500 hover:bg-white hover:text-slate-700'
              }`}
          >
            <Send className="h-4 w-4" />
            Sent Message
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-300 ${activeTab === 'announcements'
              ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-200/70'
              : 'text-slate-500 hover:bg-white hover:text-slate-700'
              }`}
          >
            <Bell className="h-4 w-4" />
            Announcements
          </button>
        </div>

        <div className="p-6 md:p-8">
          {/* Compose Tab */}
          {activeTab === 'compose' && (
            <div className="space-y-7">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Compose New Message</h3>
                  <p className="text-sm text-slate-500">Choose recipients, set priority, and write the message in a clean form.</p>
                </div>
                <div className="hidden items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 md:flex">
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  Premium layout
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-3 block text-sm font-semibold text-slate-700">Message Type</label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {recipientOptions.map(option => {
                      const Icon = option.icon;
                      const active = messageData.recipientType === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleRecipientTypeChange(option.value)}
                          className={`group flex items-center justify-center gap-2 rounded-2xl border px-4 py-4 text-sm font-semibold transition-all duration-300 ${active
                            ? `border-transparent bg-gradient-to-r ${option.accent} text-white shadow-lg shadow-blue-200/70`
                            : 'border-slate-200 bg-white/80 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                          <Icon className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-semibold text-slate-700">Priority</label>
                  <div className="relative">
                    <div className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full ${currentPriority.dot}`} />
                    <select
                      name="priority"
                      value={messageData.priority}
                      onChange={handleInputChange}
                      className={`w-full appearance-none rounded-2xl border border-slate-200 bg-white/80 py-3.5 pl-11 pr-11 text-slate-900 outline-none transition-all duration-300 focus:ring-4 ${currentPriority.ring}`}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>

              {messageData.recipientType !== 'class' && (
                <div>
                  <label className="mb-3 block text-sm font-semibold text-slate-700">
                    {messageData.recipientType === 'student' ? 'Select Student' : 'Select Parent'}
                  </label>

                  {messageData.recipientType === 'student' ? (
                    <div className="relative" ref={studentDropdownRef}>
                      <div
                        className="flex w-full cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-white/80 p-3.5 text-slate-600 transition-all duration-300 hover:border-slate-300 hover:bg-white focus-within:ring-4 focus-within:ring-blue-100/60"
                        onClick={() => setShowStudentDropdown(!showStudentDropdown)}
                      >
                        <span className={messageData.recipientId ? 'text-slate-900' : 'text-slate-400'}>
                          {messageData.recipientId
                            ? students.find(s => s._id === messageData.recipientId)?.name
                            : 'Select a student'}
                        </span>
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </div>

                      {showStudentDropdown && (
                        <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
                          <div className="flex items-center gap-2 border-b border-slate-100 p-3">
                            <Search className="h-4 w-4 text-slate-400" />
                            <input
                              type="text"
                              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                              placeholder="Search by name or roll number..."
                              value={studentSearchTerm}
                              onChange={(e) => setStudentSearchTerm(e.target.value)}
                              autoFocus
                            />
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            {filteredStudents.length > 0 ? (
                              filteredStudents.map(student => (
                                <div
                                  key={student._id}
                                  className="cursor-pointer border-b border-slate-50 p-3 transition-colors hover:bg-slate-50 last:border-0"
                                  onClick={() => {
                                    handleInputChange({ target: { name: 'recipientId', value: student._id } });
                                    setShowStudentDropdown(false);
                                    setStudentSearchTerm('');
                                  }}
                                >
                                  <div className="font-medium text-sm">{student.name}</div>
                                  <div className="text-xs text-gray-500 flex justify-between mt-1">
                                    <span>Roll No: {student.rollNumber || 'N/A'}</span>
                                    <span>Class: {student.className || 'N/A'}-{student.section || 'N/A'}</span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-3 text-sm text-gray-500 text-center">No students found</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <select
                      name="recipientId"
                      value={messageData.recipientId}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3.5 text-slate-900 outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-100/60"
                    >
                      <option value="">Select Parent</option>
                      {students.map(student => (
                        <option key={student._id} value={student._id}>
                          {student.fatherName || student.motherName ? `${student.fatherName || student.motherName} (Parent of ${student.name})` : `Parent of ${student.name}`}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              <div>
                <label className="mb-3 block text-sm font-semibold text-slate-700">Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={messageData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3.5 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100/60"
                  placeholder="Enter subject"
                />
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-slate-700">Message *</label>
                <textarea
                  name="message"
                  value={messageData.message}
                  onChange={handleInputChange}
                  required
                  rows="8"
                  className="w-full rounded-[20px] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 text-slate-900 shadow-inner shadow-slate-100/70 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100/60"
                  placeholder="Type your message here..."
                />
              </div>

              <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                <button
                  onClick={handleSendMessage}
                  disabled={loading}
                  className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition-all duration-300 ${loading ? 'cursor-not-allowed bg-slate-400' : 'bg-gradient-to-r from-blue-600 to-violet-600 shadow-lg shadow-blue-200/70 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-200/70'
                    }`}
                >
                  <Send className="h-4 w-4" />
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
                <button
                  onClick={handleSendAnnouncement}
                  disabled={loading}
                  className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition-all duration-300 ${loading ? 'cursor-not-allowed bg-slate-400' : 'bg-gradient-to-r from-emerald-600 to-teal-500 shadow-lg shadow-emerald-200/70 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-teal-200/70'
                    }`}
                >
                  <Bell className="h-4 w-4" />
                  {loading ? 'Sending...' : 'Post Announcement'}
                </button>
              </div>
            </div>
          )}

          {/* Announcements Tab */}
          {activeTab === 'announcements' && (
            <div className="space-y-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Recent Announcements</h3>
                  <p className="text-sm text-slate-500">A clean feed of the latest posts and alerts.</p>
                </div>
                <div className="hidden rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500 md:flex">
                  {announcements.length} live updates
                </div>
              </div>
              {announcements.length > 0 ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  {announcements.map(announcement => (
                    <div key={announcement.id} className="group relative overflow-hidden rounded-[24px] border border-white/80 bg-white/85 p-5 shadow-[0_10px_28px_rgba(148,163,184,0.14)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(148,163,184,0.2)]">
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 opacity-90" />
                      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-indigo-100/50 blur-2xl transition-opacity duration-300 group-hover:opacity-80" />
                      <div className="relative flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-indigo-200/60">
                            <Bell className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-lg font-bold text-slate-900">{announcement.title}</h4>
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                Announcement
                              </span>
                            </div>
                            <p className="mt-2 leading-6 text-slate-600">{announcement.content}</p>
                          </div>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getPriorityColor(announcement.priority)}`}>
                          {announcement.priority}
                        </span>
                      </div>
                      <div className="relative mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                          <span>By {announcement.author}</span>
                        </div>
                        <div className="flex items-center gap-2 font-medium text-slate-400">
                          <span>{new Date(announcement.date).toLocaleDateString()}</span>
                          <ArrowUpRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No announcements yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Communication;
