import React from 'react';
import { UserX, AlertTriangle } from 'lucide-react';
import { User } from '../../types';
import { ROLE_CN } from '../../constants';

interface DeleteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onDelete: (userId: string) => void;
}

export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({ isOpen, onClose, user, onDelete }) => {
    if (!isOpen || !user) return null;

    const handleDelete = () => {
        onDelete(user.id);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                        <UserX size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">删除用户确认</h2>
                </div>

                <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <p className="text-sm text-slate-600 mb-1">即将删除用户：</p>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-lg text-slate-800">{user.name}</span>
                            <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-xs">
                                {ROLE_CN[user.role]}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">ID: {user.id}</p>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-3 items-start">
                        <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={18} />
                        <div className="text-sm text-red-700">
                            <p className="font-medium">此操作不可撤销！</p>
                            <p className="mt-1 opacity-90">删除后该用户将无法登录系统。</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleDelete}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-lg shadow-red-600/20 transition-colors"
                    >
                        确认删除
                    </button>
                </div>
            </div>
        </div>
    );
};
