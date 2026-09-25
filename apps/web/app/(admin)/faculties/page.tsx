'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Faculty {
    id: string;
    name: string;
    code: string;
}

export default function FacultiesPage() {
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [newFaculty, setNewFaculty] = useState({ name: '', code: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFaculties();
    }, []);

    async function loadFaculties() {
        try {
            const res = await api.get('/faculties');
            setFaculties(res.data);
        } catch (error) {
            console.error('Failed to load faculties:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            await api.post('/faculties', newFaculty);
            setNewFaculty({ name: '', code: '' });
            loadFaculties();
        } catch (error) {
            console.error('Failed to create faculty:', error);
        }
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Faculties</h1>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 mb-8">
                <h2 className="text-xl font-semibold mb-4">Add New Faculty</h2>
                <form onSubmit={handleSubmit} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            type="text"
                            value={newFaculty.name}
                            onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
                            className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                            required
                        />
                    </div>
                    <div className="w-32">
                        <label className="block text-sm font-medium mb-1">Code</label>
                        <input
                            type="text"
                            value={newFaculty.code}
                            onChange={(e) => setNewFaculty({ ...newFaculty, code: e.target.value })}
                            className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                    >
                        Add Faculty
                    </button>
                </form>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                        <tr>
                            <th className="p-4 font-medium text-zinc-500 dark:text-zinc-400">Name</th>
                            <th className="p-4 font-medium text-zinc-500 dark:text-zinc-400">Code</th>
                            <th className="p-4 font-medium text-zinc-500 dark:text-zinc-400">ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={3} className="p-4 text-center">Loading...</td></tr>
                        ) : faculties.length === 0 ? (
                            <tr><td colSpan={3} className="p-4 text-center text-zinc-500">No faculties found.</td></tr>
                        ) : (
                            faculties.map((faculty) => (
                                <tr key={faculty.id} className="border-t border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                    <td className="p-4 font-medium">{faculty.name}</td>
                                    <td className="p-4">{faculty.code}</td>
                                    <td className="p-4 text-zinc-400 text-sm font-mono">{faculty.id}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
