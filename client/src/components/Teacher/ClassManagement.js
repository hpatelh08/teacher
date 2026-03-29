import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, BookOpen, Calendar, Edit, Eye, Trash2, Plus, Clock, Book, FileText, Target, User, Monitor, MapPin } from 'lucide-react';

const ClassManagement = ({ currentUser }) => {
  const getSubjectColorObj = (subjectName) => {
    const s = String(subjectName || '').toLowerCase();
    if (s.includes('english')) return { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-500' };
    if (s.includes('math')) return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' };
    if (s.includes('sci') || s.includes('evs') || s.includes('bio')) return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' };
    if (s.includes('gujarati')) return { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', dot: 'bg-pink-500' };
    if (s.includes('hindi')) return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' };
    if (s.includes('draw') || s.includes('art')) return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-500' };
    if (s.includes('pt') || s.includes('phys')) return { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', dot: 'bg-purple-500' };
    if (s.includes('moral')) return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', dot: 'bg-slate-500' };
    return { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', dot: 'bg-teal-500' };
  };

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [activeTab, setActiveTab] = useState('classes');
  const [timetable, setTimetable] = useState({});
  const [lessonPlans, setLessonPlans] = useState([]);
  const [virtualLinks, setVirtualLinks] = useState({});
  const [loading, setLoading] = useState(true);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showSeatingModal, setShowSeatingModal] = useState(false);
  const [lessonFormData, setLessonFormData] = useState({
    subject: '',
    topic: '',
    date: '',
    duration: '',
    objectives: '',
    materials: ''
  });
  const [seatingArrangement, setSeatingArrangement] = useState({
    rows: 5,
    cols: 6,
    students: []
  });
  const [syllabusMap, setSyllabusMap] = useState({});
  const [expandedSyllabusSubjectKey, setExpandedSyllabusSubjectKey] = useState(null);

  const extractClassNumber = (value) => {
    const match = String(value || '').match(/\d+/);
    return match ? match[0] : '';
  };

  const normalizeSection = (value) => String(value || '').trim().toUpperCase();

  const getAssignedSection = () => {
    const division = normalizeSection(currentUser?.division);
    if (division) return division;

    const classValue = String(currentUser?.assignedClass || '');
    const match = classValue.match(/[-\s]([A-Za-z])$/);
    return match ? normalizeSection(match[1]) : '';
  };

  const findAssignedClass = (availableClasses = []) => {
    if (!availableClasses.length) return null;

    const assignedClassNumber = extractClassNumber(currentUser?.assignedClass);
    const assignedSection = getAssignedSection();

    if (!assignedClassNumber) return availableClasses[0];

    const exactMatch = availableClasses.find((cls) =>
      extractClassNumber(cls.className) === assignedClassNumber &&
      (!assignedSection || normalizeSection(cls.section) === assignedSection)
    );
    if (exactMatch) return exactMatch;

    return availableClasses.find((cls) =>
      extractClassNumber(cls.className) === assignedClassNumber
    ) || availableClasses[0];
  };

  const getChapterTitlesBySubject = (subjectName = '') => {
    const normalizedSubject = String(subjectName).toLowerCase();

    if (normalizedSubject.includes('math')) {
      return [
        'Rational Numbers',
        'Linear Equations in One Variable',
        'Understanding Quadrilaterals',
        'Practical Geometry',
        'Data Handling',
        'Squares and Square Roots',
        'Cubes and Cube Roots',
        'Comparing Quantities',
        'Algebraic Expressions and Identities',
        'Mensuration',
        'Exponents and Powers',
        'Direct and Inverse Proportions'
      ];
    }

    if (normalizedSubject.includes('science')) {
      return [
        'Crop Production and Management',
        'Microorganisms: Friend and Foe',
        'Synthetic Fibres and Plastics',
        'Materials: Metals and Non-Metals',
        'Coal and Petroleum',
        'Combustion and Flame',
        'Conservation of Plants and Animals',
        'Cell: Structure and Functions',
        'Reproduction in Animals',
        'Reaching the Age of Adolescence',
        'Force and Pressure',
        'Friction'
      ];
    }

    if (normalizedSubject.includes('english')) {
      return [
        'The Best Christmas Present in the World',
        'The Tsunami',
        'Glimpses of the Past',
        'Bepin Choudhury\'s Lapse of Memory',
        'The Summit Within',
        'This is Jody\'s Fawn',
        'A Visit to Cambridge',
        'A Short Monsoon Diary',
        'The Great Stone Face - I',
        'The Great Stone Face - II'
      ];
    }

    return Array.from({ length: 10 }, (_, idx) => `Chapter ${idx + 1}`);
  };

  const getSubTopicTitlesBySubject = (subjectName = '') => {
    const normalizedSubject = String(subjectName).toLowerCase();

    if (normalizedSubject.includes('math')) {
      return ['Concepts', 'Solved Examples', 'Practice Questions'];
    }
    if (normalizedSubject.includes('science')) {
      return ['Theory', 'Diagrams / Activity', 'Worksheet'];
    }
    if (normalizedSubject.includes('english')) {
      return ['Reading', 'Grammar', 'Writing Practice'];
    }
    return ['Concepts', 'Class Notes', 'Assessment'];
  };

  const buildSyllabusForSubject = (subjectName = '') => {
    const chapterTitles = getChapterTitlesBySubject(subjectName);
    const subTopicTitles = getSubTopicTitlesBySubject(subjectName);
    const completedChapterCount = Math.max(1, Math.floor(chapterTitles.length * 0.6));

    return chapterTitles.map((chapterTitle, chapterIdx) => {
      const chapterCompleted = chapterIdx < completedChapterCount;
      const chapterInProgress = chapterIdx === completedChapterCount;

      return {
        chapterName: `Chapter ${chapterIdx + 1}: ${chapterTitle}`,
        subTopics: subTopicTitles.map((subTopicTitle, subTopicIdx) => ({
          name: subTopicTitle,
          completed: chapterCompleted || (chapterInProgress && subTopicIdx === 0)
        }))
      };
    });
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.assignedClass) {
      const classToSelect = findAssignedClass(classes);
      if (classToSelect) {
        setSelectedClass(classToSelect);
        // Also switch to timetable tab by default when class is auto-selected
        setActiveTab('timetable');
      }
    }
  }, [classes, currentUser]);

  useEffect(() => {
    if (selectedClass) {
      fetchTimetable();
      fetchLessonPlans();
      fetchSeatingArrangement();
    }
  }, [selectedClass]);

  useEffect(() => {
    if (!selectedClass?.subjects?.length) {
      setSyllabusMap({});
      setExpandedSyllabusSubjectKey(null);
      return;
    }

    const classKey = `${selectedClass.className}-${selectedClass.section}`;
    const savedSyllabus = localStorage.getItem(`syllabus-data-${classKey}`);

    if (savedSyllabus) {
      try {
        const parsed = JSON.parse(savedSyllabus);
        setSyllabusMap(parsed);
      } catch {
        const generatedSyllabus = {};
        selectedClass.subjects.forEach((subject, index) => {
          const subjectKey = `${subject.subjectName}-${index}`;
          generatedSyllabus[subjectKey] = buildSyllabusForSubject(subject.subjectName);
        });
        setSyllabusMap(generatedSyllabus);
        localStorage.setItem(`syllabus-data-${classKey}`, JSON.stringify(generatedSyllabus));
      }
    } else {
      const generatedSyllabus = {};
      selectedClass.subjects.forEach((subject, index) => {
        const subjectKey = `${subject.subjectName}-${index}`;
        generatedSyllabus[subjectKey] = buildSyllabusForSubject(subject.subjectName);
      });
      setSyllabusMap(generatedSyllabus);
      localStorage.setItem(`syllabus-data-${classKey}`, JSON.stringify(generatedSyllabus));
    }

    setExpandedSyllabusSubjectKey(`${selectedClass.subjects[0].subjectName}-0`);
  }, [selectedClass]);

  const saveSyllabusToLocalStorage = (updatedMap) => {
    if (selectedClass) {
      const classKey = `${selectedClass.className}-${selectedClass.section}`;
      localStorage.setItem(`syllabus-data-${classKey}`, JSON.stringify(updatedMap));
    }
  };

  const toggleSubTopicCompletion = (subjectKey, chapterIndex, subTopicIndex) => {
    setSyllabusMap(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      const subTopic = updated[subjectKey][chapterIndex].subTopics[subTopicIndex];
      subTopic.completed = !subTopic.completed;
      saveSyllabusToLocalStorage(updated);
      return updated;
    });
  };

  const toggleChapterCompletion = (subjectKey, chapterIndex) => {
    setSyllabusMap(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      const chapter = updated[subjectKey][chapterIndex];
      const allCompleted = chapter.subTopics.every(st => st.completed);
      chapter.subTopics.forEach(st => { st.completed = !allCompleted; });
      saveSyllabusToLocalStorage(updated);
      return updated;
    });
  };

  const fetchClasses = async () => {
    const assignedClassNumber = extractClassNumber(currentUser?.assignedClass) || '8';
    const assignedSection = getAssignedSection() || 'B';

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/teacher/classes', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 1000
      });
      const mockFallbackClass = {
        _id: 'mock_class_id',
        className: `${assignedClassNumber}th`,
        section: assignedSection,
        subjects: [
          { subjectName: 'Mathematics', teacher: { name: 'Mr. Sharma' } },
          { subjectName: 'Science', teacher: { name: 'Mrs. Gupta' } },
          { subjectName: 'English', teacher: { name: 'Mr. Patel' } }
        ],
        students: Array.from({ length: 30 }, (_, i) => ({
          _id: `stu_${i}`,
          name: `Student ${i + 1}`
        }))
      };

      // Filter for classes 8, 9, 10
      let filteredClasses = (response.data.data || []).filter(cls =>
        ['8', '9', '10'].includes(extractClassNumber(cls.className))
      );

      if (assignedClassNumber) {
        const teacherClasses = filteredClasses.filter((cls) =>
          extractClassNumber(cls.className) === assignedClassNumber &&
          (!assignedSection || normalizeSection(cls.section) === assignedSection)
        );

        if (teacherClasses.length > 0) {
          filteredClasses = teacherClasses;
        }
      }

      if (!filteredClasses || filteredClasses.length === 0) {
        filteredClasses = [mockFallbackClass];
      }

      setClasses(filteredClasses);
      const classToSelect = findAssignedClass(filteredClasses);
      if (classToSelect) setSelectedClass(classToSelect);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching classes:', error);
      const mockFallbackClass = {
        _id: 'mock_class_id',
        className: `${assignedClassNumber}th`,
        section: assignedSection,
        subjects: [
          { subjectName: 'Mathematics', teacher: { name: 'Mr. Sharma' } },
          { subjectName: 'Science', teacher: { name: 'Mrs. Gupta' } },
          { subjectName: 'English', teacher: { name: 'Mr. Patel' } }
        ],
        students: Array.from({ length: 30 }, (_, i) => ({
          _id: `stu_${i}`,
          name: `Student ${i + 1}`
        }))
      };
      setClasses([mockFallbackClass]);
      if (!selectedClass) setSelectedClass(mockFallbackClass);
      setLoading(false);
    }
  };

  const fetchTimetable = async () => {
    // Mock timetable data - in a real app, this would come from an API
    const mockTimetable = {
      Monday: [
        { period: '1', subject: 'English', time: '07:00 - 07:40', teacher: 'Sunita Singh' },
        { period: '2', subject: 'Mathematics', time: '07:40 - 08:20', teacher: 'Priya Verma' },
        { period: '3', subject: 'Moral Science', time: '08:20 - 09:00', teacher: 'Kavita Rao' },
        { period: '4', subject: 'Environmental Studies (EVS)', time: '09:20 - 10:00', teacher: 'Amit Gupta' },
        { period: '5', subject: 'Gujarati', time: '10:00 - 10:40', teacher: 'Heena Desai' },
        { period: '6', subject: 'Physical Education (PT)', time: '10:40 - 11:20', teacher: 'Sanjay Kulkarni' },
        { period: '7', subject: 'General Knowledge (GK)', time: '11:20 - 12:00', teacher: 'Sunita Singh' },
      ],
      Tuesday: [
        { period: '1', subject: 'Hindi', time: '07:00 - 07:40', teacher: 'Manoj Trivedi' },
        { period: '2', subject: 'Mathematics', time: '07:40 - 08:20', teacher: 'Priya Verma' },
        { period: '3', subject: 'Drawing / Art', time: '08:20 - 09:00', teacher: 'Anita Mehta' },
        { period: '4', subject: 'General Knowledge (GK)', time: '09:20 - 10:00', teacher: 'Sunita Singh' },
        { period: '5', subject: 'Gujarati', time: '10:00 - 10:40', teacher: 'Heena Desai' },
        { period: '6', subject: 'Physical Education (PT)', time: '10:40 - 11:20', teacher: 'Sanjay Kulkarni' },
        { period: '7', subject: 'Moral Science', time: '11:20 - 12:00', teacher: 'Kavita Rao' },
      ],
      Wednesday: [
        { period: '1', subject: 'Moral Science', time: '07:00 - 07:40', teacher: 'Kavita Rao' },
        { period: '2', subject: 'English', time: '07:40 - 08:20', teacher: 'Sunita Singh' },
        { period: '3', subject: 'Mathematics', time: '08:20 - 09:00', teacher: 'Priya Verma' },
        { period: '4', subject: 'Drawing / Art', time: '09:20 - 10:00', teacher: 'Anita Mehta' },
        { period: '5', subject: 'Environmental Studies (EVS)', time: '10:00 - 10:40', teacher: 'Amit Gupta' },
        { period: '6', subject: 'Hindi', time: '10:40 - 11:20', teacher: 'Manoj Trivedi' },
        { period: '7', subject: 'General Knowledge (GK)', time: '11:20 - 12:00', teacher: 'Sunita Singh' },
      ],
      Thursday: [
        { period: '1', subject: 'English', time: '07:00 - 07:40', teacher: 'Sunita Singh' },
        { period: '2', subject: 'Hindi', time: '07:40 - 08:20', teacher: 'Manoj Trivedi' },
        { period: '3', subject: 'General Knowledge (GK)', time: '08:20 - 09:00', teacher: 'Sunita Singh' },
        { period: '4', subject: 'Drawing / Art', time: '09:20 - 10:00', teacher: 'Anita Mehta' },
        { period: '5', subject: 'Physical Education (PT)', time: '10:00 - 10:40', teacher: 'Sanjay Kulkarni' },
        { period: '6', subject: 'Mathematics', time: '10:40 - 11:20', teacher: 'Priya Verma' },
        { period: '7', subject: 'Environmental Studies (EVS)', time: '11:20 - 12:00', teacher: 'Amit Gupta' },
      ],
      Friday: [
        { period: '1', subject: 'Physical Education (PT)', time: '07:00 - 07:40', teacher: 'Sanjay Kulkarni' },
        { period: '2', subject: 'Mathematics', time: '07:40 - 08:20', teacher: 'Priya Verma' },
        { period: '3', subject: 'General Knowledge (GK)', time: '08:20 - 09:00', teacher: 'Sunita Singh' },
        { period: '4', subject: 'Hindi', time: '09:20 - 10:00', teacher: 'Manoj Trivedi' },
        { period: '5', subject: 'Drawing / Art', time: '10:00 - 10:40', teacher: 'Anita Mehta' },
        { period: '6', subject: 'Moral Science', time: '10:40 - 11:20', teacher: 'Kavita Rao' },
        { period: '7', subject: 'English', time: '11:20 - 12:00', teacher: 'Sunita Singh' },
      ],
      Saturday: [
        { period: '1', subject: 'English', time: '07:00 - 07:40', teacher: 'Sunita Singh' },
        { period: '2', subject: 'Gujarati', time: '07:40 - 08:20', teacher: 'Heena Desai' },
        { period: '3', subject: 'Drawing / Art', time: '08:20 - 09:00', teacher: 'Anita Mehta' },
        { period: '4', subject: 'Moral Science', time: '09:20 - 10:00', teacher: 'Kavita Rao' },
        { period: '5', subject: 'Physical Education (PT)', time: '10:00 - 10:40', teacher: 'Sanjay Kulkarni' },
        { period: '6', subject: 'General Knowledge (GK)', time: '10:40 - 11:20', teacher: 'Sunita Singh' }
      ]
    };
    setTimetable(mockTimetable);
  };

  const fetchLessonPlans = async () => {
    // Mock lesson plans - in a real app, this would come from an API
    const mockPlans = [
      {
        id: 1,
        subject: 'Mathematics',
        topic: 'Algebra Basics',
        date: '2024-01-15',
        duration: '60 mins',
        objectives: 'Understand basic algebraic equations',
        materials: 'Textbook, Calculator'
      },
      {
        id: 2,
        subject: 'Science',
        topic: 'Cell Biology',
        date: '2024-01-16',
        duration: '45 mins',
        objectives: 'Learn about cell structure',
        materials: 'Microscope, Worksheets'
      }
    ];
    setLessonPlans(mockPlans);
  };

  const fetchSeatingArrangement = async () => {
    // Mock seating arrangement - in a real app, this would come from an API
    if (selectedClass) {
      const students = selectedClass.students || [];
      setSeatingArrangement(prev => ({
        ...prev,
        students: students.slice(0, prev.rows * prev.cols)
      }));
    }
  };

  const handleCreateLessonPlan = async (e) => {
    e.preventDefault();

    const newPlan = {
      id: Date.now(),
      ...lessonFormData,
      date: new Date().toISOString().split('T')[0]
    };

    setLessonPlans([...lessonPlans, newPlan]);
    setLessonFormData({
      subject: '',
      topic: '',
      date: '',
      duration: '',
      objectives: '',
      materials: ''
    });
    setShowLessonModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLessonFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSeatingInputChange = (e) => {
    const { name, value } = e.target;
    setSeatingArrangement(prev => ({
      ...prev,
      [name]: parseInt(value)
    }));
  };

  const generateSeatingChart = () => {
    if (selectedClass) {
      const students = [...selectedClass.students];
      const totalSeats = seatingArrangement.rows * seatingArrangement.cols;
      const filledSeats = students.slice(0, totalSeats);

      // Pad with empty seats if needed
      const seats = [...filledSeats];
      while (seats.length < totalSeats) {
        seats.push(null);
      }

      setSeatingArrangement(prev => ({
        ...prev,
        students: seats
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-soft border border-gray-100/80">
        <div>
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Class Management</h2>
          <p className="text-sm text-gray-500 mt-0.5 font-medium">Manage classes, timetable & syllabus</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100/80 overflow-hidden">
        <div className="flex border-b border-gray-100 bg-gray-50/50 p-1.5 gap-1">
          <button
            onClick={() => setActiveTab('classes')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${activeTab === 'classes'
              ? 'bg-white text-indigo-700 shadow-md'
              : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
          >
            <Users className="h-4 w-4" />
            Assigned Classes
          </button>
          <button
            onClick={() => {
              if (classes.length > 0 && !selectedClass) {
                // Auto-select the first class if none is selected
                setSelectedClass(findAssignedClass(classes) || classes[0]);
              }
              setActiveTab('timetable');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${activeTab === 'timetable'
              ? 'bg-white text-indigo-700 shadow-md'
              : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
          >
            <Clock className="h-4 w-4" />
            Timetable
          </button>
          <button
            onClick={() => {
              if (classes.length > 0 && !selectedClass) {
                setSelectedClass(findAssignedClass(classes) || classes[0]);
              }
              setActiveTab('lesson-plans');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${activeTab === 'lesson-plans'
              ? 'bg-white text-indigo-700 shadow-md'
              : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
          >
            <FileText className="h-4 w-4" />
            Lesson Plans
          </button>
          <button
            onClick={() => {
              if (classes.length > 0 && !selectedClass) {
                setSelectedClass(findAssignedClass(classes) || classes[0]);
              }
              setActiveTab('syllabus');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${activeTab === 'syllabus'
              ? 'bg-white text-indigo-700 shadow-md'
              : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
          >
            <Target className="h-4 w-4" />
            Syllabus Tracking
          </button>
        </div>

        <div className="p-6">
          {/* Classes Tab */}
          {activeTab === 'classes' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map(cls => (
                  <div
                    key={cls._id}
                    className={`group relative bg-white/70 backdrop-blur-xl rounded-2xl p-6 cursor-pointer transition-all duration-300 border ${selectedClass?._id === cls._id ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'border-gray-100/80 shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:border-indigo-200'
                      }`}
                    onClick={() => setSelectedClass(cls)}
                  >
                    {/* Decorative gradient blob */}
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="flex justify-between items-start mb-5 relative z-10">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-2xl font-black bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            {cls.className.replace(/1th/g, '1st').replace(/2th/g, '2nd').replace(/3th/g, '3rd')}
                          </h3>
                          <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-md border border-indigo-100 shadow-sm">
                            Section {cls.section}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors shadow-sm bg-white border border-indigo-50">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors shadow-sm bg-white border border-emerald-50">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 mb-6 relative z-10">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                          <Users className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Students</p>
                          <p className="text-sm font-semibold text-gray-700">{cls.students?.length || 0}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-500">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Subjects</p>
                          <p className="text-sm font-semibold text-gray-700">{cls.subjects?.length || 0}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 col-span-2">
                        <div className="p-2 bg-amber-50 rounded-lg text-amber-500">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Room</p>
                          <p className="text-sm font-semibold text-gray-700">{cls.roomNumber || 'Not Assigned'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100/80 relative z-10">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Subjects & Teachers</h4>
                      <div className="space-y-2 max-h-36 overflow-y-auto pr-2 custom-scrollbar">
                        {cls.subjects?.length > 0 ? cls.subjects.map((subject, index) => (
                          <div key={index} className="flex justify-between items-center bg-gray-50/50 p-2 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                            <span className="text-sm font-semibold text-gray-700">{subject.subjectName}</span>
                            <span className="text-xs font-medium bg-white px-2 py-1 rounded-md text-gray-500 shadow-sm border border-gray-100">
                              {subject.teacher?.name || 'TBA'}
                            </span>
                          </div>
                        )) : (
                          <p className="text-sm text-gray-400 italic">No subjects assigned yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {classes.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No classes assigned to you</p>
                  <p className="text-gray-400 text-sm mt-2">Contact administrator to assign classes</p>
                </div>
              )}
            </div>
          )}

          {/* Timetable Tab */}
          {activeTab === 'timetable' && selectedClass && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Weekly Timetable</h3>
                    <p className="text-sm font-medium text-gray-500">
                      {selectedClass.className.replace(/1th/g, '1st').replace(/2th/g, '2nd').replace(/3th/g, '3rd')} - Section {selectedClass.section}
                    </p>
                  </div>
                </div>

                {/* Subject Colors Legend */}
                {(() => {
                  const allSubjects = new Set();
                  Object.values(timetable).forEach(periods => {
                    periods.forEach(p => p.subject && allSubjects.add(p.subject));
                  });
                  return allSubjects.size > 0 && (
                    <div className="flex flex-wrap gap-3 pb-2">
                      {Array.from(allSubjects).map(subject => {
                        const style = getSubjectColorObj(subject);
                        return (
                          <div key={subject} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${style.bg} ${style.border}`}>
                            <div className={`w-2.5 h-2.5 rounded-full ${style.dot}`}></div>
                            <span className={`text-xs font-bold ${style.text}`}>{subject}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Grid Timetable */}
                {Object.keys(timetable).length > 0 ? (
                  <div className="overflow-x-auto pb-4">
                    {(() => {
                      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                      const activeDays = days.filter(d => timetable[d] && timetable[d].length > 0);
                      
                      // Map unique periods and their times
                      const periodMap = new Map();
                      Object.values(timetable).forEach(periods => {
                        periods.forEach(p => {
                          if (!periodMap.has(p.period)) {
                            periodMap.set(p.period, p.time);
                          }
                        });
                      });
                      
                      const sortedPeriods = Array.from(periodMap.keys()).sort((a, b) => parseInt(a) - parseInt(b));

                      return (
                        <div className="min-w-[800px] border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                          {/* Header Row */}
                          <div className="grid grid-cols-[120px_1fr_1fr_1fr_1fr_1fr_1fr] bg-[#5a67d8] text-white">
                            <div className="px-4 py-4 font-bold text-sm border-r border-[#4c51bf]">TIME</div>
                            {activeDays.map((day, i) => (
                              <div key={day} className={`px-4 py-4 font-bold text-sm text-center uppercase ${i !== activeDays.length - 1 ? 'border-r border-[#4c51bf]' : ''}`}>
                                {day}
                              </div>
                            ))}
                          </div>

                          {/* Rows */}
                          <div className="flex flex-col">
                            {sortedPeriods.map((period, index) => {
                              // Breaks after period 3 and 4 based on new times constraints
                              const isBreakAfter = period === '3' || period === '4';
                              
                              return (
                                <React.Fragment key={`period-${period}`}>
                                  <div className="grid grid-cols-[120px_1fr_1fr_1fr_1fr_1fr_1fr] border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                                    <div className="px-4 py-6 border-r border-gray-100 flex flex-col justify-center bg-gray-50/30">
                                      <span className="font-bold text-[#5a67d8] text-sm">Lecture {period}</span>
                                      <span className="text-xs text-gray-500 font-medium mt-1">{periodMap.get(period)}</span>
                                    </div>
                                    
                                    {activeDays.map((day, i) => {
                                      const lesson = timetable[day]?.find(p => p.period === period);
                                      const style = lesson ? getSubjectColorObj(lesson.subject) : null;
                                      
                                      return (
                                        <div key={`${day}-${period}`} className={`p-3 border-r border-gray-100 last:border-0 flex items-center justify-center`}>
                                          {lesson ? (
                                            <div className={`w-full h-full min-h-[70px] rounded-xl border ${style.bg} ${style.border} flex flex-col items-center justify-center p-2 text-center transition-transform hover:-translate-y-0.5 hover:shadow-sm`}>
                                              <span className={`font-bold text-[13px] ${style.text} leading-tight`}>{lesson.subject}</span>
                                              <span className="text-[11px] text-gray-500 font-medium mt-1.5">{lesson.teacher}</span>
                                            </div>
                                          ) : (
                                            <span className="text-gray-300">-</span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {isBreakAfter && index < sortedPeriods.length - 1 && (
                                    <div className="grid grid-cols-[120px_1fr_1fr_1fr_1fr_1fr_1fr] border-b border-gray-100 bg-[#f8fafc]">
                                      <div className="px-4 py-3 border-r border-gray-100 flex flex-col items-center justify-center">
                                        <span className="font-bold text-[#5a67d8] text-sm">Break ☕</span>
                                        <span className="text-xs text-gray-500 font-medium whitespace-nowrap">{period === '3' ? '09:00 - 09:20' : '09:40 - 10:00'}</span>
                                      </div>
                                      
                                      {/* Fill empty cells to preserve grid column borders */}
                                      {activeDays.map((day, i) => (
                                        <div key={`break-${day}-${period}`} className="flex items-center justify-center border-r border-gray-100 last:border-0 text-sm font-semibold text-gray-400">
                                          {period === '3' && (i === 1 || i === 2 || i === 3 || i === 4) ? '-' : (period === '4' && i === activeDays.length - 1 ? '-' : 'Break ☕ - 20 min')}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-gray-200 border-dashed">
                    <Calendar className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium text-lg">No timetable available</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lesson Plans Tab */}
          {activeTab === 'lesson-plans' && selectedClass && (
            <div className="space-y-8">
              <div className="flex items-center justify-between bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Lesson Plans
                    </h3>
                    <p className="text-sm font-medium text-gray-500">
                      Curriculum plans for {selectedClass.className.replace(/1th/g, '1st').replace(/2th/g, '2nd').replace(/3th/g, '3rd')} - Section {selectedClass.section}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLessonModal(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-5 py-2.5 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg font-semibold text-sm hover:-translate-y-0.5"
                >
                  <Plus className="h-4 w-4" />
                  Create Plan
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lessonPlans.map(plan => {
                  const style = getSubjectColorObj(plan.subject);
                  return (
                    <div key={plan.id} className={`group relative bg-white rounded-2xl border ${style.border} shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col`}>
                      {/* Top accent line */}
                      <div className={`h-1.5 w-full ${style.bg} top-0 absolute`}></div>
                      
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                          <div className={`px-3 py-1 rounded-md text-xs font-bold ${style.bg} ${style.text} flex items-center gap-1.5`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></div>
                            {plan.subject}
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100 shadow-sm">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            {plan.date}
                          </div>
                        </div>
                        
                        <h4 className="text-lg font-black text-gray-800 mb-4 group-hover:text-gray-900 leading-tight">
                          {plan.topic}
                        </h4>
                        
                        <div className="space-y-4 mb-4 flex-1">
                          <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                              <Target className="w-3.5 h-3.5" /> Objectives
                            </p>
                            <p className="text-sm font-medium text-gray-700 leading-relaxed">
                              {plan.objectives}
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2.5 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
                              <div className="p-1.5 bg-white rounded-lg shadow-sm border border-gray-100 text-amber-500">
                                <Clock className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Duration</p>
                                <p className="text-sm font-semibold text-gray-700">{plan.duration}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2.5 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100 overflow-hidden">
                              <div className="p-1.5 bg-white rounded-lg shadow-sm border border-gray-100 text-blue-500 shrink-0">
                                <Book className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Materials</p>
                                <p className="text-sm font-semibold text-gray-700 truncate" title={plan.materials}>{plan.materials}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card Actions Footer */}
                        <div className="pt-4 mt-auto border-t border-gray-100 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button className="flex items-center justify-center p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100" title="Edit Plan">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="flex items-center justify-center p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100" title="Delete Plan">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {lessonPlans.length === 0 && (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-gray-200 border-dashed">
                  <FileText className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium text-lg mb-1">No lesson plans found</p>
                  <p className="text-gray-400 text-sm">Create a new lesson plan to get started.</p>
                </div>
              )}
            </div>
          )}

          {/* Syllabus Tracking Tab */}
          {activeTab === 'syllabus' && selectedClass && (
            <div className="space-y-8">
              <div className="flex items-center justify-between bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Syllabus Tracking
                    </h3>
                    <p className="text-sm font-medium text-gray-500">
                      Progress for {selectedClass.className.replace(/1th/g, '1st').replace(/2th/g, '2nd').replace(/3th/g, '3rd')} - Section {selectedClass.section}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                {selectedClass.subjects?.map((subject, index) => {
                  const subjectKey = `${subject.subjectName}-${index}`;
                  const chapters = syllabusMap[subjectKey] || [];
                  const totalChapters = chapters.length;
                  const completedChapters = chapters.filter((chapter) =>
                    chapter.subTopics.every((subTopic) => subTopic.completed)
                  ).length;
                  const remainingChapters = totalChapters - completedChapters;
                  const progressPercentage = totalChapters > 0
                    ? Math.round((completedChapters / totalChapters) * 100)
                    : 0;
                  const isExpanded = expandedSyllabusSubjectKey === subjectKey;
                  const style = getSubjectColorObj(subject.subjectName);

                  return (
                    <div key={subjectKey} className={`bg-white rounded-2xl border ${isExpanded ? style.border : 'border-gray-100'} shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-300`}>
                      <div 
                        onClick={() => setExpandedSyllabusSubjectKey(isExpanded ? null : subjectKey)}
                        className={`p-5 cursor-pointer flex flex-col gap-4 ${isExpanded ? style.bg.replace('50', '50/50') : 'hover:bg-gray-50/50'} transition-colors`}
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="text-lg font-black text-gray-800">{subject.subjectName}</h4>
                          <span className={`text-sm font-black ${style.text}`}>{progressPercentage}% Complete</span>
                        </div>

                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden shadow-inner">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${style.dot}`}
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex gap-4">
                            <span className="text-xs font-bold text-gray-500 bg-white px-2.5 py-1 rounded-md border border-gray-100 shadow-sm">
                              Completed: <span className="text-gray-800">{completedChapters}</span> / {totalChapters}
                            </span>
                            <span className="text-xs font-bold text-gray-500 bg-white px-2.5 py-1 rounded-md border border-gray-100 shadow-sm">
                              Remaining: <span className="text-gray-800">{remainingChapters}</span>
                            </span>
                          </div>
                          
                          <button className={`text-xs font-bold px-4 py-1.5 rounded-lg border ${isExpanded ? `${style.border} bg-white shadow-sm` : 'border-gray-200 bg-white hover:bg-gray-50 shadow-sm'} transition-colors`}>
                            {isExpanded ? 'Hide Chapters' : 'View Chapters'}
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-5 pb-5 pt-2 border-t border-gray-100 bg-[#f8fafc]">
                          <div className="space-y-3 mt-3">
                            {chapters.map((chapter, chapterIndex) => {
                              const completedSubTopics = chapter.subTopics.filter((subTopic) => subTopic.completed).length;
                              const isChapterCompleted = completedSubTopics === chapter.subTopics.length;
                              const isChapterInProgress = !isChapterCompleted && completedSubTopics > 0;
                              
                              const chapterStatusClass = isChapterCompleted
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                : isChapterInProgress
                                  ? 'bg-amber-50 text-amber-600 border border-amber-200'
                                  : 'bg-white text-gray-500 border border-gray-200';
                                  
                              const chapterStatusText = isChapterCompleted
                                ? 'Completed'
                                : isChapterInProgress
                                  ? 'In Progress'
                                  : 'Pending';

                              return (
                                <div key={`${subjectKey}-chapter-${chapterIndex}`} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                                  <div className="flex justify-between items-center border-b border-gray-50 pb-3 mb-3">
                                    <p className="font-bold text-gray-800 text-sm">{chapter.chapterName}</p>
                                    <div className="flex items-center gap-3">
                                      <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md font-bold shadow-sm ${chapterStatusClass}`}>
                                        {chapterStatusText}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); toggleChapterCompletion(subjectKey, chapterIndex); }}
                                        className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-lg font-bold transition-all shadow-sm ${
                                          isChapterCompleted
                                            ? 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-red-500'
                                            : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20'
                                        }`}
                                      >
                                        {isChapterCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                                      </button>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {chapter.subTopics.map((subTopic, subTopicIndex) => (
                                      <button
                                        key={`${subjectKey}-chapter-${chapterIndex}-subtopic-${subTopicIndex}`}
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); toggleSubTopicCompletion(subjectKey, chapterIndex, subTopicIndex); }}
                                        className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all text-left group ${
                                          subTopic.completed 
                                            ? 'bg-emerald-50/50 border-emerald-100' 
                                            : 'bg-gray-50/50 border-transparent hover:bg-white hover:border-gray-200 hover:shadow-sm'
                                        }`}
                                      >
                                        <div className={`mt-0.5 w-4 h-4 rounded-[4px] border-[1.5px] flex items-center justify-center shrink-0 transition-colors ${
                                          subTopic.completed 
                                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                                            : 'bg-white border-gray-300 group-hover:border-emerald-400'
                                        }`}>
                                          {subTopic.completed && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        <span className={`text-sm font-semibold leading-tight ${
                                          subTopic.completed ? 'text-gray-400 line-through decoration-emerald-300/50' : 'text-gray-700'
                                        }`}>
                                          {subTopic.name}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lesson Plan Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Lesson Plan</h3>
            <form onSubmit={handleCreateLessonPlan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select
                  name="subject"
                  value={lessonFormData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Subject</option>
                  {selectedClass?.subjects?.map((subject, idx) => (
                    <option key={idx} value={subject.subjectName}>{subject.subjectName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                <input
                  type="text"
                  name="topic"
                  value={lessonFormData.topic}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Lesson topic"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={lessonFormData.duration}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 60 mins"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Learning Objectives</label>
                <textarea
                  name="objectives"
                  value={lessonFormData.objectives}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="What should students learn?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Materials Needed</label>
                <input
                  type="text"
                  name="materials"
                  value={lessonFormData.materials}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Books, equipment, etc."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Lesson Plan
                </button>
                <button
                  type="button"
                  onClick={() => setShowLessonModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManagement;
