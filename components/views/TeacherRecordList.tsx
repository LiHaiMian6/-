import React, { useState } from 'react';
import { Phone, Edit, Trash2 } from 'lucide-react';
import { CourseRecord, User, Student } from '../../types';
import { SUBJECT_CN } from '../../constants';
import { DeleteRecordModal } from '../modals/DeleteRecordModal';
import { EditRecordModal } from '../modals/EditRecordModal';

interface TeacherRecordListProps {
    records: CourseRecord[];
    currentUser: User;
    students: Student[];
    setRecords: React.Dispatch<React.SetStateAction<CourseRecord[]>>;
    currentMonth: string;
}

export const TeacherRecordList: React.FC<TeacherRecordListProps> = ({ records, currentUser, students, setRecords, currentMonth }) => {
    // Filter by teacher ID, subject, AND month
    const myRecords = records.filter(r =>
        r.teacherId === currentUser.id &&
        r.subject === currentUser.subject &&
        r.date.startsWith(currentMonth)
    );

    // Get unique dates and sort them
    const uniqueDates = Array.from(new Set(myRecords.map(r => r.date))).sort();

    // Group records by student
    const relevantStudentIds = Array.from(new Set(myRecords.map(r => r.studentId)));
    const rowData = relevantStudentIds.map(sid => {
        const student = students.find(s => s.id === sid) || { id: sid, name: '未知', phone: '' } as Student;
        const studentRecords = myRecords.filter(r => r.studentId === sid);
        return { student, studentRecords };
    });

    const [showPhoneFor, setShowPhoneFor] = useState<string | null>(null);
    const [isDeleteRecordOpen, setIsDeleteRecordOpen] = useState(false);
    const [isEditRecordOpen, setIsEditRecordOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<CourseRecord | null>(null);

    const handleDeleteClick = (record: CourseRecord) => {
        setSelectedRecord(record);
        setIsDeleteRecordOpen(true);
    };

    const handleConfirmDelete = (recordId: string) => {
        setRecords(prev => prev.filter(r => r.id !== recordId));
    };

    const handleEditClick = (record: CourseRecord) => {
        setSelectedRecord(record);
        setIsEditRecordOpen(true);
    };

    const handleUpdateRecord = (recordId: string, hours: number) => {
        setRecords(prev => prev.map(r => r.id === recordId ? { ...r, hours } : r));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">我的教学日志</h2>
                <div className="flex gap-2">
                    <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        总计: {myRecords.reduce((acc, r) => acc + r.hours, 0)} 课时
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
                <div className="overflow-x-auto pb-2 custom-scrollbar">
                    <table className="min-w-full text-left text-sm text-slate-600 border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                            <tr>
                                <th className="px-4 py-3 border-r border-slate-200 min-w-[160px] sticky left-0 bg-slate-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                    学生姓名
                                </th>
                                {uniqueDates.map(date => (
                                    <th key={date} className="px-4 py-3 border-r border-slate-100 min-w-[100px] whitespace-nowrap text-center">
                                        {date}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rowData.length === 0 ? (
                                <tr><td colSpan={uniqueDates.length + 1} className="px-6 py-8 text-center text-slate-400">暂无记录。</td></tr>
                            ) : (
                                rowData.map(({ student, studentRecords }) => (
                                    <tr key={student.id} className="hover:bg-slate-50 group">
                                        <td className="px-4 py-3 border-r border-slate-200 font-medium text-slate-900 bg-white sticky left-0 z-10 group-hover:bg-slate-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center justify-between">
                                                    <span>{student.name}</span>
                                                    <button
                                                        onClick={() => setShowPhoneFor(showPhoneFor === student.id ? null : student.id)}
                                                        className={`p-1 rounded-full hover:bg-slate-200 transition-colors ${showPhoneFor === student.id ? 'text-blue-600 bg-blue-50' : 'text-slate-400'}`}
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
                                                                `}>
                                                                    <div className="font-bold mb-0.5">{SUBJECT_CN[r.subject]}</div>
                                                                    <div className="scale-95 opacity-80">{r.hours} 课时</div>

                                                                    <div className="absolute -top-2 -right-2 hidden group-hover/record:flex gap-1 bg-white shadow-md rounded-full p-0.5 border border-slate-200 z-10">
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleEditClick(r); }}
                                                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded-full"
                                                                            title="编辑"
                                                                        >
                                                                            <Edit size={12} />
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(r); }}
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
            <DeleteRecordModal
                isOpen={isDeleteRecordOpen}
                onClose={() => setIsDeleteRecordOpen(false)}
                record={selectedRecord}
                onDelete={handleConfirmDelete}
            />
            <EditRecordModal
                isOpen={isEditRecordOpen}
                onClose={() => setIsEditRecordOpen(false)}
                record={selectedRecord}
                onUpdate={handleUpdateRecord}
            />
        </div>
    );
};
