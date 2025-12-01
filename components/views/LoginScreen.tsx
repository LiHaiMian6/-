import React from 'react';
import { User } from '../../types';
import { ROLE_CN } from '../../constants';

interface LoginScreenProps {
    onLogin: (user: User) => void;
    users: User[];
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, users }) => {
    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-600/30">
                        <span className="text-3xl font-bold text-white">张</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-2 text-slate-800">张东教育系统</h1>
                    <p className="text-slate-500 mt-2">请选择角色进入系统</p>
                </div>

                <div className="space-y-3">
                    {users.filter(u => u.role !== 'admin').concat(users.filter(u => u.role === 'admin')[0]).map((u) => (
                        <button
                            key={u.id}
                            onClick={() => onLogin(u)}
                            className="w-full p-4 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-blue-500 hover:shadow-md transition-all group flex items-center gap-4 text-left"
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                ${u.role === 'teacher' ? 'bg-emerald-500' : u.role === 'finance' ? 'bg-purple-500' : 'bg-slate-700'}
              `}>
                                {u.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold text-slate-800 group-hover:text-blue-600">{u.name}</div>
                                <div className="text-xs text-slate-500 uppercase tracking-wide font-medium">{ROLE_CN[u.role]}</div>
                            </div>
                            <div className="text-slate-300 group-hover:text-blue-500">→</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
