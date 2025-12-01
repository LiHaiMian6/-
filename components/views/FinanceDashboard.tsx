import React from 'react';
import { CourseRecord, Student, PricingRule } from '../../types';
import { Calendar, Plus, UserX, Edit, TrendingUp, DollarSign } from 'lucide-react';
import { AddStudentModal } from '../modals/AddStudentModal';
import { DeleteStudentModal } from '../modals/DeleteStudentModal';
import { EditStudentModal } from '../modals/EditStudentModal';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SUBJECT_CN } from '../../constants';

interface FinanceDashboardProps {
    records: CourseRecord[];
    pricingRules: PricingRule;
    students: Student[];
    onAddStudent: (name: string, phone: string) => void;
    currentMonth: string;
    setCurrentMonth: (month: string) => void;
    setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
    setRecords: React.Dispatch<React.SetStateAction<CourseRecord[]>>;
}

const COLORS = ['#3b82f6', '#ec4899', '#f59e0b', '#6366f1', '#10b981'];

export const FinanceDashboard: React.FC<FinanceDashboardProps> = ({
    records,
    pricingRules,
    students,
    onAddStudent,
    currentMonth,
    setCurrentMonth,
    setStudents,
    setRecords
}) => {
    const [isAddStudentOpen, setIsAddStudentOpen] = React.useState(false);
    const [isDeleteStudentOpen, setIsDeleteStudentOpen] = React.useState(false);
    const [isEditStudentOpen, setIsEditStudentOpen] = React.useState(false);

    const handleDeleteStudent = (studentId: string) => {
        setStudents(prev => prev.filter(s => s.id !== studentId));
        setRecords(prev => prev.filter(r => r.studentId !== studentId));
    };

    const handleUpdateStudent = (studentId: string, updates: Partial<Student>) => {
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, ...updates } : s));
    };

    const monthlyRecords = records.filter(r => r.date.startsWith(currentMonth));

    const totalHours = monthlyRecords.reduce((acc, r) => acc + r.hours, 0);
    const totalRevenue = monthlyRecords.reduce((acc, r) => {
        const subject = r.subject;
        const basePrice = pricingRules.basePrice[subject] || 60;
        return acc + (r.hours * basePrice);
    }, 0);

    const uniqueStudents = new Set(monthlyRecords.map(r => r.studentId)).size;

    // Subject breakdown for pie chart
    const subjectStats = monthlyRecords.reduce((acc, r) => {
        const subjectName = SUBJECT_CN[r.subject] || r.subject;
        if (!acc[subjectName]) {
            acc[subjectName] = { hours: 0, revenue: 0 };
        }
        const basePrice = pricingRules.basePrice[r.subject] || 60;
        acc[subjectName].hours += r.hours;
        acc[subjectName].revenue += r.hours * basePrice;
        return acc;
    }, {} as Record<string, { hours: number; revenue: number }>);

    const subjectChartData = Object.entries(subjectStats).map(([name, data]) => ({
        name,
        value: data.revenue,
        hours: data.hours
    }));

    // Teacher breakdown for bar chart
    const teacherStats = monthlyRecords.reduce((acc, r) => {
        if (!acc[r.teacherName]) {
            acc[r.teacherName] = { hours: 0, revenue: 0 };
        }
        const basePrice = pricingRules.basePrice[r.subject] || 60;
        acc[r.teacherName].hours += r.hours;
        acc[r.teacherName].revenue += r.hours * basePrice;
        return acc;
    }, {} as Record<string, { hours: number; revenue: number }>);

    const teacherChartData = Object.entries(teacherStats).map(([name, data]) => ({
        name,
        hours: data.hours,
        revenue: data.revenue
    })).sort((a, b) => b.revenue - a.revenue);

    // Grade distribution
    const gradeStats = monthlyRecords.reduce((acc, r) => {
        const student = students.find(s => s.id === r.studentId);
        const grade = student?.grade || '未知';
        if (!acc[grade]) {
            acc[grade] = 0;
        }
        acc[grade] += r.hours;
        return acc;
    }, {} as Record<string, number>);

    const gradeChartData = Object.entries(gradeStats).map(([name, value]) => ({ name, value }));

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Calendar className="text-slate-600" size={20} />
                    <span className="text-sm font-medium text-slate-700">当前月份:</span>
                    <input
                        type="month"
                        value={currentMonth}
                        onChange={(e) => setCurrentMonth(e.target.value)}
                        className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsAddStudentOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                    >
                        <Plus size={18} /> 添加学生
                    </button>
                    <button
                        onClick={() => setIsEditStudentOpen(true)}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
                    >
                        <Edit size={18} /> 编辑学生
                    </button>
                    <button
                        onClick={() => setIsDeleteStudentOpen(true)}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                    >
                        <UserX size={18} /> 删除学生
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-slate-600 to-slate-700 p-6 rounded-xl shadow-lg text-white">
                    <h3 className="text-sm font-medium opacity-90 mb-2">本月总课时</h3>
                    <p className="text-4xl font-bold">{totalHours}h</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-xl shadow-lg text-white">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium opacity-90">本月营收（预估）</h3>
                        <DollarSign size={20} className="opacity-80" />
                    </div>
                    <p className="text-4xl font-bold">¥{totalRevenue.toFixed(0)}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium opacity-90">本月学生数</h3>
                        <TrendingUp size={20} className="opacity-80" />
                    </div>
                    <p className="text-4xl font-bold">{uniqueStudents}</p>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Teacher Revenue Bar Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">教师营收统计</h3>
                    {teacherChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={teacherChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="revenue" fill="#10b981" name="营收 (¥)" />
                                <Bar dataKey="hours" fill="#3b82f6" name="课时 (h)" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-slate-400">
                            本月暂无数据
                        </div>
                    )}
                </div>

                {/* Subject Revenue Pie Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">科目营收分布</h3>
                    {subjectChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={subjectChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={90}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {subjectChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `¥${value.toFixed(0)}`} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-slate-400">
                            本月暂无数据
                        </div>
                    )}
                </div>
            </div>

            {/* Grade Distribution */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">年级课时分布</h3>
                {gradeChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={gradeChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#8b5cf6" name="课时" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-[250px] flex items-center justify-center text-slate-400">
                        本月暂无数据
                    </div>
                )}
            </div>

            <AddStudentModal
                isOpen={isAddStudentOpen}
                onClose={() => setIsAddStudentOpen(false)}
                onAdd={onAddStudent}
            />
            <EditStudentModal
                isOpen={isEditStudentOpen}
                onClose={() => setIsEditStudentOpen(false)}
                students={students}
                onUpdate={handleUpdateStudent}
            />
            <DeleteStudentModal
                isOpen={isDeleteStudentOpen}
                onClose={() => setIsDeleteStudentOpen(false)}
                students={students}
                onDelete={handleDeleteStudent}
            />
        </div>
    );
};
