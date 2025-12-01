import React, { useState } from 'react';
import { Class, Student, User, Subject } from '../../types';
import { Plus, Users, Trash2, Edit } from 'lucide-react';
import { SUBJECT_CN } from '../../constants';
import { DeleteClassModal } from '../modals/DeleteClassModal';

interface TeacherClassManagementProps {
    currentUser: User;
    students: Student[];
    classes: Class[];
    setClasses: React.Dispatch<React.SetStateAction<Class[]>>;
}

const GRADES = ['高一', '高二', '高三', '初一', '初二', '初三'];

export const TeacherClassManagement: React.FC<TeacherClassManagementProps> = ({
    currentUser,
    students,
    classes,
    setClasses
}) => {
    const [isAddingClass, setIsAddingClass] = useState(false);
    const [isEditingClass, setIsEditingClass] = useState(false);
    const [isDeleteClassOpen, setIsDeleteClassOpen] = useState(false);
    const [editingClassId, setEditingClassId] = useState<string | null>(null);
    const [deletingClass, setDeletingClass] = useState<Class | null>(null);
    const [newClassName, setNewClassName] = useState('');
    const [selectedGrade, setSelectedGrade] = useState('高一');
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

    const myClasses = classes.filter(c => c.teacherId === currentUser.id);

    const resetForm = () => {
        setNewClassName('');
        setSelectedGrade('高一');
        setSelectedStudents([]);
        setIsAddingClass(false);
        setIsEditingClass(false);
        setEditingClassId(null);
    };

    const handleStartEdit = (classItem: Class) => {
        setEditingClassId(classItem.id);
        setNewClassName(classItem.name);
        setSelectedGrade(classItem.grade);
        setSelectedStudents(classItem.studentIds);
        setIsEditingClass(true);
        setIsAddingClass(false);
    };

    const handleCreateClass = () => {
        if (!newClassName.trim()) {
            alert('请输入班级名称');
            return;
        }

        if (isEditingClass && editingClassId) {
            // Update existing class
            setClasses(prev => prev.map(c =>
                c.id === editingClassId
                    ? {
                        ...c,
                        name: newClassName.trim(),
                        grade: selectedGrade,
                        studentIds: selectedStudents
                    }
                    : c
            ));
            alert(`班级 "${newClassName}" 更新成功！`);
        } else {
            // Create new class
            const newClass: Class = {
                id: `class_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: newClassName.trim(),
                teacherId: currentUser.id,
                teacherName: currentUser.name,
                subject: currentUser.subject || 'Math',
                grade: selectedGrade,
                studentIds: selectedStudents,
                createdAt: new Date().toISOString()
            };
            setClasses(prev => [newClass, ...prev]);
            alert(`班级 "${newClassName}" 创建成功！`);
        }
        resetForm();
    };

    const handleDeleteClick = (classItem: Class) => {
        setDeletingClass(classItem);
        setIsDeleteClassOpen(true);
    };

    const handleConfirmDelete = (classId: string) => {
        setClasses(prev => prev.filter(c => c.id !== classId));
    };

    const toggleStudentSelection = (studentId: string) => {
        setSelectedStudents(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">班级管理</h2>
                <div className="flex gap-2">
                    {isEditingClass && (
                        <button
                            onClick={resetForm}
                            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                        >
                            取消编辑
                        </button>
                    )}
                    <button
                        onClick={() => {
                            if (isAddingClass || isEditingClass) {
                                resetForm();
                            } else {
                                setIsAddingClass(true);
                            }
                        }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                    >
                        <Plus size={18} /> {(isAddingClass || isEditingClass) ? '取消' : '创建班级'}
                    </button>
                </div>
            </div>

            {(isAddingClass || isEditingClass) && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-semibold text-slate-800 mb-4">
                        {isEditingClass ? '编辑班级' : '创建新班级'}
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">班级名称 *</label>
                            <input
                                type="text"
                                value={newClassName}
                                onChange={(e) => setNewClassName(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="例如：高一数学提高班"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">年级</label>
                            <select
                                value={selectedGrade}
                                onChange={(e) => setSelectedGrade(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {GRADES.map(g => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">选择学生</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-lg">
                                {students.map(student => (
                                    <label key={student.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded">
                                        <input
                                            type="checkbox"
                                            checked={selectedStudents.includes(student.id)}
                                            onChange={() => toggleStudentSelection(student.id)}
                                            className="rounded border-slate-300"
                                        />
                                        <span className="text-sm">{student.name}</span>
                                    </label>
                                ))}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">已选择 {selectedStudents.length} 名学生</p>
                        </div>
                        <button
                            onClick={handleCreateClass}
                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            {isEditingClass ? '保存修改' : '确认创建'}
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myClasses.length === 0 ? (
                    <div className="col-span-2 text-center py-12 text-slate-400">
                        暂无班级，点击"创建班级"开始
                    </div>
                ) : (
                    myClasses.map(cls => (
                        <div key={cls.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">{cls.name}</h3>
                                    <p className="text-sm text-slate-500">{cls.grade} · {SUBJECT_CN[cls.subject]}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleStartEdit(cls)}
                                        className="text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors"
                                        title="编辑班级"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(cls)}
                                        className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
                                        title="删除班级"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                                <Users size={16} />
                                <span className="text-sm">{cls.studentIds.length} 名学生</span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-1">
                                {cls.studentIds.slice(0, 5).map(studentId => {
                                    const student = students.find(s => s.id === studentId);
                                    return student ? (
                                        <span key={studentId} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                                            {student.name}
                                        </span>
                                    ) : null;
                                })}
                                {cls.studentIds.length > 5 && (
                                    <span className="text-xs text-slate-500">+{cls.studentIds.length - 5}</span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
            <DeleteClassModal
                isOpen={isDeleteClassOpen}
                onClose={() => setIsDeleteClassOpen(false)}
                classItem={deletingClass}
                onDelete={handleConfirmDelete}
            />
        </div>
    );
};
