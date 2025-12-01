import React, { useState, useMemo } from 'react';
import { Search, Check, X, Clock, FileText } from 'lucide-react';
import { Student, CourseRecord, PricingRule } from '../../types';
import { calculateStudentBill } from '../../services/billingService';

interface PaymentTrackingViewProps {
    students: Student[];
    records: CourseRecord[];
    pricingRules: PricingRule;
    setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
    onViewInvoice: (studentId: string) => void;
}

export const PaymentTrackingView: React.FC<PaymentTrackingViewProps> = ({
    students,
    records,
    pricingRules,
    setStudents,
    onViewInvoice
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Calculate billing for all students
    const studentBillings = useMemo(() => {
        return students.map(student => {
            const studentRecords = records.filter(r => r.studentId === student.id);
            const billing = calculateStudentBill(student, studentRecords, pricingRules);
            return {
                student,
                totalOwed: billing.finalCost,
                paidAmount: student.paidAmount || 0,
                balance: billing.finalCost - (student.paidAmount || 0),
                paymentStatus: student.paymentStatus || 'pending'
            };
        });
    }, [students, records, pricingRules]);

    // Filter by search term
    const filteredBillings = studentBillings.filter(b =>
        b.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.student.phone.includes(searchTerm)
    );

    const handlePaymentStatusChange = (studentId: string, status: 'pending' | 'paid' | 'partial') => {
        setStudents(prev => prev.map(s =>
            s.id === studentId ? { ...s, paymentStatus: status } : s
        ));
    };

    const handlePaidAmountChange = (studentId: string, amount: number) => {
        setStudents(prev => prev.map(s =>
            s.id === studentId ? {
                ...s,
                paidAmount: amount,
                lastPaymentDate: new Date().toISOString(),
                paymentStatus: amount >= studentBillings.find(b => b.student.id === studentId)?.totalOwed!
                    ? 'paid'
                    : amount > 0 ? 'partial' : 'pending'
            } : s
        ));
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid': return <Check size={16} className="text-green-600" />;
            case 'partial': return <Clock size={16} className="text-yellow-600" />;
            default: return <X size={16} className="text-red-600" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            paid: 'bg-green-100 text-green-700',
            partial: 'bg-yellow-100 text-yellow-700',
            pending: 'bg-red-100 text-red-700'
        };
        const labels = {
            paid: '已付清',
            partial: '部分支付',
            pending: '未支付'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
                {labels[status as keyof typeof labels]}
            </span>
        );
    };

    // Calculate summary stats
    const totalOwed = studentBillings.reduce((sum, b) => sum + b.totalOwed, 0);
    const totalPaid = studentBillings.reduce((sum, b) => sum + b.paidAmount, 0);
    const totalBalance = totalOwed - totalPaid;
    const paidCount = studentBillings.filter(b => b.paymentStatus === 'paid').length;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">收费管理</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="搜索学生姓名或电话..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-slate-500 text-sm">应收总额</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">¥{totalOwed.toFixed(2)}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-slate-500 text-sm">已收金额</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">¥{totalPaid.toFixed(2)}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-slate-500 text-sm">待收金额</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">¥{totalBalance.toFixed(2)}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-slate-500 text-sm">已付清人数</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{paidCount}/{studentBillings.length}</p>
                </div>
            </div>

            {/* Payment Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">学生</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">电话</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase">应收</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase">已收</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase">余额</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase">状态</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredBillings.map(billing => (
                            <tr key={billing.student.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(billing.paymentStatus)}
                                        <span className="font-medium text-slate-900">{billing.student.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-sm">
                                    {billing.student.phone}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-slate-900">
                                    ¥{billing.totalOwed.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <input
                                        type="number"
                                        value={billing.paidAmount}
                                        onChange={(e) => handlePaidAmountChange(billing.student.id, parseFloat(e.target.value) || 0)}
                                        className="w-24 px-2 py-1 border border-slate-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        step="0.01"
                                    />
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-right font-medium ${billing.balance > 0 ? 'text-red-600' : 'text-green-600'
                                    }`}>
                                    ¥{billing.balance.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    {getStatusBadge(billing.paymentStatus)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <select
                                            value={billing.paymentStatus}
                                            onChange={(e) => handlePaymentStatusChange(billing.student.id, e.target.value as any)}
                                            className="px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="pending">未支付</option>
                                            <option value="partial">部分支付</option>
                                            <option value="paid">已付清</option>
                                        </select>
                                        <button
                                            onClick={() => onViewInvoice(billing.student.id)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            title="查看发票"
                                        >
                                            <FileText size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredBillings.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                        没有找到匹配的学生
                    </div>
                )}
            </div>
        </div>
    );
};
