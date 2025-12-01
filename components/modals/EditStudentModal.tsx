import React, { useState } from 'react';
import { User, Edit2 } from 'lucide-react';
import { Student } from '../../types';

interface EditStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    students: Student[];
    onUpdate: (studentId: string, updates: Partial<Student>) => void;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({ isOpen, students, onClose, onUpdate }) => {
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [grade, setGrade] = useState('');

    React.useEffect(() => {
        if (selectedStudentId) {
            const student = students.find(s => s.id === selectedStudentId);
            if (student) {
                setName(student.name);
                setPhone(student.phone);
                setGrade(student.grade || '');
            }
        }
    }, [selectedStudentId, students]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!selectedStudentId) {
            alert('请选择要编辑的学生');
            return;
        }
        if (!name.trim()) {
            alert('请输入学生姓名');
            return;
        }

        onUpdate(selectedStudentId, {
            name: name.trim(),
            phone: phone.trim(),
            grade: grade || undefined
        });
        setSelectedStudentId('');
        setName('');
        setPhone('');
        setGrade('');
        onClose();
    };

    const GRADES = ['高一', '高二', '高三', '初一', '初二', '初三'];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <Edit2 size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">编辑学生信息</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">选择学生 *</label>
                        <select
                            value={selectedStudentId}
                            onChange={(e) => setSelectedStudentId(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">请选择学生</option>
                            {students.map(s => (
                                <option key={s.id} value={s.id}>{s.name} - {s.phone || '无电话'}</option>
                            ))}
                        </select>
                    </div>

                    {selectedStudentId && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">学生姓名 *</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="请输入姓名"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">联系电话</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="请输入电话号码"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">年级</label>
                                <select
                                    value={grade}
                                    onChange={(e) => setGrade(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">请选择年级</option>
                                    {GRADES.map(g => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedStudentId}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        保存
                    </button>
                </div>
            </div>
        </div>
    );
};
