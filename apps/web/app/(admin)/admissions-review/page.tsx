'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Clock, ClipboardCheck, Filter } from 'lucide-react';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';

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

type FilterType = 'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED';

export default function AdmissionsReviewPage() {
    const [apps, setApps] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<FilterType>('ALL');

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

    useEffect(() => { load(); }, []);

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

    const counts = {
        ALL: apps.length,
        PENDING: apps.filter(a => a.status === 'PENDING').length,
        ACCEPTED: apps.filter(a => a.status === 'ACCEPTED').length,
        REJECTED: apps.filter(a => a.status === 'REJECTED').length,
    };

    const filtered = filter === 'ALL' ? apps : apps.filter(a => a.status === filter);

    const filterTabs: { key: FilterType; label: string; color: string; activeBg: string; activeText: string }[] = [
        { key: 'ALL',      label: `All (${counts.ALL})`,           color: '#475569', activeBg: '#0F172A', activeText: '#FFFFFF' },
        { key: 'PENDING',  label: `Pending (${counts.PENDING})`,   color: '#A16207', activeBg: '#FEF9C3', activeText: '#A16207' },
        { key: 'ACCEPTED', label: `Accepted (${counts.ACCEPTED})`, color: '#15803D', activeBg: '#DCFCE7', activeText: '#15803D' },
        { key: 'REJECTED', label: `Rejected (${counts.REJECTED})`, color: '#B91C1C', activeBg: '#FEE2E2', activeText: '#B91C1C' },
    ];

    return (
        <div className="animate-fade-up">
            <PageHeader
                title="Admissions Review"
                subtitle="Review applications. Accepting creates the student account automatically."
            />

            {error && (
                <div
                    className="text-sm p-3 rounded-xl mb-4"
                    style={{ background: '#FEE2E2', color: '#B91C1C', border: '1px solid #FCA5A5' }}
                >
                    {error}
                </div>
            )}

            {/* Filter tabs */}
            <div className="flex gap-2 mb-5 flex-wrap">
                {filterTabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all border"
                        style={
                            filter === tab.key
                                ? { background: tab.activeBg, color: tab.activeText, borderColor: tab.activeBg }
                                : { background: '#FFFFFF', color: '#475569', borderColor: '#E2E8F0' }
                        }
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Applications list */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="spinner w-8 h-8" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="card p-16 text-center">
                    <ClipboardCheck size={40} className="mx-auto mb-4" style={{ color: '#CBD5E1' }} />
                    <p className="text-sm" style={{ color: '#94A3B8' }}>
                        {filter === 'ALL' ? 'No applications submitted yet.' : `No ${filter.toLowerCase()} applications.`}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(a => (
                        <div key={a.id} className="card card-hover p-6">
                            {/* Top row */}
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                                <div className="flex items-start gap-4">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 mt-0.5"
                                        style={{ background: '#1D4ED8' }}
                                    >
                                        {a.fullName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2.5 flex-wrap">
                                            <h3 className="text-base font-bold" style={{ color: '#0F172A' }}>
                                                {a.fullName}
                                            </h3>
                                            <span
                                                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded"
                                                style={{ background: '#F1F5F9', color: '#94A3B8' }}
                                            >
                                                {a.applicationCode}
                                            </span>
                                        </div>
                                        <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>{a.email}</p>
                                        <div className="flex gap-2 mt-2 flex-wrap">
                                            {a.faculty && (
                                                <span
                                                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                                                    style={{ background: '#DBEAFE', color: '#1D4ED8' }}
                                                >
                                                    {a.faculty.name}
                                                </span>
                                            )}
                                            {a.department && (
                                                <span
                                                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                                                    style={{ background: '#F3E8FF', color: '#6B21A8' }}
                                                >
                                                    {a.department.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <StatusBadge status={a.status} />
                            </div>

                            {/* Statement */}
                            {a.statementOfPurpose && (
                                <p
                                    className="text-sm italic mb-4 line-clamp-2 pl-4 border-l-2"
                                    style={{ color: '#64748B', borderColor: '#CBD5E1' }}
                                >
                                    "{a.statementOfPurpose}"
                                </p>
                            )}

                            {/* Actions or decided date */}
                            <div
                                className="flex items-center justify-between pt-4 border-t"
                                style={{ borderColor: '#F1F5F9' }}
                            >
                                {a.decidedAt && (
                                    <p className="text-xs" style={{ color: '#94A3B8' }}>
                                        Decided: {new Date(a.decidedAt).toLocaleDateString()}
                                    </p>
                                )}
                                {!a.decidedAt && <span />}

                                {a.status === 'PENDING' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => decide(a.id, 'ACCEPT')}
                                            disabled={busy === a.id}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-colors"
                                            style={{ background: '#16A34A' }}
                                            onMouseEnter={e => (e.currentTarget.style.background = '#15803D')}
                                            onMouseLeave={e => (e.currentTarget.style.background = '#16A34A')}
                                        >
                                            <CheckCircle2 size={14} />
                                            {busy === a.id ? 'Processing…' : 'Accept'}
                                        </button>
                                        <button
                                            onClick={() => decide(a.id, 'REJECT')}
                                            disabled={busy === a.id}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-colors"
                                            style={{ background: '#DC2626' }}
                                            onMouseEnter={e => (e.currentTarget.style.background = '#B91C1C')}
                                            onMouseLeave={e => (e.currentTarget.style.background = '#DC2626')}
                                        >
                                            <XCircle size={14} />
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
