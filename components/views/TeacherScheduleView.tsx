import React, { useState } from 'react';
import { ClassSchedule, Class, User } from '../../types';
import { Plus, Clock, MapPin, Trash2 } from 'lucide-react';
import { SUBJECT_CN } from '../../constants';

interface TeacherScheduleViewProps {
    currentUser: User;
    classes: Class[];
    schedules: ClassSchedule[];
    setSchedules: React.Dispatch<React.SetStateAction<ClassSchedule[]>>;
}

const DAYS_OF_WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export const TeacherScheduleView: React.FC<TeacherScheduleViewProps> = ({
    currentUser,
    classes,
    schedules,
    setSchedules
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [dayOfWeek, setDayOfWeek] = useState(1);
    const [startTime, setStartTime] = useState('14:00');
    const [endTime, setEndTime] = useState('16:00');
    const [location, setLocation] = useState('');

    const myClasses = classes.filter(c => c.teacherId === currentUser.id);
    const mySchedules = schedules.filter(s => s.teacherId === currentUser.id);

    const handleCreate = () => {
        if (!selectedClassId) {
            alert('请选择班级');
            return;
        }

        const selectedClass = classes.find(c => c.id === selectedClassId);
        if (!selectedClass) return;

        const newSchedule: ClassSchedule = {
            id: `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            classId: selectedClassId,
            className: selectedClass.name,
            teacherId: currentUser.id,
            teacherName: currentUser.name,
            subject: currentUser.subject || 'Math',
            dayOfWeek,
            startTime,
            endTime,
            location: location.trim() || undefined,
            createdAt: new Date().toISOString()
        };

        setSchedules(prev => [...prev, newSchedule]);
        setSelectedClassId('');
        setLocation('');
        setIsAdding(false);
        alert('课程已添加到课表！');
    };

    const handleDelete = (scheduleId: string) => {
        if (confirm('确定要删除这个课程安排吗？')) {
            setSchedules(prev => prev.filter(s => s.id !== scheduleId));
        }
    };

    const groupedSchedules = mySchedules.reduce((acc, schedule) => {
        if (!acc[schedule.dayOfWeek]) {
            acc[schedule.dayOfWeek] = [];
        }
        acc[schedule.dayOfWeek].push(schedule);
        return acc;
    }, {} as Record<number, ClassSchedule[]>);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">课程表</h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    disabled={myClasses.length === 0}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus size={18} /> {isAdding ? '取消' : '添加课程'}
                </button>
            </div>

            {myClasses.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
                    请先在"班级管理"中创建班级，然后再添加课程表
                </div>
            )}

            {isAdding && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-semibold text-slate-800 mb-4">添加课程</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">选择班级 *</label>
                            <select
                                value={selectedClassId}
                                onChange={(e) => setSelectedClassId(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">请选择班级</option>
                                {myClasses.map(cls => (
                                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">星期</label>
                            <select
                                value={dayOfWeek}
                                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {DAYS_OF_WEEK.map((day, idx) => (
                                    <option key={idx} value={idx}>{day}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">开始时间</label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">结束时间</label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">上课地点</label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="例如：教学楼A101"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        确认添加
                    </button>
                </div>
            )}

            {/* Weekly Schedule Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="grid grid-cols-7 gap-px bg-slate-200">
                    {DAYS_OF_WEEK.map((day, idx) => (
                        <div key={idx} className="bg-slate-50 p-3 text-center font-semibold text-slate-700">
                            {day}
                        </div>
                    ))}
                    {DAYS_OF_WEEK.map((day, idx) => (
                        <div key={idx} className="bg-white p-3 min-h-[200px]">
                            {groupedSchedules[idx]?.map(schedule => (
                                <div key={schedule.id} className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs group relative">
                                    <button
                                        onClick={() => handleDelete(schedule.id)}
                                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-red-600 hover:bg-red-100 p-1 rounded transition-opacity"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                    <div className="font-semibold text-blue-900">{schedule.className}</div>
                                    <div className="flex items-center gap-1 text-slate-600 mt-1">
                                        <Clock size={12} />
                                        <span>{schedule.startTime} - {schedule.endTime}</span>
                                    </div>
                                    {schedule.location && (
                                        <div className="flex items-center gap-1 text-slate-600 mt-1">
                                            <MapPin size={12} />
                                            <span>{schedule.location}</span>
                                        </div>
                                    )}
                                </div>
                            )) || <div className="text-slate-400 text-xs text-center mt-8">暂无课程</div>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
