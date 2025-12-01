import React, { useState } from 'react';
import { UserX } from 'lucide-react';
import { Student } from '../../types';

interface DeleteStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    students: Student[];
    onDelete: (studentId: string) => void;
}

export const DeleteStudentModal: React.FC<DeleteStudentModalProps> = ({ isOpen, onClose, students, onDelete }) => {
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');

    if (!isOpen) return null;

    const handleDelete = () => {
        if (!selectedStudentId) {
            alert('请选择要删除的学生');
            return;
        }

        const student = students.find(s => s.id === selectedStudentId);
        if (student) {
            onDelete(selectedStudentId);
            setSelectedStudentId('');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                        <UserX size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">删除学生</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">选择学生</label>
                        <select
                            value={selectedStudentId}
                            onChange={(e) => setSelectedStudentId(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            <option value="">-- 请选择 --</option>
                            {students.map(student => (
                                <option key={student.id} value={student.id}>
                                    {student.name} {student.grade ? `(${student.grade})` : ''} - {student.phone}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                        ⚠️ 警告：删除学生将同时删除该学生的所有课程记录，此操作不可恢复！
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleDelete}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                        disabled={!selectedStudentId}
                    >
                        确认删除
                    </button>
                </div>
            </div>
        </div>
    );
};
