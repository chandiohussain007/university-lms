'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard, BookOpen, Users, LogOut,
    CheckSquare, Plus, X, ChevronDown, Send, Star,
    ClipboardList, GraduationCap, Bell, TrendingUp, Calendar, Check, Minus, Clock
} from 'lucide-react';
import api from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';

interface OfferingInfo {
    id: string;
    course: { id: string; title: string; code: string; credits: number; };
    semester: { id: string; name: string; isActive: boolean; };
    teacher: { designation: string; user: { email: string } };
}

interface TeacherAssignment {
    id: string; title: string; description: string | null;
    dueDate: string | null; maxScore: number;
    courseOffering: OfferingInfo;
    submissions: Array<{
        id: string; content: string | null; grade: number | null;
        feedback: string | null; submittedAt: string | null;
        student: { user: { email: string } };
    }>;
}

interface AttendanceSession {
    id: string;
    date: string;
    topic?: string | null;
    courseOffering: OfferingInfo;
    records?: Array<{
        id: string;
        studentProfileId: string;
        status: 'PRESENT' | 'ABSENT' | 'LATE';
        student?: { id: string; user?: { email: string } };
    }>;
}

export default function TeacherDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [offerings, setOfferings] = useState<OfferingInfo[]>([]);
    const [rosterCounts, setRosterCounts] = useState<Record<string, number>>({});
    const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
    const [sessions, setSessions] = useState<AttendanceSession[]>([]);
    const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);

    // Form states
    const [newAsg, setNewAsg] = useState({ title: '', description: '', courseOfferingId: '', maxScore: '100', dueDate: '' });
    const [newSession, setNewSession] = useState({ courseOfferingId: '', date: new Date().toISOString().split('T')[0], topic: '' });
    const [creating, setCreating] = useState(false);
    const [creatingSession, setCreatingSession] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showSessionForm, setShowSessionForm] = useState(false);

    // Grading & attendance marking state
    const [grading, setGrading] = useState<Record<string, { grade: string; feedback: string }>>({});
    const [marks, setMarks] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>>({});
    const [savingAttendance, setSavingAttendance] = useState(false);

    const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'assignments' | 'attendance'>('overview');
    const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null);

    const loadAssignments = async () => {
        const res = await api.get('/assignments/mine');
        setAssignments(res.data);
    };

    const loadSessions = async () => {
        try {
            const res = await api.get('/attendance/sessions/mine');
            setSessions(res.data);
        } catch (e) {
            console.error('Failed to load sessions', e);
        }
    };

    const handleCreateAssignment = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            await api.post('/assignments', {
                title: newAsg.title,
                description: newAsg.description || undefined,
                courseOfferingId: newAsg.courseOfferingId,
                maxScore: Number(newAsg.maxScore) || 100,
                dueDate: newAsg.dueDate || undefined,
            });
            setNewAsg({ title: '', description: '', courseOfferingId: newAsg.courseOfferingId, maxScore: '100', dueDate: '' });
            setShowCreateForm(false);
            await loadAssignments();
        } catch (err: any) {
            alert(err?.response?.data?.message ?? 'Failed to create assignment');
        } finally {
            setCreating(false);
        }
    };

    const handleCreateSession = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreatingSession(true);
        try {
            await api.post('/attendance/sessions', {
                courseOfferingId: newSession.courseOfferingId,
                date: newSession.date,
                topic: newSession.topic || undefined,
            });
            setNewSession({ courseOfferingId: newSession.courseOfferingId, date: new Date().toISOString().split('T')[0], topic: '' });
            setShowSessionForm(false);
            await loadSessions();
        } catch (err: any) {
            alert(err?.response?.data?.message ?? 'Failed to create attendance session');
        } finally {
            setCreatingSession(false);
        }
    };

    const handleOpenSession = async (session: AttendanceSession) => {
        try {
            const res = await api.get(`/attendance/sessions/${session.id}`);
            setSelectedSession(res.data);
            const initialMarks: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {};
            (res.data.records || []).forEach((r: any) => {
                initialMarks[r.studentProfileId] = r.status;
            });
            setMarks(initialMarks);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSaveAttendance = async () => {
        if (!selectedSession) return;
        setSavingAttendance(true);
        try {
            const records = Object.entries(marks).map(([studentProfileId, status]) => ({
                studentProfileId,
                status,
            }));
            await api.post(`/attendance/sessions/${selectedSession.id}/records`, { records });
            await handleOpenSession(selectedSession);
            await loadSessions();
            alert('Attendance saved successfully');
        } catch (err: any) {
            alert(err?.response?.data?.message ?? 'Failed to save attendance');
        } finally {
            setSavingAttendance(false);
        }
    };

    const handleGradeSubmission = async (submissionId: string) => {
        const data = grading[submissionId];
        if (!data?.grade) return;
        try {
            await api.post(`/assignments/submissions/${submissionId}/grade`, {
                grade: Number(data.grade),
                feedback: data.feedback || undefined,
            });
            await loadAssignments();
            alert('Grade recorded successfully');
        } catch (err: any) {
            alert(err?.response?.data?.message ?? 'Failed to grade');
        }
    };

    useEffect(() => {
        setEmail(localStorage.getItem('email') || 'faculty');
        const role = localStorage.getItem('role');
        if (role !== 'TEACHER') { router.push('/login'); return; }

        const init = async () => {
            try {
                const offRes = await api.get('/courses/my-offerings');
                setOfferings(offRes.data);
                if (offRes.data.length > 0) {
                    setNewAsg(p => ({ ...p, courseOfferingId: offRes.data[0].id }));
                    setNewSession(p => ({ ...p, courseOfferingId: offRes.data[0].id }));
                }

                const counts: Record<string, number> = {};
                for (const off of offRes.data) {
                    try {
                        const r = await api.get(`/enrollments/offering/${off.id}/roster`);
                        counts[off.id] = r.data.length;
                    } catch { counts[off.id] = 0; }
                }
                setRosterCounts(counts);
                await Promise.all([loadAssignments(), loadSessions()]);
            } catch (err) {
                console.error('Failed to init teacher workspace', err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [router]);

    const totalStudents = Object.values(rosterCounts).reduce((a, b) => a + b, 0);
    const totalSubmissions = assignments.reduce((acc, a) => acc + (a.submissions?.length || 0), 0);
    const gradedSubmissions = assignments.reduce((acc, a) => 
        acc + (a.submissions?.filter(s => s.grade !== null).length || 0), 0);
    const pendingGradingCount = totalSubmissions - gradedSubmissions;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8FAFC' }}>
                <div className="text-center">
                    <div className="spinner w-8 h-8 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-500">Loading faculty workspace…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex" style={{ background: '#F8FAFC' }}>
            <Sidebar role="TEACHER" email={email} />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 flex-shrink-0 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-xs">
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">Faculty Workspace</h1>
                        <p className="text-xs text-slate-500">Course Instruction & Evaluation Portal</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-bold">
                            {email.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-8 overflow-auto animate-fade-up">
                    {/* Bento Stat Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <StatCard
                            label="Course Offerings"
                            value={offerings.length}
                            icon={BookOpen}
                            iconBg="#1D4ED8"
                            subLabel="Active semester sections"
                        />
                        <StatCard
                            label="Enrolled Students"
                            value={totalStudents}
                            icon={Users}
                            iconBg="#0D9488"
                            subLabel="Across all sections"
                        />
                        <StatCard
                            label="Active Assignments"
                            value={assignments.length}
                            icon={ClipboardList}
                            iconBg="#7C3AED"
                            subLabel="Coursework tasks"
                        />
                        <StatCard
                            label="Pending Evaluation"
                            value={pendingGradingCount}
                            icon={Clock}
                            iconBg="#EA580C"
                            subLabel="Ungraded submissions"
                        />
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-1.5 p-1 bg-slate-200/70 rounded-xl w-fit mb-6 overflow-x-auto">
                        {(['overview', 'courses', 'assignments', 'attendance'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${
                                    activeTab === tab
                                        ? 'bg-white text-slate-900 shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                {tab === 'overview' ? 'Overview'
                                : tab === 'courses' ? `Offerings (${offerings.length})`
                                : tab === 'assignments' ? `Assignments (${assignments.length})`
                                : `Attendance Sessions (${sessions.length})`}
                            </button>
                        ))}
                    </div>

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="card p-6">
                                    <h3 className="text-base font-bold text-slate-900 mb-2">Teaching Schedule Overview</h3>
                                    <p className="text-xs text-slate-500 mb-4">You are assigned as the instructor of record for {offerings.length} course sections.</p>
                                    <div className="space-y-3">
                                        {offerings.map((o) => (
                                            <div key={o.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                                                <div>
                                                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                                                        {o.course.code}
                                                    </span>
                                                    <p className="text-sm font-semibold text-slate-900 mt-1">{o.course.title}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs font-bold text-slate-700">{rosterCounts[o.id] || 0} Students</span>
                                                    <p className="text-[10px] text-slate-400">{o.semester.name}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="card p-6">
                                    <h3 className="text-base font-bold text-slate-900 mb-2">Quick Evaluation Queue</h3>
                                    <p className="text-xs text-slate-500 mb-4">Latest student assignments requiring grading and feedback.</p>
                                    {pendingGradingCount === 0 ? (
                                        <div className="p-8 text-center text-xs text-slate-400">
                                            All submitted assignments have been evaluated!
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {assignments.filter(a => a.submissions?.some(s => s.grade === null)).slice(0, 3).map((a) => (
                                                <div key={a.id} className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center justify-between">
                                                    <div>
                                                        <span className="text-xs font-bold text-amber-800">{a.courseOffering.course.code}</span>
                                                        <p className="text-sm font-semibold text-slate-900">{a.title}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => { setActiveTab('assignments'); setExpandedAssignment(a.id); }}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 transition-colors"
                                                    >
                                                        Review Now
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Courses Tab */}
                    {activeTab === 'courses' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {offerings.map((o) => (
                                <div key={o.id} className="card card-hover p-6 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                                                {o.course.code}
                                            </span>
                                            <span className="text-xs font-semibold text-slate-400">{o.course.credits} Credits</span>
                                        </div>
                                        <h3 className="text-base font-bold text-slate-900">{o.course.title}</h3>
                                        <p className="text-xs text-slate-500 mt-1">{o.semester.name}</p>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                                        <span className="text-slate-500">Roster Capacity</span>
                                        <span className="font-bold text-slate-900">{rosterCounts[o.id] || 0} Enrolled</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Assignments Tab */}
                    {activeTab === 'assignments' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Coursework & Tasks</h3>
                                    <p className="text-xs text-slate-500">Publish assessments, view submissions, and record marks.</p>
                                </div>
                                <button
                                    onClick={() => setShowCreateForm(v => !v)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2"
                                    style={{ background: '#1D4ED8' }}
                                >
                                    <Plus size={15} /> Create Assignment
                                </button>
                            </div>

                            {/* Create Form */}
                            {showCreateForm && (
                                <div className="card p-6 border-blue-200 bg-blue-50/50">
                                    <h4 className="text-sm font-bold text-blue-900 mb-4">New Course Assignment</h4>
                                    <form onSubmit={handleCreateAssignment} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Offering</label>
                                                <select
                                                    required
                                                    value={newAsg.courseOfferingId}
                                                    onChange={(e) => setNewAsg({ ...newAsg, courseOfferingId: e.target.value })}
                                                    className="select-field"
                                                >
                                                    {offerings.map(o => (
                                                        <option key={o.id} value={o.id}>{o.course.code} - {o.course.title}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">Assignment Title</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="e.g. Midterm Lab Report"
                                                    value={newAsg.title}
                                                    onChange={(e) => setNewAsg({ ...newAsg, title: e.target.value })}
                                                    className="input-field"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">Max Score</label>
                                                <input
                                                    type="number"
                                                    required
                                                    value={newAsg.maxScore}
                                                    onChange={(e) => setNewAsg({ ...newAsg, maxScore: e.target.value })}
                                                    className="input-field"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                                            <input
                                                type="date"
                                                value={newAsg.dueDate}
                                                onChange={(e) => setNewAsg({ ...newAsg, dueDate: e.target.value })}
                                                className="input-field max-w-xs"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Prompt</label>
                                            <textarea
                                                rows={3}
                                                value={newAsg.description}
                                                onChange={(e) => setNewAsg({ ...newAsg, description: e.target.value })}
                                                className="input-field"
                                                placeholder="Provide assignment guidelines or submission format…"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="submit"
                                                disabled={creating}
                                                className="px-5 py-2 rounded-xl text-xs font-bold text-white"
                                                style={{ background: '#1D4ED8' }}
                                            >
                                                {creating ? 'Publishing…' : 'Publish Assignment'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowCreateForm(false)}
                                                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* List */}
                            <div className="space-y-4">
                                {assignments.map((a) => {
                                    const isExpanded = expandedAssignment === a.id;
                                    return (
                                        <div key={a.id} className="card card-hover p-6">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div>
                                                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
                                                        {a.courseOffering.course.code}
                                                    </span>
                                                    <h4 className="text-base font-bold text-slate-900 mt-1">{a.title}</h4>
                                                    <p className="text-xs text-slate-500">Max Score: {a.maxScore} • Submissions: {a.submissions?.length || 0}</p>
                                                </div>
                                                <button
                                                    onClick={() => setExpandedAssignment(isExpanded ? null : a.id)}
                                                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
                                                >
                                                    {isExpanded ? 'Hide Submissions' : `Grade Submissions (${a.submissions?.length || 0})`}
                                                </button>
                                            </div>

                                            {isExpanded && (
                                                <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
                                                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Student Submission Roster</h5>
                                                    {(!a.submissions || a.submissions.length === 0) ? (
                                                        <p className="text-xs text-slate-400 py-4 text-center">No student submissions received yet.</p>
                                                    ) : (
                                                        <div className="divide-y divide-slate-100">
                                                            {a.submissions.map((sub) => (
                                                                <div key={sub.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                                    <div className="space-y-1">
                                                                        <span className="text-sm font-semibold text-slate-900">{sub.student?.user?.email}</span>
                                                                        <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 max-w-xl">
                                                                            <strong>Work:</strong> {sub.content || 'No content link'}
                                                                        </p>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <input
                                                                            type="number"
                                                                            placeholder="Score"
                                                                            defaultValue={sub.grade ?? ''}
                                                                            onChange={(e) => setGrading(p => ({
                                                                                ...p,
                                                                                [sub.id]: { ...(p[sub.id] || {}), grade: e.target.value }
                                                                            }))}
                                                                            className="input-field w-20 text-center"
                                                                        />
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Feedback"
                                                                            defaultValue={sub.feedback ?? ''}
                                                                            onChange={(e) => setGrading(p => ({
                                                                                ...p,
                                                                                [sub.id]: { ...(p[sub.id] || {}), feedback: e.target.value }
                                                                            }))}
                                                                            className="input-field w-48"
                                                                        />
                                                                        <button
                                                                            onClick={() => handleGradeSubmission(sub.id)}
                                                                            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700"
                                                                        >
                                                                            Save Mark
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Attendance Tab */}
                    {activeTab === 'attendance' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Attendance Register</h3>
                                    <p className="text-xs text-slate-500">Record and verify daily lecture attendance.</p>
                                </div>
                                <button
                                    onClick={() => setShowSessionForm(v => !v)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2"
                                    style={{ background: '#1D4ED8' }}
                                >
                                    <Plus size={15} /> New Attendance Session
                                </button>
                            </div>

                            {/* Create Session Form */}
                            {showSessionForm && (
                                <div className="card p-6 border-blue-200 bg-blue-50/50">
                                    <h4 className="text-sm font-bold text-blue-900 mb-4">Start Class Attendance Session</h4>
                                    <form onSubmit={handleCreateSession} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">Course Offering</label>
                                                <select
                                                    required
                                                    value={newSession.courseOfferingId}
                                                    onChange={(e) => setNewSession({ ...newSession, courseOfferingId: e.target.value })}
                                                    className="select-field"
                                                >
                                                    {offerings.map(o => (
                                                        <option key={o.id} value={o.id}>{o.course.code} - {o.course.title}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">Session Date</label>
                                                <input
                                                    type="date"
                                                    required
                                                    value={newSession.date}
                                                    onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                                                    className="input-field"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">Topic / Lecture Title</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Chapter 4 - Tree Traversal"
                                                    value={newSession.topic}
                                                    onChange={(e) => setNewSession({ ...newSession, topic: e.target.value })}
                                                    className="input-field"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="submit"
                                                disabled={creatingSession}
                                                className="px-5 py-2 rounded-xl text-xs font-bold text-white"
                                                style={{ background: '#1D4ED8' }}
                                            >
                                                {creatingSession ? 'Starting…' : 'Create Session'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowSessionForm(false)}
                                                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Sessions Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sessions.map((s) => (
                                    <div key={s.id} className="card card-hover p-6 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                                                    {s.courseOffering?.course?.code}
                                                </span>
                                                <span className="text-xs text-slate-500 font-semibold">{new Date(s.date).toLocaleDateString()}</span>
                                            </div>
                                            <h4 className="text-sm font-bold text-slate-900">{s.topic || 'Regular Lecture Session'}</h4>
                                        </div>
                                        <button
                                            onClick={() => handleOpenSession(s)}
                                            className="mt-6 w-full py-2 rounded-xl text-xs font-bold text-blue-700 border border-blue-200 bg-blue-50/70 hover:bg-blue-100 transition-colors"
                                        >
                                            Mark / Edit Attendance
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Active Marking Modal/Roster */}
                            {selectedSession && (
                                <div className="card p-6 border-blue-300">
                                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                                        <div>
                                            <h4 className="text-base font-bold text-slate-900">
                                                Attendance: {selectedSession.courseOffering?.course?.code} - {selectedSession.topic || 'Class Session'}
                                            </h4>
                                            <p className="text-xs text-slate-500">Date: {new Date(selectedSession.date).toLocaleDateString()}</p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedSession(null)}
                                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>

                                    {(!selectedSession.records || selectedSession.records.length === 0) ? (
                                        <p className="text-xs text-slate-400 py-6 text-center">No enrolled students in this section roster.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {selectedSession.records.map((r) => (
                                                <div key={r.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                                                    <span className="text-sm font-semibold text-slate-800">{r.student?.user?.email}</span>
                                                    <div className="flex gap-2">
                                                        {(['PRESENT', 'LATE', 'ABSENT'] as const).map((status) => {
                                                            const currentMark = marks[r.studentProfileId] || r.status;
                                                            const isSelected = currentMark === status;
                                                            return (
                                                                <button
                                                                    key={status}
                                                                    type="button"
                                                                    onClick={() => setMarks(p => ({ ...p, [r.studentProfileId]: status }))}
                                                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                                                        isSelected
                                                                            ? status === 'PRESENT' ? 'bg-emerald-600 text-white'
                                                                            : status === 'LATE' ? 'bg-amber-600 text-white'
                                                                            : 'bg-rose-600 text-white'
                                                                            : 'bg-white border border-slate-200 text-slate-600'
                                                                    }`}
                                                                >
                                                                    {status}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="pt-4 flex justify-end">
                                                <button
                                                    onClick={handleSaveAttendance}
                                                    disabled={savingAttendance}
                                                    className="px-6 py-2.5 rounded-xl font-bold text-xs text-white"
                                                    style={{ background: '#1D4ED8' }}
                                                >
                                                    {savingAttendance ? 'Saving…' : 'Save Attendance Register'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
