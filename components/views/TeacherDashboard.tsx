import React from 'react';
import { CourseRecord, Student, User } from '../../types';
import { Calendar, TrendingUp, Users, Clock } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SUBJECT_CN } from '../../constants';

interface TeacherDashboardProps {
    records: CourseRecord[];
    currentUser: User;
    students: Student[];
    onAddStudent: (name: string, phone: string) => void;
    setRecords: React.Dispatch<React.SetStateAction<CourseRecord[]>>;
    currentMonth: string;
    setCurrentMonth: (month: string) => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
    records,
    currentUser,
    students,
    currentMonth,
    setCurrentMonth
}) => {
    // Filter records by month and teacher's subject
    const monthlyRecords = records.filter(r =>
        r.date.startsWith(currentMonth) && r.subject === currentUser.subject
    );

    // Calculate stats
    const totalHours = monthlyRecords.reduce((acc, r) => acc + r.hours, 0);
    const uniqueStudents = new Set(monthlyRecords.map(r => r.studentId)).size;
    const totalRecords = monthlyRecords.length;

    // Group by student for chart
    const studentStats = monthlyRecords.reduce((acc, r) => {
        if (!acc[r.studentName]) {
            acc[r.studentName] = { name: r.studentName, hours: 0, count: 0 };
        }
        acc[r.studentName].hours += r.hours;
        acc[r.studentName].count += 1;
        return acc;
    }, {} as Record<string, { name: string; hours: number; count: number }>);

    const studentChartData = Object.values(studentStats)
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 8);

    // Group by date for trend
    const dateStats = monthlyRecords.reduce((acc, r) => {
        const day = r.date.split('-')[2];
        if (!acc[day]) {
            acc[day] = 0;
        }
        acc[day] += r.hours;
        return acc;
    }, {} as Record<string, number>);

    const trendChartData = Object.entries(dateStats)
        .map(([day, hours]) => ({ day: `${day}日`, hours }))
        .sort((a, b) => parseInt(a.day) - parseInt(b.day));

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
            {/* Month Selector */}
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
                <div className="text-sm text-slate-600">
                    科目: <span className="font-semibold text-blue-600">{SUBJECT_CN[currentUser.subject || 'Math']}</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium opacity-90">本月总课时</h3>
                        <Clock size={20} className="opacity-80" />
                    </div>
                    <p className="text-4xl font-bold">{totalHours}h</p>
                    <p className="text-xs opacity-75 mt-2">{totalRecords} 条记录</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-xl shadow-lg text-white">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium opacity-90">本月学生数</h3>
                        <Users size={20} className="opacity-80" />
                    </div>
                    <p className="text-4xl font-bold">{uniqueStudents}</p>
                    <p className="text-xs opacity-75 mt-2">活跃学生</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium opacity-90">平均课时/人</h3>
                        <TrendingUp size={20} className="opacity-80" />
                    </div>
                    <p className="text-4xl font-bold">{uniqueStudents > 0 ? (totalHours / uniqueStudents).toFixed(1) : 0}h</p>
                    <p className="text-xs opacity-75 mt-2">本月平均</p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Student Hours Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">学生课时统计 (Top 8)</h3>
                    {studentChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={studentChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="hours" fill="#3b82f6" name="课时" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-slate-400">
                            本月暂无数据
                        </div>
                    )}
                </div>

                {/* Grade Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">年级分布</h3>
                    {gradeChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={gradeChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {gradeChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-slate-400">
                            本月暂无数据
                        </div>
                    )}
                </div>
            </div>

            {/* Trend Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">本月课时趋势</h3>
                {trendChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={trendChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="hours" fill="#10b981" name="课时" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-[250px] flex items-center justify-center text-slate-400">
                        本月暂无数据
                    </div>
                )}
            </div>
        </div>
    );
};
