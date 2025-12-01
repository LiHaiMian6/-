import React, { useState, useMemo } from 'react';
import { AlertCircle, Printer, ArrowLeft } from 'lucide-react';
import { Student, CourseRecord, PricingRule, Subject } from '../../types';
import { calculateStudentBill } from '../../services/billingService';
import { SUBJECT_CN } from '../../constants';

interface BillingViewProps {
    students: Student[];
    records: CourseRecord[];
    pricingRules: PricingRule;
    initialStudentId?: string | null;
    onNavigate?: (view: string) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({ students, records, pricingRules, initialStudentId, onNavigate }) => {
    const [selectedStudentId, setSelectedStudentId] = useState<string>(
        initialStudentId || students[0]?.id || ''
    );

    // Derived state for the bill
    const billData = useMemo(() => {
        const student = students.find(s => s.id === selectedStudentId);
        if (!student) return null;

        const studentRecords = records.filter(r => r.studentId === selectedStudentId); // In real app filter by month too
        return calculateStudentBill(student, studentRecords, pricingRules);
    }, [selectedStudentId, records, pricingRules, students]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 print:hidden">
                <h2 className="text-2xl font-bold text-slate-800">账单与发票</h2>
                <div className="flex items-center gap-2">
                    {onNavigate && (
                        <button
                            onClick={() => onNavigate('payment-tracking')}
                            className="flex items-center gap-2 bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors shadow-lg shadow-slate-600/20"
                        >
                            <ArrowLeft size={18} /> 返回收款追踪
                        </button>
                    )}
                    <button
                        onClick={handlePrint}
                        disabled={!billData}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-600/20 mr-4"
                    >
                        <Printer size={18} /> 打印/下载账单
                    </button>
                    <span className="text-sm font-medium text-slate-600">选择学生:</span>
                    <select
                        className="p-2 border border-slate-300 rounded-lg text-sm min-w-[200px]"
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                    >
                        {students.map(s => <option key={s.id} value={s.id}>{s.name} - {s.phone}</option>)}
                    </select>
                </div>
            </div>

            {billData && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Invoice Preview */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden print:shadow-none print:border-none print:w-full">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-start print:border-none">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">课程账单</h3>
                                <p className="text-slate-500 text-sm mt-1">单号: INV-{Date.now().toString().slice(-6)}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-slate-800">{billData.student.name}</p>
                                <p className="text-slate-500 text-sm">{billData.student.phone}</p>
                            </div>
                        </div>

                        <div className="p-6">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-600 font-medium print:bg-transparent">
                                    <tr>
                                        <th className="p-3">项目描述</th>
                                        <th className="p-3 text-right">课时</th>
                                        <th className="p-3 text-right">单价</th>
                                        <th className="p-3 text-right">金额</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {/* Aggregate by Subject for cleaner invoice */}
                                    {Object.entries(billData.subjectCounts).filter(([_, h]) => h > 0).map(([subj, hrs]) => {
                                        const rate = billData.student.priceOverrides?.[subj as Subject] ?? pricingRules.basePrice[subj as Subject];
                                        const details = billData.subjectDetails[subj as Subject];

                                        return (
                                            <React.Fragment key={subj}>
                                                <tr className="border-b border-slate-50">
                                                    <td className="p-3 font-medium text-slate-700">{SUBJECT_CN[subj as Subject]} 课程</td>
                                                    <td className="p-3 text-right">{hrs}</td>
                                                    <td className="p-3 text-right">¥{rate}</td>
                                                    <td className="p-3 text-right">¥{rate * hrs}</td>
                                                </tr>
                                                {/* Date Details Row */}
                                                <tr>
                                                    <td colSpan={4} className="px-3 pb-3 pt-0 text-xs text-slate-400">
                                                        <div className="flex flex-wrap gap-2">
                                                            {details.map((d, i) => (
                                                                <span key={i} className="bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                                                    {d}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                                <tfoot className="border-t-2 border-slate-100">
                                    <tr>
                                        <td colSpan={3} className="p-3 text-right font-medium text-slate-600">小计</td>
                                        <td className="p-3 text-right font-medium text-slate-800">¥{billData.originalCost}</td>
                                    </tr>
                                    {billData.appliedDiscounts.map((desc, idx) => (
                                        <tr key={idx} className="text-green-600">
                                            <td colSpan={3} className="p-3 text-right text-xs italic">{desc.split(':')[0]}</td>
                                            <td className="p-3 text-right text-sm">{desc.split(':')[1]}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-slate-50 text-lg print:bg-transparent">
                                        <td colSpan={3} className="p-4 text-right font-bold text-slate-800">应付总额</td>
                                        <td className="p-4 text-right font-bold text-blue-600">¥{billData.finalCost}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 print:hidden">
                            <button
                                onClick={handlePrint}
                                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm font-medium hover:bg-white transition-colors"
                            >
                                打印 PDF
                            </button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                                发送账单
                            </button>
                        </div>
                    </div>

                    {/* Breakdown Details / Controls - Hide on print */}
                    <div className="space-y-6 print:hidden">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <AlertCircle size={18} className="text-blue-500" /> 应用计费规则
                            </h4>
                            <ul className="space-y-3 text-sm text-slate-600">
                                <li className="flex justify-between">
                                    <span>基础费率:</span>
                                    <span className="font-medium">¥60/小时</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>学生特价:</span>
                                    <span className="font-medium">{billData.student.priceOverrides ? '是' : '无'}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>课时量折扣:</span>
                                    <span className={`font-medium ${billData.totalHours > pricingRules.discounts.hoursThreshold ? 'text-green-600' : 'text-slate-400'}`}>
                                        {'>'} {pricingRules.discounts.hoursThreshold} 课时
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-indigo-900 p-6 rounded-xl text-white shadow-lg">
                            <h4 className="font-semibold mb-2">人工调整</h4>
                            <p className="text-indigo-200 text-xs mb-4">覆盖最终金额 (仅限财务授权)</p>
                            <div className="flex gap-2">
                                <input type="number" placeholder="0.00" className="w-full bg-indigo-800 border-none rounded-lg px-3 py-2 text-sm text-white placeholder-indigo-400 focus:ring-2 focus:ring-indigo-400" />
                                <button className="bg-indigo-500 hover:bg-indigo-400 px-4 py-2 rounded-lg text-sm font-medium">应用</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
