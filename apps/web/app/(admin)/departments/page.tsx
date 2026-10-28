'use client';

import { useEffect, useState } from 'react';
import { Plus, Building2 } from 'lucide-react';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';

interface Department {
    id: string;
    name: string;
    code: string;
    faculty: { id: string; name: string; code: string; };
}

interface Faculty { id: string; name: string; }

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [newDept, setNewDept] = useState({ name: '', code: '', facultyId: '' });
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        try {
            const [deptRes, facultyRes] = await Promise.all([
                api.get('/departments'),
                api.get('/faculties'),
            ]);
            setDepartments(deptRes.data);
            setFaculties(facultyRes.data);
            if (facultyRes.data.length > 0 && !newDept.facultyId) {
                setNewDept(prev => ({ ...prev, facultyId: facultyRes.data[0].id }));
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
        setCreating(true);
        try {
            await api.post('/departments', newDept);
            setNewDept({ name: '', code: '', facultyId: newDept.facultyId });
            setShowForm(false);
            const deptRes = await api.get('/departments');
            setDepartments(deptRes.data);
        } catch (error) {
            console.error('Failed to create department:', error);
        } finally {
            setCreating(false);
        }
    }

    return (
        <div className="animate-fade-up">
            <PageHeader
                title={`Departments ${!loading ? `(${departments.length})` : ''}`}
                subtitle="Manage academic departments and their faculty affiliations"
                action={{ label: 'Add Department', icon: Plus, onClick: () => setShowForm(v => !v) }}
            />

            {/* Create form */}
            {showForm && (
                <div className="card p-6 mb-6" style={{ background: '#F0F7FF', borderColor: '#BFDBFE' }}>
                    <h2 className="text-sm font-semibold mb-4" style={{ color: '#1E3A8A' }}>
                        New Department
                    </h2>
                    {faculties.length === 0 && !loading && (
                        <div
                            className="text-sm p-3 rounded-lg mb-4"
                            style={{ background: '#FEF9C3', color: '#A16207', border: '1px solid #FDE047' }}
                        >
                            ⚠️ Create a Faculty first before adding departments.
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: '#475569' }}>
                                    Department Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Computer Science"
                                    value={newDept.name}
                                    onChange={e => setNewDept({ ...newDept, name: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: '#475569' }}>
                                    Code
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. CS"
                                    value={newDept.code}
                                    onChange={e => setNewDept({ ...newDept, code: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: '#475569' }}>
                                    Faculty
                                </label>
                                <select
                                    required
                                    value={newDept.facultyId}
                                    onChange={e => setNewDept({ ...newDept, facultyId: e.target.value })}
                                    className="select-field"
                                >
                                    <option value="" disabled>Select Faculty</option>
                                    {faculties.map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={creating || faculties.length === 0}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-colors"
                                style={{ background: '#1D4ED8' }}
                                onMouseEnter={e => !creating && (e.currentTarget.style.background = '#1E3A8A')}
                                onMouseLeave={e => (e.currentTarget.style.background = '#1D4ED8')}
                            >
                                {creating ? 'Creating…' : 'Create Department'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                                style={{ border: '1px solid #E2E8F0', color: '#475569', background: '#FFFFFF' }}
                                onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                                onMouseLeave={e => (e.currentTarget.style.background = '#FFFFFF')}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Table */}
            <div className="card overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                            {['Department', 'Code', 'Faculty', 'ID'].map(h => (
                                <th key={h} className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style={{ color: '#94A3B8' }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-5 py-12 text-center text-sm" style={{ color: '#94A3B8' }}>
                                    <div className="spinner w-6 h-6 mx-auto mb-2" />
                                    Loading…
                                </td>
                            </tr>
                        ) : departments.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-5 py-12 text-center">
                                    <Building2 size={36} className="mx-auto mb-3" style={{ color: '#CBD5E1' }} />
                                    <p className="text-sm" style={{ color: '#94A3B8' }}>No departments yet.</p>
                                    <button onClick={() => setShowForm(true)} className="mt-3 text-sm font-medium" style={{ color: '#1D4ED8' }}>
                                        Add the first department →
                                    </button>
                                </td>
                            </tr>
                        ) : (
                            departments.map((dept, i) => (
                                <tr
                                    key={dept.id}
                                    style={{ borderTop: i === 0 ? 'none' : '1px solid #F1F5F9', transition: 'background 0.1s' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                                style={{ background: '#DBEAFE' }}
                                            >
                                                <Building2 size={14} style={{ color: '#1D4ED8' }} />
                                            </div>
                                            <span className="text-sm font-semibold" style={{ color: '#0F172A' }}>{dept.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span
                                            className="px-2 py-0.5 rounded text-xs font-mono font-bold"
                                            style={{ background: '#F1F5F9', color: '#475569' }}
                                        >
                                            {dept.code}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-sm" style={{ color: '#475569' }}>
                                        {dept.faculty ? dept.faculty.name : '—'}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className="text-xs font-mono" style={{ color: '#94A3B8' }}>{dept.id}</span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
