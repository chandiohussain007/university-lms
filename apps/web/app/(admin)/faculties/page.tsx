'use client';

import { useEffect, useState } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';

interface Faculty {
    id: string;
    name: string;
    code: string;
}

export default function FacultiesPage() {
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [newFaculty, setNewFaculty] = useState({ name: '', code: '' });
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => { loadFaculties(); }, []);

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
        setCreating(true);
        try {
            await api.post('/faculties', newFaculty);
            setNewFaculty({ name: '', code: '' });
            setShowForm(false);
            loadFaculties();
        } catch (error) {
            console.error('Failed to create faculty:', error);
        } finally {
            setCreating(false);
        }
    }

    // Consistent colors per faculty (cycled)
    const colors = ['#DBEAFE', '#DCFCE7', '#F3E8FF', '#FEF9C3', '#FFE4E6', '#E0F2FE'];
    const iconColors = ['#1D4ED8', '#15803D', '#6B21A8', '#A16207', '#BE123C', '#0369A1'];

    return (
        <div className="animate-fade-up">
            <PageHeader
                title={`Faculties ${!loading ? `(${faculties.length})` : ''}`}
                subtitle="Manage academic faculties and schools"
                action={{ label: 'Add Faculty', icon: Plus, onClick: () => setShowForm(v => !v) }}
            />

            {/* Create form */}
            {showForm && (
                <div className="card p-6 mb-6" style={{ background: '#F0F7FF', borderColor: '#BFDBFE' }}>
                    <h2 className="text-sm font-semibold mb-4" style={{ color: '#1E3A8A' }}>
                        New Faculty
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium mb-1.5" style={{ color: '#475569' }}>
                                    Faculty Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Faculty of Engineering"
                                    value={newFaculty.name}
                                    onChange={e => setNewFaculty({ ...newFaculty, name: e.target.value })}
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
                                    placeholder="e.g. ENG"
                                    value={newFaculty.code}
                                    onChange={e => setNewFaculty({ ...newFaculty, code: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={creating}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-colors"
                                style={{ background: '#1D4ED8' }}
                                onMouseEnter={e => !creating && (e.currentTarget.style.background = '#1E3A8A')}
                                onMouseLeave={e => (e.currentTarget.style.background = '#1D4ED8')}
                            >
                                {creating ? 'Creating…' : 'Create Faculty'}
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

            {/* Faculties grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="spinner w-8 h-8" />
                </div>
            ) : faculties.length === 0 ? (
                <div className="card p-16 text-center">
                    <BookOpen size={40} className="mx-auto mb-4" style={{ color: '#CBD5E1' }} />
                    <p className="text-sm font-medium" style={{ color: '#0F172A' }}>No faculties yet</p>
                    <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>Faculties are the top-level academic units. Add one to get started.</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="mt-4 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
                        style={{ background: '#1D4ED8' }}
                    >
                        Add First Faculty
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {faculties.map((faculty, i) => {
                        const bg = colors[i % colors.length];
                        const ic = iconColors[i % iconColors.length];
                        return (
                            <div
                                key={faculty.id}
                                className="card card-hover p-6"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ background: bg }}
                                    >
                                        <BookOpen size={18} style={{ color: ic }} />
                                    </div>
                                    <span
                                        className="px-2 py-0.5 rounded text-xs font-mono font-bold"
                                        style={{ background: '#F1F5F9', color: '#475569' }}
                                    >
                                        {faculty.code}
                                    </span>
                                </div>
                                <h3 className="text-base font-bold mb-1" style={{ color: '#0F172A' }}>
                                    {faculty.name}
                                </h3>
                                <p className="text-xs font-mono mt-3 pt-3 border-t" style={{ color: '#CBD5E1', borderColor: '#F1F5F9' }}>
                                    {faculty.id}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
