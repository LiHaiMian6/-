import React from 'react';
import { LogEntry } from '../../types';

interface AdminLogsViewProps {
    logs: LogEntry[];
}

export const AdminLogsView: React.FC<AdminLogsViewProps> = ({ logs }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">系统审计日志</h2>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-600">时间</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">用户</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">操作</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">详情</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                    {new Date(log.timestamp).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-800">{log.actorName}</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-600 border border-slate-200">
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-600">{log.details}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
