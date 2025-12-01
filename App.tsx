import React, { useState } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { User, CourseRecord, PricingRule, LogEntry, Student, UserRole, Subject, Class, ClassSchedule } from './types';
import { INITIAL_RECORDS, INITIAL_PRICING, INITIAL_LOGS, MOCK_STUDENTS, MOCK_USERS, ROLE_CN } from './constants';

// Views
import { LoginScreen } from './components/views/LoginScreen';
import { TeacherUploadView } from './components/views/TeacherUploadView';
import { TeacherRecordList } from './components/views/TeacherRecordList';
import { TeacherDashboard } from './components/views/TeacherDashboard';
import { TeacherClassManagement } from './components/views/TeacherClassManagement';
import { TeacherScheduleView } from './components/views/TeacherScheduleView';
import { AllRecordsView } from './components/views/AllRecordsView';
import { FinanceDashboard } from './components/views/FinanceDashboard';
import { BillingView } from './components/views/BillingView';
import { PricingConfigView } from './components/views/PricingConfigView';
import { AdminLogsView } from './components/views/AdminLogsView';
import { AdminUserView } from './components/views/AdminUserView';
import { PaymentTrackingView } from './components/views/PaymentTrackingView';
import { MonthlyRevenueView } from './components/views/MonthlyRevenueView';

import { useLocalStorage } from './components/hooks/useLocalStorage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');

  // App Data State - Persisted
  const [records, setRecords] = useLocalStorage<CourseRecord[]>('app_records_v2', INITIAL_RECORDS);
  const [pricingRules, setPricingRules] = useLocalStorage<PricingRule>('app_pricing_v2', INITIAL_PRICING);
  const [logs, setLogs] = useLocalStorage<LogEntry[]>('app_logs_v2', INITIAL_LOGS);
  const [students, setStudents] = useLocalStorage<Student[]>('app_students_v2', MOCK_STUDENTS);
  const [users, setUsers] = useLocalStorage<User[]>('app_users_v2', MOCK_USERS);
  const [classes, setClasses] = useLocalStorage<Class[]>('app_classes_v2', []);
  const [schedules, setSchedules] = useLocalStorage<ClassSchedule[]>('app_schedules_v2', []);

  const [selectedStudentForBilling, setSelectedStudentForBilling] = useState<string | null>(null);

  // Shared month state for all roles
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()} -${String(now.getMonth() + 1).padStart(2, '0')} `;
  });

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // Set default view based on role
    if (user.role === 'teacher') setCurrentView('dashboard');
    else if (user.role === 'finance') setCurrentView('dashboard');
    else if (user.role === 'admin') setCurrentView('admin-users');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const addLog = (action: string, details: string) => {
    const newLog: LogEntry = {
      id: `log_${Date.now()} `,
      timestamp: new Date().toISOString(),
      actorId: currentUser?.id || 'system',
      actorName: currentUser?.name || 'System',
      action,
      details
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const handleAddStudent = (name: string, phone: string) => {
    const newStudent: Student = {
      id: `s_${Date.now()} `,
      name,
      phone
    };
    setStudents(prev => [...prev, newStudent]);
    addLog('用户操作', `添加了新学生: ${name} `);
  };

  const handleAddUser = (name: string, role: UserRole, subject?: Subject) => {
    const newUser: User = {
      id: `u_${Date.now()} `,
      name,
      role,
      subject
    };
    setUsers(prev => [...prev, newUser]);
    addLog('用户操作', `添加了新用户: ${name} (${ROLE_CN[role]})`);
  };

  const handleViewInvoice = (studentId: string) => {
    setSelectedStudentForBilling(studentId);
    setCurrentView('billing');
  };

  // --- Render Switcher ---
  const renderContent = () => {
    switch (currentView) {
      // Teacher
      case 'dashboard':
        if (currentUser?.role === 'finance') {
          return <FinanceDashboard records={records} pricingRules={pricingRules} students={students} onAddStudent={handleAddStudent} currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} setStudents={setStudents} setRecords={setRecords} />;
        } else if (currentUser?.role === 'teacher') {
          return <TeacherDashboard records={records} currentUser={currentUser!} students={students} onAddStudent={handleAddStudent} setRecords={setRecords} currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} />;
        } else {
          // Default for other roles if they land on dashboard, e.g., admin
          return <TeacherDashboard records={records} currentUser={currentUser!} students={students} onAddStudent={handleAddStudent} setRecords={setRecords} currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} />;
        }
      case 'upload':
        return <TeacherUploadView currentUser={currentUser!} setRecords={setRecords} addLog={addLog} onNavigate={setCurrentView} students={students} setStudents={setStudents} />;
      case 'my-records':
        return <TeacherRecordList records={records} currentUser={currentUser!} students={students} setRecords={setRecords} currentMonth={currentMonth} />;
      case 'class-management':
        return <TeacherClassManagement currentUser={currentUser!} students={students} classes={classes} setClasses={setClasses} />;
      case 'schedule-management':
        return <TeacherScheduleView currentUser={currentUser!} classes={classes} schedules={schedules} setSchedules={setSchedules} />;

      // Finance
      case 'all-records':
        return <AllRecordsView records={records} students={students} currentMonth={currentMonth} setRecords={setRecords} />;
      case 'billing':
        return <BillingView students={students} records={records} pricingRules={pricingRules} initialStudentId={selectedStudentForBilling} onNavigate={setCurrentView} />;
      case 'payment-tracking':
        return <PaymentTrackingView students={students} records={records} pricingRules={pricingRules} setStudents={setStudents} onViewInvoice={handleViewInvoice} />;

      // Admin / Shared Config
      case 'config':
        return <PricingConfigView pricingRules={pricingRules} setPricingRules={setPricingRules} addLog={addLog} />;
      case 'admin-users':
        return <AdminUserView users={users} onAddUser={handleAddUser} setUsers={setUsers} />;
      case 'monthly-revenue':
        return <MonthlyRevenueView students={students} records={records} pricingRules={pricingRules} />;
      case 'logs':
        return <AdminLogsView logs={logs} />;

      default:
        return <div className="text-center py-20 text-slate-400">此视图暂未实现</div>;
    }
  };

  if (!currentUser) {
    return <LoginScreen onLogin={setCurrentUser} users={users} />;
  }

  return (
    <DashboardLayout
      user={currentUser}
      currentView={currentView}
      onViewChange={setCurrentView}
      onLogout={handleLogout}
    >
      {renderContent()}
    </DashboardLayout>
  );
}