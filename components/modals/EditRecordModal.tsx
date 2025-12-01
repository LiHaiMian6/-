import React, { useState, useEffect } from 'react';
import { X, Clock } from 'lucide-react';
import { CourseRecord } from '../../types';
import { SUBJECT_CN } from '../../constants';

interface EditRecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    record: CourseRecord | null;
    onUpdate: (recordId: string, hours: number) => void;
}

export const EditRecordModal: React.FC<EditRecordModalProps> = ({ isOpen, onClose, record, onUpdate }) => {
    const [hours, setHours] = useState<string>('');

    useEffect(() => {
        if (record) {
            setHours(record.hours.toString());
        }
    }, [record]);

    if (!isOpen || !record) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numHours = parseFloat(hours);
        if (!isNaN(numHours) && numHours > 0) {
            onUpdate(record.id, numHours);
            onClose();
        } else {
            alert('请输入有效的课时数');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <Clock size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">修改课时</h2>
                </div>

                <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-slate-800">{record.studentName}</span>
                        <span className="text-sm text-slate-500">{record.date}</span>
                    </div>
                    <div className="text-sm text-slate-600">
                        科目：{SUBJECT_CN[record.subject]}
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-2">课时数</label>
                        <input
                            type="number"
                            step="0.5"
                            min="0.5"
                            required
                            value={hours}
                            onChange={(e) => setHours(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                            autoFocus
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-lg shadow-blue-600/20 transition-colors"
                        >
                            确认修改
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
