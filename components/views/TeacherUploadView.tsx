import React, { useState } from 'react';
import { Upload, CheckCircle, FileSpreadsheet, Download } from 'lucide-react';
import { User, CourseRecord, Student } from '../../types';
import * as XLSX from 'xlsx';

interface TeacherUploadViewProps {
    currentUser: User;
    setRecords: React.Dispatch<React.SetStateAction<CourseRecord[]>>;
    addLog: (action: string, details: string) => void;
    onNavigate: (view: string) => void;
    students: Student[];
    setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
}

const GRADES = ['高一', '高二', '高三', '初一', '初二', '初三'];

export const TeacherUploadView: React.FC<TeacherUploadViewProps> = ({
    currentUser,
    setRecords,
    addLog,
    onNavigate,
    students,
    setStudents
}) => {
    const [fileStatus, setFileStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
    const [parsedCount, setParsedCount] = useState(0);
    const [selectedGrade, setSelectedGrade] = useState<string>('高一');
    const [selectedMonth, setSelectedMonth] = useState<string>(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFileStatus('uploading');

            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    const data = event.target?.result;
                    if (!data) {
                        alert('文件读取失败');
                        setFileStatus('idle');
                        return;
                    }

                    const workbook = XLSX.read(data, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                    if (jsonData.length < 2) {
                        alert('文件格式错误：至少需要表头和一行数据');
                        setFileStatus('idle');
                        return;
                    }

                    // Generate dates based on selected month
                    const headerRow = jsonData[0];
                    const numColumns = headerRow.length - 1;
                    const dates: string[] = [];

                    const year = parseInt(selectedMonth.split('-')[0]);
                    const month = parseInt(selectedMonth.split('-')[1]);
                    const daysInMonth = new Date(year, month, 0).getDate();

                    for (let i = 0; i < numColumns; i++) {
                        const day = (i % daysInMonth) + 1;
                        dates.push(`${selectedMonth}-${String(day).padStart(2, '0')}`);
                    }

                    const newRecords: CourseRecord[] = [];
                    const newStudents: Student[] = [];

                    for (let i = 1; i < jsonData.length; i++) {
                        const row = jsonData[i];
                        const studentName = String(row[0] || '').trim();

                        if (!studentName) continue;

                        let student = students.find(s => s.name === studentName);
                        let studentId: string;

                        if (!student) {
                            student = newStudents.find(s => s.name === studentName);

                            if (!student) {
                                studentId = `s_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`;
                                const newStudent: Student = {
                                    id: studentId,
                                    name: studentName,
                                    phone: '',
                                    grade: selectedGrade
                                };
                                newStudents.push(newStudent);
                            } else {
                                studentId = student.id;
                            }
                        } else {
                            studentId = student.id;
                            if (!student.grade) {
                                setStudents(prev => prev.map(s =>
                                    s.id === student!.id ? { ...s, grade: selectedGrade } : s
                                ));
                            }
                        }

                        for (let j = 1; j < row.length && j <= dates.length; j++) {
                            const cellValue = row[j];
                            const hours = parseFloat(cellValue);

                            if (!isNaN(hours) && hours > 0 && dates[j - 1]) {
                                newRecords.push({
                                    id: `rec_${Date.now()}_${i}_${j}_${Math.random().toString(36).substr(2, 9)}`,
                                    studentId,
                                    studentName,
                                    subject: currentUser.subject || 'Math',
                                    teacherId: currentUser.id,
                                    teacherName: currentUser.name,
                                    date: dates[j - 1],
                                    hours,
                                    status: 'pending'
                                });
                            }
                        }
                    }

                    if (newStudents.length > 0) {
                        setStudents(prev => [...prev, ...newStudents]);
                    }

                    setRecords(prev => [...newRecords, ...prev]);
                    addLog('数据上传', `导入 ${newRecords.length} 条记录，创建 ${newStudents.length} 个新学生（${selectedGrade}，${selectedMonth}月）`);
                    setParsedCount(newRecords.length);
                    setFileStatus('success');
                } catch (error) {
                    alert('文件解析失败：' + error);
                    setFileStatus('idle');
                }
            };

            reader.readAsBinaryString(file);
        }
    };

    const handleDownloadTemplate = () => {
        const dates = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dates.push(d);
        }

        const wb = XLSX.utils.book_new();
        const header = ['学生姓名', ...dates.map(d => d.toISOString().split('T')[0])];
        const data = [
            header,
            ['张三', 1, '', 2, '', '', ''],
            ['李四', '', 1.5, 1, '', '', ''],
            ['王五', '', '', '', 2, '', 1]
        ];

        const ws = XLSX.utils.aoa_to_sheet(data);
        ws['!cols'] = [
            { wch: 15 },
            ...dates.map(() => ({ wch: 12 }))
        ];

        XLSX.utils.book_append_sheet(wb, ws, '课时记录');
        XLSX.writeFile(wb, '课时记录模板.xlsx');
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">上传课程记录</h2>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-3">选择月份</h3>
                <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-2">
                    上传的数据将归入 <span className="font-semibold text-blue-600">{selectedMonth}</span> 月份
                </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-3">选择年级</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {GRADES.map(grade => (
                        <button
                            key={grade}
                            onClick={() => setSelectedGrade(grade)}
                            className={`px-4 py-3 rounded-lg font-medium transition-all ${selectedGrade === grade
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                        >
                            {grade}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-slate-500 mt-3">
                    上传的学生将被标记为 <span className="font-semibold text-blue-600">{selectedGrade}</span>
                </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 hover:bg-slate-50 transition-colors cursor-pointer relative">
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileUpload}
                        disabled={fileStatus === 'uploading'}
                    />
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                            <Upload size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700">点击 or 拖拽 Excel 文件至此</h3>
                        <p className="text-slate-500 mt-2 text-sm max-w-sm mx-auto">
                            矩阵格式：第一行为日期，第一列为学生姓名，交叉处填写课时数
                        </p>
                    </div>
                </div>

                {fileStatus === 'uploading' && (
                    <div className="mt-6 flex items-center justify-center gap-2 text-blue-600">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        <span>正在解析文件数据...</span>
                    </div>
                )}

                {fileStatus === 'success' && (
                    <div className="mt-6 p-4 bg-emerald-50 text-emerald-700 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                            <CheckCircle size={20} />
                            <span className="font-medium">成功！已导入 {parsedCount} 条记录。</span>
                        </div>
                        <div className="flex gap-2 justify-center">
                            <button
                                onClick={() => onNavigate('my-records')}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                            >
                                查看记录
                            </button>
                            <button
                                onClick={() => setFileStatus('idle')}
                                className="px-4 py-2 bg-white text-emerald-700 border border-emerald-300 rounded-lg text-sm font-medium hover:bg-emerald-50 transition-colors"
                            >
                                继续上传
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-800">模板下载</h3>
                </div>
                <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-lg bg-slate-50">
                    <div className="p-3 bg-green-100 text-green-700 rounded-lg">
                        <FileSpreadsheet size={24} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-medium text-slate-900">矩阵课时记录模板.xlsx</h4>
                        <p className="text-xs text-slate-500">横排日期，竖排学生，数字为课时</p>
                    </div>
                    <button
                        onClick={handleDownloadTemplate}
                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100 transition-colors flex items-center gap-2"
                    >
                        <Download size={16} /> 下载
                    </button>
                </div>
            </div>
        </div>
    );
}; 
