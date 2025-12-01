import { User, Student, PricingRule, CourseRecord, LogEntry, Subject } from './types';

export const SUBJECT_CN: Record<Subject, string> = {
  Chinese: '语文',
  Math: '数学',
  English: '英语',
  Physics: '物理',
  Chemistry: '化学',
};

export const ROLE_CN: Record<string, string> = {
  teacher: '教师',
  finance: '财务',
  admin: '管理员',
};

export const INITIAL_PRICING: PricingRule = {
  basePrice: {
    Chinese: 60,
    Math: 60,
    English: 60,
    Physics: 60,
    Chemistry: 60,
  },
  discounts: {
    hoursThreshold: 20,
    hoursDiscount: 0.9,
    multiSubject: [
      { threshold: 2, type: 'reduction', amount: 10 },
      { threshold: 3, type: 'fixed', amount: 50 },
    ],
  },
};

export const MOCK_USERS: User[] = [
  { id: 't1', name: '李老师', role: 'teacher', subject: 'Math' },
  { id: 't2', name: '王老师', role: 'teacher', subject: 'English' },
  { id: 'f1', name: '方财务', role: 'finance' },
  { id: 'a1', name: '管理员', role: 'admin' },
];

export const MOCK_STUDENTS: Student[] = [
  { id: 's1', name: '张三', phone: '13800138000' },
  { id: 's2', name: '李四', phone: '13900139000', priceOverrides: { Math: 50 } },
  { id: 's3', name: '王五', phone: '13700137000' },
  { id: 's4', name: '赵六', phone: '13600136000' },
  { id: 's5', name: '钱七', phone: '13500135000' },
];

const generateMockRecords = (): CourseRecord[] => {
  const records: CourseRecord[] = [];
  const subjects: Subject[] = ['Chinese', 'Math', 'English', 'Physics', 'Chemistry'];
  const teachers = MOCK_USERS.filter(u => u.role === 'teacher');

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Generate data for current month and previous month
  for (let i = 0; i < 50; i++) {
    const student = MOCK_STUDENTS[i % MOCK_STUDENTS.length];
    const subject = subjects[i % subjects.length];
    const teacher = teachers[i % teachers.length];

    // Randomize date within current month
    const day = (i % 28) + 1;
    const month = i < 30 ? currentMonth : (currentMonth === 1 ? 12 : currentMonth - 1);
    const year = i < 30 ? currentYear : (currentMonth === 1 ? currentYear - 1 : currentYear);

    records.push({
      id: `rec_${i}`,
      studentId: student.id,
      studentName: student.name,
      subject: subject,
      teacherId: teacher.id,
      teacherName: teacher.name,
      date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      hours: Math.floor(Math.random() * 3) + 1, // 1-3 hours
      status: i < 30 ? 'invoiced' : 'approved',
    });
  }
  return records;
};

export const INITIAL_RECORDS: CourseRecord[] = generateMockRecords();

export const INITIAL_LOGS: LogEntry[] = [
  { id: 'l1', actorName: '系统', action: '初始化', timestamp: new Date().toISOString(), details: '系统已初始化' },
];