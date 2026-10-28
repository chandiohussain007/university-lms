'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';

export default function AdmissionsPage() {
    const router = useRouter();
    const [faculties, setFaculties] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [form, setForm] = useState({ fullName: '', email: '', password: '', facultyId: '', departmentId: '', statementOfPurpose: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState<{ applicationCode: string; message: string } | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const [facRes, deptRes] = await Promise.all([api.get('/faculties'), api.get('/departments')]);
                setFaculties(facRes.data);
                setDepartments(deptRes.data);
                if (facRes.data.length > 0) setForm((p) => ({ ...p, facultyId: facRes.data[0].id }));
            } catch (err) {
                console.error('Failed to load faculties/departments', err);
            }
        })();
    }, []);

    const depts = departments.filter((d: any) => d.facultyId === form.facultyId);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/admissions/apply', {
                ...form,
                departmentId: form.departmentId || undefined,
                statementOfPurpose: form.statementOfPurpose || undefined,
            });
            setSuccess(res.data);
        } catch (err: any) {
            setError(err?.response?.data?.message ?? 'Application failed. Please check your information and try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header Navigation */}
            <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-700 text-white">
                        <GraduationCap size={20} />
                    </div>
                    <div>
                        <span className="font-bold text-slate-900 text-sm">UniPortal</span>
                        <p className="text-[10px] text-slate-500">Admissions Portal</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => router.push('/login')}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-800"
                >
                    Already have an account? Sign in →
                </button>
            </header>

            {/* Hero Banner */}
            <div className="py-12 px-6 text-center bg-slate-900">
                <div className="max-w-xl mx-auto text-white">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-blue-200 bg-blue-900/60 border border-blue-700/60 mb-4">
                        <ShieldCheck size={13} className="text-blue-400" />
                        Accredited Academic Degree Admissions
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-2">
                        Apply for Admission
                    </h1>
                    <p className="text-slate-300 text-sm">
                        Submit your student application online. Admission decisions generate student credentials automatically.
                    </p>
                </div>
            </div>

            {/* Application Card Container */}
            <div className="max-w-2xl mx-auto px-4 -mt-6 pb-16">
                <div className="card p-8 shadow-xl">
                    {success ? (
                        <div className="text-center py-6 space-y-4">
                            <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-600" />
                            <h2 className="text-2xl font-extrabold text-slate-900">Application Submitted!</h2>
                            <p className="text-sm text-slate-600 max-w-md mx-auto">{success.message}</p>
                            
                            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/70 inline-block text-left my-2">
                                <span className="text-xs font-medium text-slate-500">Official Tracking Code:</span>
                                <p className="text-lg font-mono font-black text-blue-800">{success.applicationCode}</p>
                            </div>

                            <p className="text-xs text-slate-500">
                                Once accepted by the admissions committee, you will be able to log in with your email and chosen password immediately.
                            </p>

                            <button
                                type="button"
                                onClick={() => router.push('/login')}
                                className="mt-4 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-700 hover:bg-blue-800"
                            >
                                Return to Sign In
                            </button>
                        </div>
                    ) : (
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
                                Personal & Academic Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        required
                                        placeholder="e.g. Eleanor Vance"
                                        value={form.fullName}
                                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Institutional / Personal Email
                                    </label>
                                    <input
                                        required
                                        type="email"
                                        placeholder="e.g. eleanor@example.com"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Account Password (min. 6 characters)
                                </label>
                                <input
                                    required
                                    type="password"
                                    minLength={6}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="input-field"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Academic Faculty
                                    </label>
                                    <select
                                        required
                                        value={form.facultyId}
                                        onChange={(e) => setForm({ ...form, facultyId: e.target.value, departmentId: '' })}
                                        className="select-field"
                                    >
                                        <option value="" disabled>Select faculty</option>
                                        {faculties.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Department / Major
                                    </label>
                                    <select
                                        value={form.departmentId}
                                        onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                                        className="select-field"
                                    >
                                        <option value="">Program / Department (optional)</option>
                                        {depts.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Statement of Purpose / Academic Objectives (optional)
                                </label>
                                <textarea
                                    placeholder="Outline your background, learning goals, or prior coursework…"
                                    rows={4}
                                    value={form.statementOfPurpose}
                                    onChange={(e) => setForm({ ...form, statementOfPurpose: e.target.value })}
                                    className="input-field"
                                />
                            </div>

                            {error && (
                                <div className="text-xs p-3 rounded-lg border border-red-200 bg-red-50 text-red-700">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all shadow-sm flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Submit Application
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
