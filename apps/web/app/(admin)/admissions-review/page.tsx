'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Application {
    id: string;
    applicationCode: string;
    fullName: string;
    email: string;
    status: string;
    statementOfPurpose: string | null;
    decidedAt: string | null;
    faculty: { name: string } | null;
    department: { name: string } | null;
}

export default function AdmissionsReviewPage() {
    const [apps, setApps] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState('');

    const load = async () => {
        try {
            const res = await api.get('/admissions');
            setApps(res.data);
        } catch (err: any) {
            setError(err?.response?.data?.message ?? 'Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const decide = async (id: string, decision: 'ACCEPT' | 'REJECT') => {
        setBusy(id);
        setError('');
        try {
            await api.post(`/admissions/${id}/decision`, { decision });
            await load();
        } catch (err: any) {
            setError(err?.response?.data?.message ?? 'Decision failed');
        } finally {
            setBusy(null);
        }
    };

    const badge = (status: string) => {
        const map: Record<string, string> = {
            PENDING: 'bg-amber-100 text-amber-700',
            ACCEPTED: 'bg-green-100 text-green-700',
            REJECTED: 'bg-red-100 text-red-700',
        };
        return <span className={`px-2 py-1 text-xs font-bold rounded ${map[status] ?? 'bg-zinc-100 text-zinc-700'}`}>{status}</span>;
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">Admissions</h1>
            <p className="text-zinc-500 mb-6">Review applications. Accepting creates the student account automatically.</p>

            {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200 mb-4">{error}</div>}

            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                        <tr>
                            <th className="p-4 font-medium text-zinc-500 dark:text-zinc-400">Code</th>
                            <th className="p-4 font-medium text-zinc-500 dark:text-zinc-400">Applicant</th>
                            <th className="p-4 font-medium text-zinc-500 dark:text-zinc-400">Program</th>
                            <th className="p-4 font-medium text-zinc-500 dark:text-zinc-400">Status</th>
                            <th className="p-4 font-medium text-zinc-500 dark:text-zinc-400">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
                        ) : apps.length === 0 ? (
                            <tr><td colSpan={5} className="p-4 text-center text-zinc-500">No applications yet.</td></tr>
                        ) : (
                            apps.map((a) => (
                                <tr key={a.id} className="border-t border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                    <td className="p-4 font-mono text-xs text-zinc-500">{a.applicationCode}</td>
                                    <td className="p-4">
                                        <div className="font-medium">{a.fullName}</div>
                                        <div className="text-xs text-zinc-500">{a.email}</div>
                                    </td>
                                    <td className="p-4 text-sm">
                                        {a.department ? a.department.name : a.faculty?.name ?? '—'}
                                    </td>
                                    <td className="p-4">{badge(a.status)}</td>
                                    <td className="p-4">
                                        {a.status === 'PENDING' ? (
                                            <div className="flex gap-2">
                                                <button onClick={() => decide(a.id, 'ACCEPT')} disabled={busy === a.id}
                                                    className="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-500 disabled:opacity-50">
                                                    Accept
                                                </button>
                                                <button onClick={() => decide(a.id, 'REJECT')} disabled={busy === a.id}
                                                    className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-500 disabled:opacity-50">
                                                    Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-zinc-400">
                                                {a.decidedAt ? new Date(a.decidedAt).toLocaleDateString() : ''}
                                            </span>
                                        )}
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
