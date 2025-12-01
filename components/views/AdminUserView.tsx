import React, { useState } from 'react';
import { User, UserRole, Subject } from '../../types';
import { ROLE_CN, SUBJECT_CN } from '../../constants';
import { Plus, Trash2, Edit } from 'lucide-react';
import { AddUserModal } from '../modals/AddUserModal';
import { EditUserModal } from '../modals/EditUserModal';
import { DeleteUserModal } from '../modals/DeleteUserModal';

interface AdminUserViewProps {
    users: User[];
    onAddUser: (name: string, role: UserRole, subject?: Subject) => void;
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

export const AdminUserView: React.FC<AdminUserViewProps> = ({ users, onAddUser, setUsers }) => {
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [isEditUserOpen, setIsEditUserOpen] = useState(false);
    const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);

    const handleDeleteClick = (user: User) => {
        setDeletingUser(user);
        setIsDeleteUserOpen(true);
    };

    const handleConfirmDelete = (userId: string) => {
        setUsers(prev => prev.filter(u => u.id !== userId));
        // Use a small timeout to ensure the UI update is perceived as "immediate" before any alert
        setTimeout(() => {
            // Optional: toast notification instead of alert would be better, but alert is fine if it's AFTER state update
            // alert(`用户已成功删除`); 
            // Removing alert to make it feel more "immediate" as requested
        }, 100);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setIsEditUserOpen(true);
    };

    const handleUpdateUser = (userId: string, updates: Partial<User>) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
        alert('用户信息更新成功！');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">用户管理</h2>
                <button
                    onClick={() => setIsAddUserOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                >
                    <Plus size={18} /> 添加用户
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-600">姓名</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">角色</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">ID</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">科目</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-800">{user.name}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                    ${user.role === 'teacher' ? 'bg-emerald-100 text-emerald-700' :
                                            user.role === 'finance' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}
                  `}>
                                        {ROLE_CN[user.role]}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500 font-mono text-xs">{user.id}</td>
                                <td className="px-6 py-4 text-slate-500">
                                    {user.subject ? SUBJECT_CN[user.subject as Subject] : '-'}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditUser(user)}
                                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                            title="编辑用户"
                                        >
                                            <Edit size={16} />
                                            <span className="text-xs">编辑</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(user)}
                                            className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                                            title="删除用户"
                                        >
                                            <Trash2 size={16} />
                                            <span className="text-xs">删除</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AddUserModal
                isOpen={isAddUserOpen}
                onClose={() => setIsAddUserOpen(false)}
                onAdd={onAddUser}
            />
            <EditUserModal
                isOpen={isEditUserOpen}
                onClose={() => setIsEditUserOpen(false)}
                user={editingUser}
                onUpdate={handleUpdateUser}
            />
            <DeleteUserModal
                isOpen={isDeleteUserOpen}
                onClose={() => setIsDeleteUserOpen(false)}
                user={deletingUser}
                onDelete={handleConfirmDelete}
            />
        </div>
    );
};
