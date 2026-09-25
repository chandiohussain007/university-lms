'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, CheckCircle2 } from 'lucide-react';
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
            setError(err?.response?.data?.message ?? 'Application failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    const input = 'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent';

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
                <div className="text-center mb-8">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                        <GraduationCap className="h-10 w-10 text-blue-600" />
                    </div>
                    <h1 className="mt-4 text-2xl font-extrabold text-gray-900">Admissions</h1>
                    <p className="mt-1 text-sm text-gray-600">Apply for admission — no account needed</p>
                </div>
                {success ? (
                    <div className="text-center space-y-4">
                        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
                        <h2 className="text-xl font-bold text-gray-900">Application Submitted!</h2>
                        <p className="text-gray-600">{success.message}</p>
                        <p className="text-sm bg-blue-50 border border-blue-100 rounded-lg p-3 text-blue-800">
                            Application code: <span className="font-mono font-bold">{success.applicationCode}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                            Once accepted, sign in with the email and password you provided.
                        </p>
                        <button onClick={() => router.push('/login')}
                            className="mt-2 w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors">
                            Go to Login
                        </button>
                    </div>
                ) : (
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <input required placeholder="Full name" value={form.fullName}
                            onChange={(e) => setForm({ ...form, fullName: e.target.value })} className={input} />
                        <input required type="email" placeholder="Email address (this will be your login)" value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })} className={input} />
                        <input required type="password" minLength={6} placeholder="Choose a password (min 6 characters)" value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })} className={input} />
                        <select required value={form.facultyId}
                            onChange={(e) => setForm({ ...form, facultyId: e.target.value, departmentId: '' })}
                            className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600">
                            <option value="" disabled>Select faculty</option>
                            {faculties.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                        <select value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600">
                            <option value="">Program / Department (optional)</option>
                            {depts.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                        <textarea placeholder="Statement of purpose (optional)" rows={3} value={form.statementOfPurpose}
                            onChange={(e) => setForm({ ...form, statementOfPurpose: e.target.value })} className={input} />
                        {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">{error}</div>}
                        <button type="submit" disabled={loading}
                            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 disabled:opacity-70 transition-colors">
                            {loading ? 'Submitting...' : 'Submit Application'}
                        </button>
                        <p className="text-center text-xs text-gray-500">
                            Already have an account? <a href="/login" className="text-blue-600 font-medium">Sign in</a>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}

