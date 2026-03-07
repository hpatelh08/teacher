import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Login from './components/Auth/Login';
import Dashboard from './components/Teacher/Dashboard';
import AttendanceManagement from './components/Teacher/AttendanceManagement';
import AssignmentManagement from './components/Teacher/AssignmentManagement';
import ExamManagement from './components/Teacher/ExamManagement';
import StudyMaterials from './components/Teacher/StudyMaterials';
import Communication from './components/Teacher/Communication';
import LeaveManagement from './components/Teacher/LeaveManagement';
import PerformanceAnalytics from './components/Teacher/PerformanceAnalytics';
import Reports from './components/Teacher/Reports';
import MarksManagement from './components/Teacher/MarksManagement';
import ClassManagement from './components/Teacher/ClassManagement';
import StudentManagement from './components/Teacher/StudentManagement';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    // Get user data if available
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard currentUser={currentUser} onLogout={handleLogout} onNavigate={setCurrentPage} />;
      case 'attendance':
        return <AttendanceManagement currentUser={currentUser} />;
      case 'class':
        return <ClassManagement currentUser={currentUser} />;
      case 'assignments':
        return <AssignmentManagement currentUser={currentUser} />;
      case 'exams':
        return <ExamManagement currentUser={currentUser} />;
      case 'study-materials':
        return <StudyMaterials currentUser={currentUser} />;
      case 'communication':
        return <Communication currentUser={currentUser} />;
      case 'students':
        return <StudentManagement currentUser={currentUser} />;
      case 'reports':
        return <Reports currentUser={currentUser} />;
      case 'leave':
        return <LeaveManagement />;
      case 'analytics':
        return <PerformanceAnalytics currentUser={currentUser} />;
      default:
        return <Dashboard currentUser={currentUser} onLogout={handleLogout} onNavigate={setCurrentPage} />;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentPage('dashboard');
  };

  if (!isLoggedIn) {
    return <Login />;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#f0f2f8] via-[#e8ecf4] to-[#f0f2f8]">
      <Sidebar setCurrentPage={setCurrentPage} onLogout={handleLogout} currentPage={currentPage} />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-h-screen">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
