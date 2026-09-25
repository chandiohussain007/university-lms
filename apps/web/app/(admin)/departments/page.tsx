'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Department {
    id: string;
    name: string;
    code: string;
    faculty: {
        id: string;
        name: string;
        code: string;
    };
}

interface Faculty {
    id: string;
    name: string;
}

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [newDept, setNewDept] = useState({ name: '', code: '', facultyId: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const [deptRes, facultyRes] = await Promise.all([
                api.get('/departments'),
                api.get('/faculties'),
            ]);

            const deptData = deptRes.data;
            const facultyData = facultyRes.data;

            setDepartments(deptData);
            setFaculties(facultyData);
            if (facultyData.length > 0 && !newDept.facultyId) {
                setNewDept(prev => ({ ...prev, facultyId: facultyData[0].id }));
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!newDept.facultyId) return;

        try {
            await api.post('/departments', newDept);

            setNewDept({ name: '', code: '', facultyId: newDept.facultyId }); // Keep selected faculty

            const deptRes = await api.get('/departments');
            setDepartments(deptRes.data);
        } catch (error) {
            console.error('Failed to create department:', error);
        }
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Departments</h1>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 mb-8">
                <h2 className="text-xl font-semibold mb-4">Add New Department</h2>
                <form onSubmit={handleSubmit} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            type="text"
                            value={newDept.name}
                            onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                            className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                            required
                        />
                    </div>
                    <div className="w-32">
                        <label className="block text-sm font-medium mb-1">Code</label>
                        <input
                            type="text"
                            value={newDept.code}
                            onChange={(e) => setNewDept({ ...newDept, code: e.target.value })}
                            className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                            required
                        />
                    </div>
                    <div className="w-64">
                        <label className="block text-sm font-medium mb-1">Faculty</label>
                        <select
                            value={newDept.facultyId}
                            onChange={(e) => setNewDept({ ...newDept, facultyId: e.target.value })}
                            className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                            required
                        >
                            <option value="" disabled>Select Faculty</option>
                            {faculties.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium disabled:opacity-50"
                        disabled={faculties.length === 0}
                    >
                        Add
                    </button>
                </form>
                {faculties.length === 0 && !loading && (
                    <p className="text-sm text-red-500 mt-2">Create a faculty first to add departments.</p>
                )}
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                        <tr>
                            <th className="p-4 font-medium text-zinc-500 dark:text-zinc-400">Name</th>
                            <th className="p-4 font-medium text-zinc-500 dark:text-zinc-400">Code</th>
                            <th className="p-4 font-medium text-zinc-500 dark:text-zinc-400">Faculty</th>
                            <th className="p-4 font-medium text-zinc-500 dark:text-zinc-400">ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr>
                        ) : departments.length === 0 ? (
                            <tr><td colSpan={4} className="p-4 text-center text-zinc-500">No departments found.</td></tr>
                        ) : (
                            departments.map((dept) => (
                                <tr key={dept.id} className="border-t border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                    <td className="p-4 font-medium">{dept.name}</td>
                                    <td className="p-4">{dept.code}</td>
                                    <td className="p-4">{dept.faculty ? dept.faculty.name : 'N/A'}</td>
                                    <td className="p-4 text-zinc-400 text-sm font-mono">{dept.id}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
