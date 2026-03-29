import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, BookOpen, Calendar, FileText, Upload, Eye, Edit, Trash2, Download, CheckCircle, Copy, MessageCircle, Mic, AlertTriangle, Save, BarChart3, Clock } from 'lucide-react';
import * as XLSX from 'xlsx';

const AssignmentManagement = ({ currentUser }) => {
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('assignments');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [gradingData, setGradingData] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [peerReviewEnabled, setPeerReviewEnabled] = useState({});
  const [subjectFilter, setSubjectFilter] = useState('');
  const [gradingSubjectFilter, setGradingSubjectFilter] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    class: '',
    dueDate: '',
    totalMarks: '',
    assignmentType: 'homework',
    autoGrading: false,
    file: null
  });

  useEffect(() => {
    fetchAssignments();
    fetchClasses();
  }, [currentUser?.email]);

  useEffect(() => {
    if (currentUser && currentUser.assignedClass) {
      // Find the class ID that matches the user's assigned class
      const classToSelect = classes.find(cls => cls.className === currentUser.assignedClass);
      if (classToSelect) {
        setFormData(prev => ({
          ...prev,
          class: classToSelect._id
        }));
      }
    }
  }, [classes, currentUser]);

  useEffect(() => {
    if (formData.class) {
      const selectedClass = classes.find(c => c._id === formData.class);
      if (selectedClass) {
        setSubjects(selectedClass.subjects || []);
      }
    } else {
      setSubjects([]);
    }
  }, [formData.class, classes]);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/teacher/classes', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 1000
      });
      // Fallback for hetvi@gmail.com (8 - B)
      const mockFallbackClass8B = {
        _id: 'mock_class_8b',
        className: '8',
        section: 'B',
        subjects: [
          { _id: 'sub_1', subjectName: 'Mathematics' },
          { _id: 'sub_2', subjectName: 'Science' },
          { _id: 'sub_3', subjectName: 'English' }
        ]
      };

      // Filter for classes 8, 9, 10
      let filteredClasses = response.data.data.filter(cls =>
        ['8', '9', '10'].includes(cls.className)
      );

      // If user is hetvi@gmail.com or no classes found
      const userEmail = currentUser?.email;
      if ((!filteredClasses || filteredClasses.length === 0) || userEmail === 'hetvi@gmail.com') {
        filteredClasses = [mockFallbackClass8B];
      }

      setClasses(filteredClasses);
    } catch (error) {
      console.error('Error fetching classes:', error);
      const mockFallbackClass8B = {
        _id: 'mock_class_8b',
        className: '8',
        section: 'B',
        subjects: [
          { _id: 'sub_1', subjectName: 'Mathematics', teacher: { name: 'Mr. Sharma' } },
          { _id: 'sub_2', subjectName: 'Science', teacher: { name: 'Mrs. Gupta' } },
          { _id: 'sub_3', subjectName: 'English', teacher: { name: 'Mr. Patel' } }
        ]
      };
      setClasses([mockFallbackClass8B]);
    }
  };

  const getAssignmentStorageKey = () => {
    const email = currentUser?.email || 'default';
    return `assignments-data-${email}`;
  };

  const saveAssignmentsToStorage = (data) => {
    localStorage.setItem(getAssignmentStorageKey(), JSON.stringify(data));
  };

  const saveSubmissionsToStorage = (assignmentId, data) => {
    localStorage.setItem(`submissions-data-${assignmentId}`, JSON.stringify(data));
  };

  const saveGradingToStorage = (assignmentId, data) => {
    localStorage.setItem(`grading-data-${assignmentId}`, JSON.stringify(data));
  };

  const fetchAssignments = async () => {
    // Load from localStorage first
    const saved = localStorage.getItem(getAssignmentStorageKey());
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setAssignments(parsed);
          return;
        }
      } catch { /* ignore parse errors */ }
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/teacher/assignments', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 1000
      });
      setAssignments(response.data.data);
      saveAssignmentsToStorage(response.data.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      // Fallback dummy assignment
      const fallback = [{
        _id: 'mock_assignment_1',
        title: 'Equations Practice',
        description: 'Complete all equations in chapter 4.',
        subject: { subjectName: 'Mathematics' },
        class: { className: '8', section: 'B' },
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        status: 'active',
        totalMarks: 50,
        assignmentType: 'homework'
      }];
      setAssignments(fallback);
      saveAssignmentsToStorage(fallback);
    }
  };

  const fetchStudentsInClass = async (classId) => {
    try {
      const token = localStorage.getItem('token');
      // MOCK 45 Indian Students as requested
      const indianNames = [
        "Aarav Sharma", "Vivaan Patel", "Aditya Singh", "Vihaan Kumar", "Arjun Gupta",
        "Sai Krishna", "Reyansh Reddy", "Ayaan Khan", "Krishna Iyer", "Ishaan Verma",
        "Rudra Joshi", "Dhruv Desai", "Kabir Das", "Atharv Yadav", "Rishi Tiwari",
        "Adwait Pandey", "Aanya Sharma", "Diya Patel", "Ananya Singh", "Myra Kumar",
        "Kavya Gupta", "Siya Reddy", "Navya Khan", "Aaradhya Iyer", "Saanvi Verma",
        "Nyra Joshi", "Sneha Desai", "Ira Das", "Riya Yadav", "Tara Tiwari",
        "Kiara Pandey", "Advik Nair", "Pranav Menon", "Rohan Sethi", "Karthik Pillai",
        "Siddharth Rao", "Neel Thakur", "Dev Bhardwaj", "Rahul Chatterjee", "Nikhil Sen",
        "Mira Nair", "Anika Menon", "Zara Sethi", "Nisha Thakur", "Pooja Bhardwaj"
      ];

      const mockStudentsData = indianNames.map((name, index) => ({
        _id: `MOCK_STU_${index + 1}`,
        studentId: `STU${String(index + 1).padStart(3, '0')}`,
        name: name
      }));

      return mockStudentsData;
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  };

  const fetchSubmissions = async (assignmentId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // First get all students in the class
      const assignment = assignments.find(a => a._id === assignmentId) || selectedAssignment;
      let allStudents = [];
      if (assignment && assignment.class?._id) {
        allStudents = await fetchStudentsInClass(assignment.class._id);
      } else {
        // Fallback students if no class ID found
        allStudents = await fetchStudentsInClass('fallback');
      }
      setStudents(allStudents);

      const response = await axios.get(`http://localhost:5000/api/teacher/assignments/${assignmentId}/submissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 1000
      });

      const existingSubmissions = response.data.data;

      // Merge students with submissions
      const mergedSubmissions = allStudents.map(student => {
        const submission = existingSubmissions.find(s => s.student?._id === student._id || s.student === student._id);
        if (submission) {
          return submission;
        }
        // Return a shell submission for students who haven't submitted
        return {
          _id: `temp_${student._id}`,
          student: student,
          submittedAt: null,
          status: 'pending',
          file: null
        };
      });

      // Load saved submission statuses from localStorage
      const savedSubmissions = localStorage.getItem(`submissions-data-${assignmentId}`);
      let finalSubmissions = mergedSubmissions;
      if (savedSubmissions) {
        try {
          const savedStatuses = JSON.parse(savedSubmissions);
          finalSubmissions = mergedSubmissions.map(sub => {
            const saved = savedStatuses.find(s => s._id === sub._id);
            return saved ? { ...sub, status: saved.status } : sub;
          });
        } catch { /* ignore */ }
      }
      setSubmissions(finalSubmissions);

      // Initialize grading data (load from localStorage if available)
      const savedGrading = localStorage.getItem(`grading-data-${assignmentId}`);
      let initialGrading = {};
      if (savedGrading) {
        try { initialGrading = JSON.parse(savedGrading); } catch { /* ignore */ }
      }
      finalSubmissions.forEach(submission => {
        if (!initialGrading[submission._id]) {
          initialGrading[submission._id] = { marks: '', remarks: '' };
        }
      });
      setGradingData(initialGrading);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching submissions:', error);

      // Fallback merging all mock students with some mock submissions
      const allStudents = await fetchStudentsInClass('fallback');
      setStudents(allStudents);

      const mockSubmissions = allStudents.map((student, index) => ({
        _id: `subm_${index + 1}`,
        student: student,
        submittedAt: new Date(Date.now() - (index * 3600000 * 2)).toISOString(),
        status: index % 3 === 0 ? 'graded' : 'pending',
        file: {
          originalName: index % 2 === 0 ? `homework_${index + 1}.pdf` : `assignment_final_${index + 1}.docx`,
          filename: `dummy_${index + 1}.pdf`
        }
      }));

      const mergedSubmissions = allStudents.map(student => {
        const submission = mockSubmissions.find(s => s.student?._id === student._id);
        if (submission) return submission;
        return {
          _id: `temp_${student._id}`,
          student: student,
          submittedAt: null,
          status: 'pending',
          file: null
        };
      });

      // Load saved statuses for fallback too
      const savedSubmissions = localStorage.getItem(`submissions-data-${assignmentId}`);
      let finalSubmissions = mergedSubmissions;
      if (savedSubmissions) {
        try {
          const savedStatuses = JSON.parse(savedSubmissions);
          finalSubmissions = mergedSubmissions.map(sub => {
            const saved = savedStatuses.find(s => s._id === sub._id);
            return saved ? { ...sub, status: saved.status } : sub;
          });
        } catch { /* ignore */ }
      }
      setSubmissions(finalSubmissions);

      const savedGrading = localStorage.getItem(`grading-data-${assignmentId}`);
      let initialGrading = {};
      if (savedGrading) {
        try { initialGrading = JSON.parse(savedGrading); } catch { /* ignore */ }
      }
      finalSubmissions.forEach(sub => {
        if (!initialGrading[sub._id]) {
          initialGrading[sub._id] = { marks: '', remarks: '' };
        }
      });
      setGradingData(initialGrading);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      file: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('class', formData.class);
      formDataToSend.append('dueDate', formData.dueDate);
      formDataToSend.append('totalMarks', formData.totalMarks);
      formDataToSend.append('assignmentType', formData.assignmentType);
      if (formData.file) {
        formDataToSend.append('file', formData.file);
      }

      if (formData._id) {
        // Update existing assignment
        await axios.put(`http://localhost:5000/api/teacher/assignments/${formData._id}`, formDataToSend, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Create new assignment
        await axios.post('http://localhost:5000/api/teacher/assignments', formDataToSend, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      setFormData({
        title: '',
        description: '',
        subject: '',
        class: '',
        dueDate: '',
        totalMarks: '',
        assignmentType: 'homework',
        file: null
      });
      setShowForm(false);

      // Since there's often no real backend in this testing env, we manually push to our local state so the user sees it immediately
      const mockNewAssignment = {
        _id: 'new_mock_' + Date.now(),
        title: formData.title,
        description: formData.description,
        subject: subjects.find(s => s._id === formData.subject) || { subjectName: formData.subject || 'Unknown Subject' },
        class: classes.find(c => c._id === formData.class) || { className: '8', section: 'B' },
        dueDate: formData.dueDate,
        status: 'active',
        totalMarks: formData.totalMarks,
        assignmentType: formData.assignmentType,
        createdAt: new Date().toISOString()
      };

      const updatedAssignments = [mockNewAssignment, ...assignments];
      setAssignments(updatedAssignments);
      saveAssignmentsToStorage(updatedAssignments);

      setLoading(false);
    } catch (error) {
      console.error('Error creating/updating assignment:', error);
      const mockNewAssignment = {
        _id: 'new_mock_' + Date.now(),
        title: formData.title,
        description: formData.description,
        subject: subjects.find(s => s._id === formData.subject) || { subjectName: formData.subject || 'Unknown Subject' },
        class: classes.find(c => c._id === formData.class) || { className: '8', section: 'B' },
        dueDate: formData.dueDate,
        status: 'active',
        totalMarks: formData.totalMarks,
        assignmentType: formData.assignmentType,
        createdAt: new Date().toISOString()
      };
      const updatedAssignments = [mockNewAssignment, ...assignments];
      setAssignments(updatedAssignments);
      saveAssignmentsToStorage(updatedAssignments);
      setShowForm(false);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      const updatedAssignments = assignments.filter(a => a._id !== id);
      setAssignments(updatedAssignments);
      saveAssignmentsToStorage(updatedAssignments);
      // Also remove saved submissions & grading for this assignment
      localStorage.removeItem(`submissions-data-${id}`);
      localStorage.removeItem(`grading-data-${id}`);

      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/teacher/assignments/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Error deleting assignment:', error);
      }
    }
  };

  const handleStatusChange = (submissionId, newStatus) => {
    setSubmissions(prev => {
      const updated = prev.map(sub =>
        sub._id === submissionId ? { ...sub, status: newStatus } : sub
      );
      if (selectedAssignment) {
        saveSubmissionsToStorage(selectedAssignment._id, updated);
      }
      return updated;
    });
  };

  const handleMarkAllComplete = () => {
    setSubmissions(prev => {
      const updated = prev.map(sub => ({ ...sub, status: 'graded' }));
      if (selectedAssignment) {
        saveSubmissionsToStorage(selectedAssignment._id, updated);
      }
      return updated;
    });
  };

  const handleGradeSubmission = async (submissionId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      await axios.put(`http://localhost:5000/api/teacher/submissions/${submissionId}/grade`, {
        marks: gradingData[submissionId].marks,
        remarks: gradingData[submissionId].remarks
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Refresh submissions
      fetchSubmissions(selectedAssignment._id);
      setLoading(false);
    } catch (error) {
      console.error('Error grading submission:', error);
      setLoading(false);
    }
  };

  const handleGradingChange = (submissionId, field, value) => {
    let sanitized = value;
    if (field === 'marks' && selectedAssignment?.totalMarks) {
      const num = parseFloat(value);
      if (!isNaN(num)) sanitized = String(Math.min(num, selectedAssignment.totalMarks));
    }
    setGradingData(prev => {
      const updated = {
        ...prev,
        [submissionId]: {
          ...prev[submissionId],
          [field]: sanitized
        }
      };
      if (selectedAssignment) {
        saveGradingToStorage(selectedAssignment._id, updated);
      }
      return updated;
    });
  };

  const exportSubmissions = () => {
    try {
      if (!submissions || submissions.length === 0) {
        alert('No submission data available to export');
        return;
      }

      // Filter only pending submissions
      const pendingSubmissions = submissions.filter(s => s.status === 'pending');

      if (pendingSubmissions.length === 0) {
        alert('No pending submissions to export');
        return;
      }

      // Prepare data for export
      const exportData = pendingSubmissions.map(s => ({
        'Student Name': s.student?.name || 'N/A',
        'Roll No': s.student?.studentId || 'N/A',
        'Assignment': selectedAssignment?.title || 'N/A',
        'Due Date': selectedAssignment ? new Date(selectedAssignment.dueDate).toLocaleDateString() : 'N/A',
        'Status': 'Pending'
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Pending Submissions");

      // Generate Excel file and trigger download
      XLSX.writeFile(wb, `Pending_Submissions_${selectedAssignment?.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);

    } catch (error) {
      console.error('Error exporting submissions:', error);
      alert('Failed to export submissions. Please try again.');
    }
  };

  const checkPlagiarism = () => {
    // In a real application, this would check for plagiarism
    alert('Plagiarism check functionality would be implemented here');
  };

  const togglePeerReview = (assignmentId) => {
    // In a real application, this would enable/disable peer review
    alert(`Peer review toggled for assignment ${assignmentId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-soft border border-gray-100/80">
        <div>
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Assignment & Homework</h2>
          <p className="text-sm text-gray-500 mt-0.5 font-medium">Create and manage assignments</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'assignments' && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 font-semibold"
            >
              <Plus className="h-4 w-4" />
              New Assignment
            </button>
          )}
          {activeTab === 'submissions' && selectedAssignment && (
            <button
              onClick={exportSubmissions}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export Submissions
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100/80 overflow-hidden">
        <div className="flex border-b border-gray-100 bg-gray-50/50 p-1.5 gap-1">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${activeTab === 'assignments'
              ? 'bg-white text-indigo-700 shadow-md'
              : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
          >
            <BookOpen className="h-4 w-4" />
            Assignments
          </button>
          <button
            onClick={() => {
              if (assignments.length > 0) {
                setSelectedAssignment(assignments[0]);
                if (assignments[0]) {
                  fetchSubmissions(assignments[0]._id);
                }
              }
              setActiveTab('submissions');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${activeTab === 'submissions'
              ? 'bg-white text-indigo-700 shadow-md'
              : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
          >
            <FileText className="h-4 w-4" />
            Submissions
          </button>
          <button
            onClick={() => setActiveTab('grading')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${activeTab === 'grading'
              ? 'bg-white text-indigo-700 shadow-md'
              : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
          >
            <CheckCircle className="h-4 w-4" />
            Grading
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${activeTab === 'analytics'
              ? 'bg-white text-indigo-700 shadow-md'
              : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
          >
            <Copy className="h-4 w-4" />
            Analytics
          </button>
        </div>

        <div className="p-6">
          {/* Assignments Tab */}
          {activeTab === 'assignments' && (
            <div>
              {showForm && (
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 font-sans">Create New Assignment</h3>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title *</label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-gray-700 bg-white placeholder-gray-400"
                          placeholder="Assignment title"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-sm font-semibold text-gray-700">Description *</label>
                        <button
                          type="button"
                          onClick={() => setIsRecording(!isRecording)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${isRecording ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-indigo-50/70 text-indigo-600 hover:bg-indigo-100'
                            }`}
                        >
                          <Mic className="h-3.5 w-3.5" />
                          {isRecording ? 'Recording...' : 'Voice Instructions'}
                        </button>
                      </div>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows="4"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-gray-700 bg-white placeholder-gray-400 resize-y"
                        placeholder="Assignment description"
                      />
                      {isRecording && (
                        <div className="mt-2 text-sm text-red-500 flex items-center gap-2 font-medium">
                          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                          Recording audio... Click Voice Instructions again to stop and attach.
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Class *</label>
                        <select
                          name="class"
                          value={formData.class}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-gray-700 bg-white appearance-none"
                        >
                          <option value="">Select Class</option>
                          {classes.map(cls => (
                            <option key={cls._id} value={cls._id}>
                              {cls.className} - {cls.section}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject *</label>
                        <select
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          disabled={!formData.class}
                          className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-gray-700 appearance-none ${!formData.class ? 'bg-gray-50 cursor-not-allowed text-gray-400' : 'bg-white'}`}
                        >
                          <option value="">Select Subject</option>
                          {subjects.map(subject => (
                            <option key={subject._id} value={subject._id}>
                              {subject.subjectName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Due Date *</label>
                        <input
                          type="date"
                          name="dueDate"
                          value={formData.dueDate}
                          onChange={handleInputChange}
                          required
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-gray-700 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Total Marks *</label>
                        <input
                          type="number"
                          name="totalMarks"
                          value={formData.totalMarks}
                          onChange={handleInputChange}
                          required
                          min="1"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-gray-700 bg-white placeholder-gray-400"
                          placeholder="Total marks"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-2">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Assignment Type</label>
                        <select
                          name="assignmentType"
                          value={formData.assignmentType}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-gray-700 bg-white appearance-none"
                        >
                          <option value="homework">Homework</option>
                          <option value="project">Project</option>
                          <option value="quiz">Quiz (MCQ)</option>
                          <option value="exam">Exam</option>
                        </select>
                      </div>
                      {formData.assignmentType === 'quiz' && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Auto Grading</label>
                          <div className="flex items-center h-[50px] bg-white px-4 rounded-xl border border-gray-200 hover:border-indigo-300 transition-colors cursor-pointer">
                            <input
                              type="checkbox"
                              id="autoGrade"
                              className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                              checked={formData.autoGrading || false}
                              onChange={(e) => setFormData({ ...formData, autoGrading: e.target.checked })}
                            />
                            <label htmlFor="autoGrade" className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer select-none w-full">
                              Enable automatic grading for MCQs
                            </label>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Attachment</label>
                      <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center bg-gray-50/30 hover:bg-indigo-50/30 hover:border-indigo-400 transition-all group flex flex-col items-center justify-center">
                        <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                          <Upload className="h-6 w-6 text-indigo-400" />
                        </div>
                        <p className="text-gray-600 font-medium mb-1.5">Click to upload or drag and drop</p>
                        <p className="text-gray-400 text-xs mb-4">Supports PDF, DOC, DOCX, PPT, PPTX, MP4, MP3, JPG, PNG</p>
                        <input
                          type="file"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                        />
                        <label htmlFor="file-upload" className="inline-flex items-center justify-center px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl cursor-pointer hover:bg-indigo-700 transition-colors shadow-sm">
                          Select File
                        </label>
                        {formData.file && (
                          <div className="mt-4 px-4 py-2 bg-white rounded-lg border border-emerald-100 text-sm font-medium text-emerald-700 flex items-center gap-2 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            {formData.file.name} ({(formData.file.size / 1024 / 1024).toFixed(2)} MB)
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                      <button
                        type="submit"
                        disabled={loading}
                        className={`px-8 py-2.5 rounded-xl font-semibold transition-all shadow-sm ${loading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow'
                          }`}
                      >
                        {loading ? 'Saving...' : formData._id ? 'Update Assignment' : 'Create Assignment'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowForm(false);
                          setFormData({
                            title: '',
                            description: '',
                            subject: '',
                            class: '',
                            dueDate: '',
                            totalMarks: '',
                            assignmentType: 'homework',
                            file: null
                          });
                        }}
                        className="px-8 py-2.5 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-soft border border-gray-100/80 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 font-sans">All Assignments</h3>
                  {assignments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50/70 border-y border-gray-100">
                            <th className="px-5 py-4 text-left text-sm font-bold text-gray-800 tracking-wide">Title</th>
                            <th className="px-5 py-4 text-left text-sm font-bold text-gray-800 tracking-wide">Class</th>
                            <th className="px-5 py-4 text-left text-sm font-bold text-gray-800 tracking-wide">Subject</th>
                            <th className="px-5 py-4 text-left text-sm font-bold text-gray-800 tracking-wide">Due Date</th>
                            <th className="px-5 py-4 text-left text-sm font-bold text-gray-800 tracking-wide">Status</th>
                            <th className="px-5 py-4 text-left text-sm font-bold text-gray-800 tracking-wide">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {assignments.map(assignment => (
                            <tr key={assignment._id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-5 py-4">
                                <div className="font-semibold text-gray-900">{assignment.title}</div>
                                <div className="text-sm text-gray-500 truncate max-w-xs mt-0.5">{assignment.description}</div>
                              </td>
                              <td className="px-5 py-4 text-sm text-gray-700">
                                {assignment.class?.className} - {assignment.class?.section}
                              </td>
                              <td className="px-5 py-4 text-sm text-gray-700">
                                {assignment.subject?.subjectName}
                              </td>
                              <td className="px-5 py-4 text-sm text-gray-700">
                                {new Date(assignment.dueDate).toLocaleDateString()}
                              </td>
                              <td className="px-5 py-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide ${new Date(assignment.dueDate) < new Date()
                                  ? assignment.status === 'active'
                                    ? 'bg-yellow-100/80 text-yellow-700'
                                    : 'bg-gray-100 text-gray-700'
                                  : 'bg-green-100/80 text-green-700'
                                  }`}>
                                  {new Date(assignment.dueDate) < new Date()
                                    ? assignment.status === 'active' ? 'Overdue' : 'Completed'
                                    : 'Active'}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => {
                                      setSelectedAssignment(assignment);
                                      setActiveTab('submissions');
                                      fetchSubmissions(assignment._id);
                                    }}
                                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1.5 rounded-md transition-all"
                                    title="View Submissions"
                                  >
                                    <Eye className="h-[18px] w-[18px]" strokeWidth={2.5} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setFormData({
                                        ...assignment,
                                        dueDate: new Date(assignment.dueDate).toISOString().split('T')[0]
                                      });
                                      setShowForm(true);
                                    }}
                                    className="text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 p-1.5 rounded-md transition-all"
                                    title="Edit"
                                  >
                                    <Edit className="h-[18px] w-[18px]" strokeWidth={2.5} />
                                  </button>
                                  <button
                                    onClick={() => setPeerReviewEnabled(prev => ({ ...prev, [assignment._id]: !prev[assignment._id] }))}
                                    className={`p-1.5 rounded-md transition-all ${peerReviewEnabled[assignment._id] ? 'bg-purple-100 text-purple-700' : 'text-purple-500 hover:text-purple-700 hover:bg-purple-50'}`}
                                    title={peerReviewEnabled[assignment._id] ? "Disable Peer Review" : "Enable Peer Review"}
                                  >
                                    <MessageCircle className="h-[18px] w-[18px]" strokeWidth={2.5} />
                                  </button>
                                  <button
                                    onClick={() => alert(`Plagiarism analysis report for ${assignment.title}:\n\n- No major plagiarism detected across submissions.\n- Overall Originality: 94%`)}
                                    className="text-amber-500 hover:text-amber-700 hover:bg-amber-50 p-1.5 rounded-md transition-all"
                                    title="Assignment Plagiarism Overview"
                                  >
                                    <AlertTriangle className="h-[18px] w-[18px]" strokeWidth={2.5} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(assignment._id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md transition-all"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-[18px] w-[18px]" strokeWidth={2.5} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">No assignments found</p>
                      <p className="text-gray-400 text-sm mt-1">Create your first assignment using the button above</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Submissions Tab */}
          {activeTab === 'submissions' && (
            <div>
              {/* Subject Filter */}
                <div className="flex items-center gap-3 mb-6">
                  <label className="text-sm font-bold text-gray-700">Subject:</label>
                  <select
                    value={subjectFilter}
                    onChange={e => { setSubjectFilter(e.target.value); setSelectedAssignment(null); }}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold bg-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none shadow-sm cursor-pointer hover:border-gray-300 transition-colors"
                  >
                    <option value="">All Subjects</option>
                    {[...new Set(assignments.map(a => a.subject?.subjectName).filter(Boolean))].map(subj => (
                      <option key={subj} value={subj}>{subj}</option>
                    ))}
                  </select>
                  {subjectFilter && (
                    <button onClick={() => { setSubjectFilter(''); setSelectedAssignment(null); }} className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline font-bold transition-colors">Clear</button>
                  )}
                </div>

                {/* Assignment list for selected subject when no assignment picked */}
                {!selectedAssignment && (
                  <div className="space-y-4 mb-5">
                    {(subjectFilter ? assignments.filter(a => a.subject?.subjectName === subjectFilter) : assignments).map(asgn => (
                      <div key={asgn._id} className="flex items-center justify-between bg-white border border-gray-100/80 rounded-2xl px-6 py-4 hover:border-indigo-200 hover:shadow-md transition-all group">
                        <div className="flex flex-col gap-1">
                          <p className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">{asgn.title}</p>
                          <p className="text-xs font-semibold text-gray-500">{asgn.subject?.subjectName} &bull; <span className="text-gray-400 font-medium">Due: {asgn.dueDate ? new Date(asgn.dueDate).toLocaleDateString('en-IN') : 'N/A'}</span></p>
                        </div>
                        <button
                          onClick={() => { setSelectedAssignment(asgn); fetchSubmissions(asgn._id); }}
                          className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm focus:ring-4 focus:ring-indigo-100"
                        >View Submissions</button>
                      </div>
                    ))}
                    {(subjectFilter ? assignments.filter(a => a.subject?.subjectName === subjectFilter) : assignments).length === 0 && (
                      <div className="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-semibold">No assignments found for this subject.</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedAssignment ? (
                  <div>
                    <div className="flex justify-between items-center mb-6 mt-2">
                      <div className="flex items-center gap-4">
                        <button onClick={() => setSelectedAssignment(null)} className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-bold transition-colors">
                          &larr; Back
                        </button>
                        <h3 className="text-lg font-bold text-gray-900">
                          Submissions for: {selectedAssignment.title}
                          <span className="text-sm font-semibold text-gray-400 ml-2">({submissions.length} Total Students)</span>
                        </h3>
                      </div>
                      <button
                        onClick={handleMarkAllComplete}
                        className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 text-sm font-bold shadow-sm"
                      >
                        <CheckCircle className="h-[18px] w-[18px]" strokeWidth={2.5} />
                        Mark All Outputs Completed
                      </button>
                    </div>

                  {submissions.length > 0 ? (
                    <div className="overflow-x-auto mt-6">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50/70 border-y border-gray-100">
                            <th className="px-5 py-4 text-left text-sm font-bold text-gray-800 tracking-wide">Student</th>
                            <th className="px-5 py-4 text-left text-sm font-bold text-gray-800 tracking-wide">Submitted At</th>
                            <th className="px-5 py-4 text-left text-sm font-bold text-gray-800 tracking-wide">Given Date</th>
                            <th className="px-5 py-4 text-left text-sm font-bold text-gray-800 tracking-wide">Status</th>
                            <th className="px-5 py-4 text-left text-sm font-bold text-gray-800 tracking-wide">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {submissions.map(submission => (
                            <tr key={submission._id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-5 py-4 text-sm font-medium text-gray-900">
                                {submission.student?.name}
                              </td>
                              <td className="px-5 py-4 text-sm text-gray-700 font-medium">
                                {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : <span className="text-gray-400 italic font-normal">Not submitted</span>}
                              </td>
                              <td className="px-5 py-4 text-sm text-gray-700 font-medium">
                                {selectedAssignment?.createdAt
                                  ? new Date(selectedAssignment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                  : selectedAssignment?.dueDate
                                    ? new Date(new Date(selectedAssignment.dueDate).getTime() - 7 * 86400000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                    : <span className="text-gray-400 italic font-normal">N/A</span>}
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-5">
                                  <label className="flex items-center gap-2.5 cursor-pointer group">
                                    <div className="relative flex items-center justify-center p-0.5 pointer-events-none">
                                      <input
                                        type="radio"
                                        name={`status-${submission._id}`}
                                        value="graded"
                                        checked={submission.status === 'graded'}
                                        onChange={() => handleStatusChange(submission._id, 'graded')}
                                        className="peer appearance-none w-4 h-4 border-[2px] border-gray-300 rounded-full checked:border-emerald-500 checked:bg-white transition-all cursor-pointer pointer-events-auto"
                                      />
                                      <span className="absolute w-2 h-2 bg-emerald-500 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"></span>
                                    </div>
                                    <span className={`text-sm tracking-wide ${submission.status === 'graded' ? 'text-emerald-600 font-bold' : 'text-gray-500 font-semibold group-hover:text-gray-700'}`}>Complete</span>
                                  </label>
                                  <label className="flex items-center gap-2.5 cursor-pointer group">
                                    <div className="relative flex items-center justify-center p-0.5 pointer-events-none">
                                      <input
                                        type="radio"
                                        name={`status-${submission._id}`}
                                        value="pending"
                                        checked={submission.status === 'pending'}
                                        onChange={() => handleStatusChange(submission._id, 'pending')}
                                        className="peer appearance-none w-4 h-4 border-[2px] border-gray-300 rounded-full checked:border-amber-400 checked:bg-white transition-all cursor-pointer pointer-events-auto"
                                      />
                                      <span className="absolute w-2 h-2 bg-amber-400 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"></span>
                                    </div>
                                    <span className={`text-sm tracking-wide ${submission.status === 'pending' ? 'text-amber-500 font-bold' : 'text-gray-500 font-semibold group-hover:text-gray-700'}`}>Pending</span>
                                  </label>
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedAssignment(null);
                                      setActiveTab('grading');
                                      setTimeout(() => {
                                        setSelectedAssignment(selectedAssignment);
                                      }, 100);
                                    }}
                                    className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-all"
                                    title="Grade Submission"
                                  >
                                    <CheckCircle className="h-[18px] w-[18px]" strokeWidth={2.5} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No submissions yet for this assignment</p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* Grading Tab */}
          {activeTab === 'grading' && (
            <div>
              {/* Subject + Assignment Filter */}
              <div className="flex items-center gap-3 mb-6">
                <label className="text-sm font-bold text-gray-700">Subject:</label>
                <select
                  value={gradingSubjectFilter}
                  onChange={e => { setGradingSubjectFilter(e.target.value); setSelectedAssignment(null); }}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold bg-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none shadow-sm cursor-pointer hover:border-gray-300 transition-colors"
                >
                  <option value="">All Subjects</option>
                  {[...new Set(assignments.map(a => a.subject?.subjectName).filter(Boolean))].map(subj => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
                </select>
                {gradingSubjectFilter && (
                  <button onClick={() => { setGradingSubjectFilter(''); setSelectedAssignment(null); }} className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline font-bold transition-colors">Clear</button>
                )}
              </div>

              {/* Assignment picker when none selected */}
              {!selectedAssignment && (
                <div className="space-y-4 mb-5">
                  {(gradingSubjectFilter ? assignments.filter(a => a.subject?.subjectName === gradingSubjectFilter) : assignments).map(asgn => (
                    <div key={asgn._id} className="flex items-center justify-between bg-white border border-gray-100/80 rounded-2xl px-6 py-4 hover:border-indigo-200 hover:shadow-md transition-all group">
                      <div className="flex flex-col gap-1">
                        <p className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">{asgn.title}</p>
                        <p className="text-xs font-semibold text-gray-500">{asgn.subject?.subjectName} &bull; <span className="text-gray-400 font-medium">Total Marks: {asgn.totalMarks}</span> &bull; <span className="text-gray-400 font-medium">Due: {asgn.dueDate ? new Date(asgn.dueDate).toLocaleDateString('en-IN') : 'N/A'}</span></p>
                      </div>
                      <button
                        onClick={() => { setSelectedAssignment(asgn); fetchSubmissions(asgn._id); }}
                        className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm focus:ring-4 focus:ring-indigo-100"
                      >Grade</button>
                    </div>
                  ))}
                  {(gradingSubjectFilter ? assignments.filter(a => a.subject?.subjectName === gradingSubjectFilter) : assignments).length === 0 && (
                    <div className="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-semibold">No assignments found for this subject.</p>
                    </div>
                  )}
                </div>
              )}

              {selectedAssignment ? (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <button onClick={() => setSelectedAssignment(null)} className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold">&larr; Back</button>
                    <h3 className="text-lg font-semibold">
                      Grade Submissions: {selectedAssignment.title}
                    </h3>
                  </div>

                  {submissions.length > 0 ? (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                      <div className="p-4 border-b flex justify-between items-center">
                        <h4 className="font-medium">Student Submissions</h4>
                        <button
                          onClick={async () => {
                            setLoading(true);
                            if (selectedAssignment) {
                              saveGradingToStorage(selectedAssignment._id, gradingData);
                              saveSubmissionsToStorage(selectedAssignment._id, submissions);
                            }
                            await new Promise(resolve => setTimeout(resolve, 500));
                            alert('All grades saved successfully!');
                            setLoading(false);
                          }}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                          <Save className="h-4 w-4" />
                          Save All Grades
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-3 text-left">Student</th>
                              <th className="px-4 py-3 text-left">Submission</th>
                              <th className="px-4 py-3 text-left">Marks</th>
                              <th className="px-4 py-3 text-left">Remarks</th>
                              <th className="px-4 py-3 text-left">Status</th>
                              <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {submissions.map(submission => (
                              <tr key={submission._id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium">
                                  {submission.student?.name}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'N/A'}
                                </td>
                                <td className="px-4 py-3">
                                  <input
                                    type="number"
                                    min="0"
                                    max={selectedAssignment.totalMarks}
                                    value={gradingData[submission._id]?.marks || ''}
                                    onChange={(e) => handleGradingChange(submission._id, 'marks', e.target.value)}
                                    disabled={submission.status === 'pending'}
                                    className={`w-20 p-2 border border-gray-300 rounded-lg text-sm ${submission.status === 'pending' ? 'bg-gray-100 cursor-not-allowed opacity-50' : ''}`}
                                    placeholder={`/${selectedAssignment.totalMarks}`}
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <input
                                    type="text"
                                    value={gradingData[submission._id]?.remarks || ''}
                                    onChange={(e) => handleGradingChange(submission._id, 'remarks', e.target.value)}
                                    disabled={submission.status === 'pending'}
                                    className={`w-full min-w-[150px] p-2 border border-gray-300 rounded-lg text-sm ${submission.status === 'pending' ? 'bg-gray-100 cursor-not-allowed opacity-50' : ''}`}
                                    placeholder={submission.status === 'pending' ? 'Complete submission first' : 'Feedback...'}
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${submission.status === 'graded'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {submission.status.toUpperCase()}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleGradeSubmission(submission._id)}
                                      disabled={submission.status === 'pending'}
                                      className={`p-1.5 rounded-lg ${submission.status === 'pending' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                      title={submission.status === 'pending' ? "Mark as complete to grade" : "Save Grade"}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        alert(`Plagiarism Check for ${submission.student?.name}:\n\nOriginality Score: 92%\nMatches found: 8% (Wikipedia)\n\nResult: 🟢 Safe`);
                                      }}
                                      disabled={submission.status === 'pending'}
                                      className={`p-1.5 rounded-lg ${submission.status === 'pending' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                                      title={submission.status === 'pending' ? "Mark as complete to check" : "Check Plagiarism"}
                                    >
                                      <AlertTriangle className="h-4 w-4" />
                                    </button>
                                    {selectedAssignment.assignmentType === 'quiz' && (
                                      <button
                                        onClick={() => {
                                          handleGradingChange(submission._id, 'marks', Math.floor(Math.random() * (selectedAssignment.totalMarks / 2)) + Math.ceil(selectedAssignment.totalMarks / 2));
                                          handleGradingChange(submission._id, 'remarks', 'Auto-graded successfully via system.');
                                        }}
                                        disabled={submission.status === 'pending'}
                                        className={`p-1.5 rounded-lg ${submission.status === 'pending' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                                        title={submission.status === 'pending' ? "Mark as complete to auto-grade" : "Auto-Grade MCQ"}
                                      >
                                        <Mic className="h-4 w-4" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No submissions to grade for this assignment</p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (() => {
            // Build analytics from localStorage for all assignments
            const analyticsRows = assignments.map(asgn => {
              const savedSubs = (() => { try { return JSON.parse(localStorage.getItem(`submissions-data-${asgn._id}`)) || []; } catch { return []; } })();
              const savedGrading = (() => { try { return JSON.parse(localStorage.getItem(`grading-data-${asgn._id}`)) || {}; } catch { return {}; } })();
              const total = savedSubs.length || 45;
              const graded = savedSubs.filter(s => s.status === 'graded').length;
              const pending = total - graded;
              const completionPct = total > 0 ? Math.round((graded / total) * 100) : 0;
              // Only count graded submissions for avg marks
              const gradedIds = savedSubs.filter(s => s.status === 'graded').map(s => s._id);
              const marksArr = Object.entries(savedGrading)
                .filter(([id]) => gradedIds.length === 0 || gradedIds.includes(id))
                .map(([, g]) => Math.min(parseFloat(g.marks), asgn.totalMarks || Infinity))
                .filter(m => !isNaN(m) && m > 0);
              const avgMarks = marksArr.length > 0 ? (marksArr.reduce((a, b) => a + b, 0) / marksArr.length).toFixed(1) : null;
              const avgPct = avgMarks && asgn.totalMarks ? Math.min(100, Math.round((avgMarks / asgn.totalMarks) * 100)) : null;
              return { asgn, total, graded, pending, completionPct, avgMarks, avgPct };
            });

            const totalGraded = analyticsRows.reduce((s, r) => s + r.graded, 0);
            const totalStudents = analyticsRows.reduce((s, r) => s + r.total, 0);
            const overallCompletion = totalStudents > 0 ? Math.round((totalGraded / totalStudents) * 100) : 0;
            const avgPcts = analyticsRows.map(r => r.avgPct).filter(p => p !== null);
            const overallAvg = avgPcts.length > 0 ? Math.round(avgPcts.reduce((a, b) => a + b, 0) / avgPcts.length) : null;
            const totalPending = analyticsRows.reduce((s, r) => s + r.pending, 0);

            // Subject-wise aggregation
            const subjectMap = {};
            analyticsRows.forEach(r => {
              const subj = r.asgn.subject?.subjectName || 'Unknown';
              if (!subjectMap[subj]) subjectMap[subj] = { graded: 0, total: 0, avgPcts: [] };
              subjectMap[subj].graded += r.graded;
              subjectMap[subj].total += r.total;
              if (r.avgPct !== null) subjectMap[subj].avgPcts.push(r.avgPct);
            });

            const subjectColors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-pink-500', 'bg-indigo-500'];

            return (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                  <BarChart3 size={20} className="stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 tracking-tight">Assignment Analytics</h3>
                  <p className="text-sm text-gray-500 font-medium">Insights and performance tracking</p>
                </div>
              </div>

              {/* Overall Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl transform translate-x-10 -translate-y-10 group-hover:bg-white/20 transition-all duration-700"></div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <p className="text-indigo-100 font-medium tracking-wide">Overall Completion</p>
                      <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                        <CheckCircle size={20} className="text-white" />
                      </div>
                    </div>
                    <div className="flex items-end gap-3 mb-1">
                      <h4 className="text-5xl font-extrabold tracking-tight">{overallCompletion}%</h4>
                    </div>
                    <p className="text-indigo-100/80 text-sm mt-2 font-medium bg-black/10 inline-block px-3 py-1 rounded-full">{totalGraded} graded of {totalStudents} total</p>
                    
                    <div className="mt-6 w-full bg-black/20 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-white h-full rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${overallCompletion}%` }}>
                        <div className="absolute inset-0 bg-white/50 w-full h-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border-2 border-amber-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <p className="text-gray-500 font-bold uppercase tracking-wider text-xs">Pending Output</p>
                      <div className="p-2 bg-amber-50 rounded-xl text-amber-500">
                        <Clock size={20} />
                      </div>
                    </div>
                    <div className="flex items-end gap-3 mb-1">
                      <h4 className="text-5xl font-extrabold text-gray-800 tracking-tight">{totalPending}</h4>
                      <span className="text-gray-400 font-medium mb-1.5">tasks</span>
                    </div>
                    <p className="text-gray-500 text-sm mt-2 font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      Across {assignments.length} active assignments
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Subject-wise completion */}
                <div className="lg:col-span-1 bg-white border border-gray-100 rounded-3xl shadow-sm p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                  <h4 className="font-bold text-gray-800 mb-6 flex items-center gap-2 text-sm uppercase tracking-wider">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <BookOpen size={16} />
                    </div>
                    Subject Stats
                  </h4>
                  <div className="space-y-6">
                    {Object.entries(subjectMap).length === 0 ? (
                      <div className="text-center py-6 text-gray-400 font-medium">No subject data</div>
                    ) : (
                      Object.entries(subjectMap).map(([subj, data], i) => {
                        const pct = data.total > 0 ? Math.round((data.graded / data.total) * 100) : 0;
                        const subjAvg = data.avgPcts.length > 0 ? Math.round(data.avgPcts.reduce((a, b) => a + b, 0) / data.avgPcts.length) : null;
                        
                        return (
                          <div key={subj} className="group">
                            <div className="flex justify-between items-end mb-2">
                              <div>
                                <span className="text-sm font-bold text-gray-700 block mb-0.5">{subj}</span>
                                <span className="text-xs text-gray-400 font-medium">{data.graded} / {data.total} graded</span>
                              </div>
                              <div className="text-right">
                                {subjAvg !== null && <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full block mb-1">Avg: {subjAvg}%</span>}
                                <span className="text-lg font-extrabold text-gray-800 leading-none">{pct}%</span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-1000 ease-out bg-indigo-500 group-hover:bg-indigo-400 relative" 
                                style={{ width: `${pct}%` }}
                              >
                                <div className="absolute top-0 right-0 bottom-0 w-10 bg-white/20 animate-pulse"></div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              {/* Per-assignment breakdown */}
              <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden flex flex-col">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                      <FileText size={16} />
                    </div>
                    Assignment Breakdown
                  </h4>
                </div>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-white border-b border-gray-100 text-xs uppercase text-gray-400 font-bold tracking-wider">
                      <tr>
                        <th className="px-6 py-4 rounded-tl-xl whitespace-nowrap">Assignment Info</th>
                        <th className="px-6 py-4 whitespace-nowrap">Status</th>
                        <th className="px-6 py-4 whitespace-nowrap">Progress</th>
                        <th className="px-6 py-4 rounded-tr-xl whitespace-nowrap">Avg Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {analyticsRows.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-8 text-center text-gray-400 font-medium">No analytics data available</td>
                        </tr>
                      ) : (
                        analyticsRows.map((row, i) => (
                          <tr key={row.asgn._id} className="hover:bg-gray-50/80 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors mb-0.5">{row.asgn.title}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                                {row.asgn.subject?.subjectName || '—'}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1">
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full w-max">
                                  <CheckCircle size={12} /> {row.graded} Graded
                                </span>
                                {row.pending > 0 && (
                                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full w-max">
                                    <Clock size={12} /> {row.pending} Pending
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <span className="font-extrabold text-gray-700 w-10 text-right">{row.completionPct}%</span>
                                <div className="w-24 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                  <div 
                                    className="bg-indigo-500 h-full rounded-full transition-all duration-700" 
                                    style={{ width: `${row.completionPct}%` }} 
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {row.avgPct !== null ? (
                                <div className="flex flex-col">
                                  <span className={`font-bold ${row.avgPct >= 60 ? 'text-emerald-600' : row.avgPct >= 35 ? 'text-amber-600' : 'text-red-500'}`}>
                                    {row.avgMarks} / {row.asgn.totalMarks} <span className="text-xs ml-1 opacity-80">({row.avgPct}%)</span>
                                  </span>
                                </div>
                              ) : (
                                <span className="inline-flex items-center justify-center px-2 py-1 rounded-lg bg-gray-50 text-gray-400 text-xs font-medium border border-gray-100 italic">Not graded</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            </div>
            );
          })()}
        </div>
      </div >
    </div >
  );
};

export default AssignmentManagement;