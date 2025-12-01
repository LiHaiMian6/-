export type Role = 'teacher' | 'finance' | 'admin';
export type UserRole = Role;

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar?: string;
  subject?: Subject; // Added for teacher subject isolation
}

export type Subject = 'Chinese' | 'Math' | 'English' | 'Physics' | 'Chemistry';

export interface Student {
  id: string;
  name: string;
  phone: string;
  grade?: string; // 年级：高一、高二、高三、初一、初二、初三
  // Personalized price overrides (Subject -> Price per hour)
  priceOverrides?: Partial<Record<Subject, number>>;
  // Payment tracking
  paymentStatus?: 'pending' | 'paid' | 'partial';
  paidAmount?: number;
  lastPaymentDate?: string;
}

export interface Class {
  id: string;
  name: string;
  teacherId: string;
  teacherName: string;
  subject: Subject;
  grade: string;
  studentIds: string[];
  createdAt: string;
}

export interface ClassSchedule {
  id: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  subject: Subject;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  location?: string;
  createdAt: string;
}

export interface CourseRecord {
  id: string;
  studentId: string;
  studentName: string;
  subject: Subject;
  teacherId: string;
  teacherName: string;
  date: string; // YYYY-MM-DD
  hours: number;
  status: 'pending' | 'approved' | 'invoiced';
}

export type DiscountType = 'reduction' | 'fixed';

export interface MultiSubjectRule {
  threshold: number;
  type: DiscountType;
  amount: number;
}

export interface PricingRule {
  basePrice: Record<Subject, number>;
  discounts: {
    hoursThreshold: number; // e.g., 20 hours
    hoursDiscount: number; // e.g., 0.9 (10% off)
    multiSubject: MultiSubjectRule[];
  };
}

export interface LogEntry {
  id: string;
  actorId?: string; // Added
  actorName: string;
  action: string;
  timestamp: string;
  details: string;
}

export interface BillingResult {
  student: Student;
  totalHours: number;
  subjectCounts: Record<Subject, number>;
  originalCost: number;
  appliedDiscounts: string[];
  finalCost: number;
  records: CourseRecord[];
  subjectDetails: Record<Subject, string[]>; // List of dates for each subject
}