import React, { useState, useMemo } from 'react';
import { Search, Phone, Edit, Trash2 } from 'lucide-react';
import { CourseRecord, Student } from '../../types';
import { SUBJECT_CN } from '../../constants';

interface AllRecordsViewProps {
    records: CourseRecord[];
    students: Student[];
    currentMonth: string;
    setRecords: React.Dispatch<React.SetStateAction<CourseRecord[]>>;
}

export const AllRecordsView: React.FC<AllRecordsViewProps> = ({ records, students, currentMonth, setRecords }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showPhoneFor, setShowPhoneFor] = useState<string | null>(null);

    // Filter by current month
    const monthlyRecords = records.filter(r => r.date.startsWith(currentMonth));

    // Filter students
    const filteredStudents = useMemo(() => {
        if (!searchTerm) return students;
        return students.filter(s =>
            s.name.includes(searchTerm) || s.phone.includes(searchTerm)
        );
    }, [students, searchTerm]);

    const filteredStudentIds = new Set(filteredStudents.map(s => s.id));

    // Filter records for display
    const displayRecords = useMemo(() => {
        return monthlyRecords.filter(r => filteredStudentIds.has(r.studentId));
    }, [monthlyRecords, filteredStudentIds]);

    // Get unique dates
    const uniqueDates = useMemo(() => {
        return Array.from(new Set(displayRecords.map(r => r.date))).sort();
    }, [displayRecords]);

    // Build row data
    const rowData = filteredStudents.map(student => {
        const studentRecords = displayRecords.filter(r => r.studentId === student.id);
        return { student, studentRecords };
    });

    const handleDelete = (id: string) => {
        if (confirm('确定要删除这条记录吗？')) {
            setRecords(prev => prev.filter(r => r.id !== id));
        }
    };

    const handleEdit = (record: CourseRecord) => {
        const newHours = prompt('请输入新的课时数:', record.hours.toString());
        if (newHours && !isNaN(parseFloat(newHours))) {
            setRecords(prev => prev.map(r => r.id === record.id ? { ...r, hours: parseFloat(newHours) } : r));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-slate-800">所有教学记录 ({currentMonth})</h2>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="搜索学生姓名或电话..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                        />
                    </div>
                    <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        本月总计: {displayRecords.reduce((acc, r) => acc + r.hours, 0)} 课时
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
                <div className="overflow-x-auto pb-2 custom-scrollbar">
                    <table className="min-w-full text-left text-sm text-slate-600 border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                            <tr>
                                <th className="px-4 py-3 border-r border-slate-200 min-w-[180px] sticky left-0 bg-slate-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                    学生姓名
                                </th>
                                {uniqueDates.length > 0 ? uniqueDates.map(date => (
                                    <th key={date} className="px-4 py-3 border-r border-slate-100 min-w-[100px] whitespace-nowrap text-center">
                                        {date}
                                    </th>
                                )) : (
                                    <th className="px-4 py-3 text-center">无数据</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rowData.length === 0 ? (
                                <tr><td colSpan={uniqueDates.length + 1} className="px-6 py-12 text-center text-slate-400">没有找到匹配的记录。</td></tr>
                            ) : (
                                rowData.map(({ student, studentRecords }) => (
                                    <tr key={student.id} className="hover:bg-slate-50 group">
                                        <td className="px-4 py-3 border-r border-slate-200 font-medium text-slate-900 bg-white sticky left-0 z-10 group-hover:bg-slate-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-base">{student.name}</span>
                                                    <button
                                                        onClick={() => setShowPhoneFor(showPhoneFor === student.id ? null : student.id)}
                                                        className={`p-1.5 rounded-full hover:bg-slate-200 transition-colors ${showPhoneFor === student.id ? 'text-blue-600 bg-blue-50' : 'text-slate-400'}`}
                                                        title="查看联系电话"
                                                    >
                                                        <Phone size={14} />
                                                    </button>
                                                </div>
                                                {showPhoneFor === student.id && (
                                                    <div className="text-xs text-blue-600 font-mono bg-blue-50 px-2 py-1 rounded">
                                                        {student.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        {uniqueDates.map(date => {
                                            const dayRecs = studentRecords.filter(r => r.date === date);
                                            return (
                                                <td key={date} className="px-2 py-2 border-r border-slate-100 align-top text-center">
                                                    {dayRecs.length > 0 ? (
                                                        <div className="flex flex-col gap-1 items-center">
                                                            {dayRecs.map(r => (
                                                                <div key={r.id} className={`
                                                                    relative group/record w-full px-2 py-1.5 rounded-md border text-xs shadow-sm cursor-pointer
                                                                    ${r.subject === 'Math' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                                                        r.subject === 'English' ? 'bg-pink-50 border-pink-200 text-pink-700' :
                                                                            r.subject === 'Chinese' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                                                                r.subject === 'Physics' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' :
                                                                                    'bg-emerald-50 border-emerald-200 text-emerald-700'}
                                                                `} title={`教师: ${r.teacherName}`}>
                                                                    <div className="font-bold mb-0.5">{SUBJECT_CN[r.subject]}</div>
                                                                    <div className="flex justify-between items-center gap-1">
                                                                        <span className="scale-90 opacity-80">{r.hours}h</span>
                                                                        <span className="scale-75 opacity-60 bg-white/50 px-1 rounded">{r.teacherName.charAt(0)}</span>
                                                                    </div>

                                                                    {/* Edit/Delete buttons */}
                                                                    <div className="absolute -top-2 -right-2 hidden group-hover/record:flex gap-1 bg-white shadow-md rounded-full p-0.5 border border-slate-200 z-10">
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleEdit(r); }}
                                                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded-full"
                                                                            title="编辑"
                                                                        >
                                                                            <Edit size={12} />
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}
                                                                            className="p-1 text-red-600 hover:bg-red-50 rounded-full"
                                                                            title="删除"
                                                                        >
                                                                            <Trash2 size={12} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-200 text-xl font-light">·</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
