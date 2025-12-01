import React, { useState, useMemo } from 'react';
import { TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { Student, CourseRecord, PricingRule, Subject } from '../../types';
import { calculateStudentBill } from '../../services/billingService';
import { SUBJECT_CN } from '../../constants';

interface MonthlyRevenueViewProps {
    students: Student[];
    records: CourseRecord[];
    pricingRules: PricingRule;
}

export const MonthlyRevenueView: React.FC<MonthlyRevenueViewProps> = ({
    students,
    records,
    pricingRules
}) => {
    // Default to current month
    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState(
        `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
    );

    // Calculate revenue for selected month
    const monthlyData = useMemo(() => {
        const [year, month] = selectedMonth.split('-').map(Number);

        // Filter records for the selected month
        const monthRecords = records.filter(r => {
            const recordDate = new Date(r.date);
            return recordDate.getFullYear() === year && recordDate.getMonth() + 1 === month;
        });

        // Calculate total revenue
        let totalRevenue = 0;
        const subjectRevenue: Record<Subject, number> = {
            Chinese: 0, Math: 0, English: 0, Physics: 0, Chemistry: 0
        };
        const paidStudents: Array<{ student: Student; amount: number }> = [];

        // Group by student and calculate
        const studentGroups = new Map<string, CourseRecord[]>();
        monthRecords.forEach(r => {
            if (!studentGroups.has(r.studentId)) {
                studentGroups.set(r.studentId, []);
            }
            studentGroups.get(r.studentId)!.push(r);
        });

        studentGroups.forEach((studentRecords, studentId) => {
            const student = students.find(s => s.id === studentId);
            if (!student) return;

            const billing = calculateStudentBill(student, studentRecords, pricingRules);
            totalRevenue += billing.finalCost;

            // Track by subject
            Object.entries(billing.subjectCounts).forEach(([subject, hours]) => {
                if (hours > 0) {
                    const rate = student.priceOverrides?.[subject as Subject] ??
                        pricingRules.basePrice[subject as Subject];
                    subjectRevenue[subject as Subject] += rate * hours;
                }
            });

            // Track paid students
            if (student.paymentStatus === 'paid' || student.paidAmount) {
                paidStudents.push({
                    student,
                    amount: billing.finalCost
                });
            }
        });

        return {
            totalRevenue,
            subjectRevenue,
            totalHours: monthRecords.reduce((sum, r) => sum + r.hours, 0),
            totalClasses: monthRecords.length,
            uniqueStudents: studentGroups.size,
            paidStudents,
            monthRecords
        };
    }, [selectedMonth, records, students, pricingRules]);

    // Generate month options (last 12 months)
    const monthOptions = useMemo(() => {
        const options = [];
        const now = new Date();
        for (let i = 0; i < 12; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = `${d.getFullYear()}年${d.getMonth() + 1}月`;
            options.push({ value, label });
        }
        return options;
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">月度营收报表</h2>
                <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-slate-500" />
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {monthOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-blue-100 text-sm">总营收</p>
                        <DollarSign size={24} className="text-blue-200" />
                    </div>
                    <p className="text-3xl font-bold">¥{monthlyData.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-slate-500 text-sm">总课时</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{monthlyData.totalHours}h</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-slate-500 text-sm">上课次数</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{monthlyData.totalClasses}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-slate-500 text-sm">学生人数</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{monthlyData.uniqueStudents}</p>
                </div>
            </div>

            {/* Subject Breakdown */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-blue-500" />
                    科目营收分布
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {(Object.entries(monthlyData.subjectRevenue) as [Subject, number][]).map(([subject, revenue]) => (
                        <div key={subject} className="p-4 bg-slate-50 rounded-lg">
                            <p className="text-slate-600 text-sm mb-1">{SUBJECT_CN[subject]}</p>
                            <p className="text-xl font-bold text-slate-800">¥{revenue.toFixed(2)}</p>
                            {monthlyData.totalRevenue > 0 && (
                                <p className="text-xs text-slate-500 mt-1">
                                    {((revenue / monthlyData.totalRevenue) * 100).toFixed(1)}%
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Paid Students List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800">已付款学生明细</h3>
                </div>
                {monthlyData.paidStudents.length > 0 ? (
                    <table className="min-w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">学生</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">电话</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase">应收金额</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase">已付金额</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase">状态</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {monthlyData.paidStudents.map(({ student, amount }) => (
                                <tr key={student.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                                        {student.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-sm">
                                        {student.phone}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-slate-900">
                                        ¥{amount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-green-600">
                                        ¥{(student.paidAmount || 0).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${student.paymentStatus === 'paid'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {student.paymentStatus === 'paid' ? '已付清' : '部分支付'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center py-12 text-slate-400">
                        本月暂无已付款学生
                    </div>
                )}
            </div>

            {/* Recent Classes */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800">本月课程记录</h3>
                </div>
                {monthlyData.monthRecords.length > 0 ? (
                    <div className="overflow-x-auto max-h-96">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">日期</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">学生</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">科目</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">教师</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-600">课时</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {monthlyData.monthRecords.map(record => (
                                    <tr key={record.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-2 whitespace-nowrap text-slate-600">{record.date}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-slate-900">{record.studentName}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                                                {SUBJECT_CN[record.subject]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-slate-600">{record.teacherName}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-right font-medium">{record.hours}h</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 text-slate-400">
                        本月暂无课程记录
                    </div>
                )}
            </div>
        </div>
    );
};
