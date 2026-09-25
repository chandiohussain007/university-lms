'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard, BookOpen, Users, LogOut,
    CheckSquare, Plus, X, ChevronDown, Send, Star,
    ClipboardList, GraduationCap, Bell, TrendingUp, Calendar, Check, Minus
} from 'lucide-react';
import api from '@/lib/api';

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

    const [activeTab, setActiveTab] = useState<'courses' | 'assignments' | 'attendance'>('courses');
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

    const handleSelectSession = async (sessionId: string) => {
        try {
            const res = await api.get(`/attendance/sessions/${sessionId}`);
            setSelectedSession(res.data);
            const initialMarks: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {};
            if (res.data.records) {
                res.data.records.forEach((r: any) => {
                    initialMarks[r.studentProfileId] = r.status;
                });
            }
            setMarks(initialMarks);
        } catch (e) {
            console.error('Failed to load session details', e);
        }
    };

    const handleSaveAttendance = async () => {
        if (!selectedSession) return;
        setSavingAttendance(true);
        try {
            const recordsPayload = Object.entries(marks).map(([studentProfileId, status]) => ({
                studentProfileId,
                status,
            }));
            await api.post(`/attendance/sessions/${selectedSession.id}/records`, { records: recordsPayload });
            alert('Attendance saved successfully!');
            await handleSelectSession(selectedSession.id);
        } catch (err: any) {
            alert(err?.response?.data?.message ?? 'Failed to save attendance');
        } finally {
            setSavingAttendance(false);
        }
    };

    const handleGrade = async (submissionId: string) => {
        const g = grading[submissionId];
        if (!g?.grade) return;
        try {
            await api.post(`/assignments/submissions/${submissionId}/grade`, {
                grade: Number(g.grade),
                feedback: g.feedback || undefined,
            });
            await loadAssignments();
            setGrading(prev => { const n = { ...prev }; delete n[submissionId]; return n; });
        } catch (err: any) {
            alert(err?.response?.data?.message ?? 'Grading failed');
        }
    };

    useEffect(() => {
        const role = localStorage.getItem('role');
        const storedEmail = localStorage.getItem('email') || '';
        setEmail(storedEmail);
        if (role !== 'TEACHER') { router.push('/login'); return; }

        const load = async () => {
            try {
                const res = await api.get('/offerings/mine');
                const data: OfferingInfo[] = res.data;
                setOfferings(data);
                if (data.length > 0) {
                    setNewAsg((prev) => ({ ...prev, courseOfferingId: prev.courseOfferingId || data[0].id }));
                    setNewSession((prev) => ({ ...prev, courseOfferingId: prev.courseOfferingId || data[0].id }));
                }
                await Promise.all([loadAssignments(), loadSessions()]);
                const counts: Record<string, number> = {};
                await Promise.all(data.map(async (o) => {
                    try {
                        const r = await api.get(`/offerings/${o.id}/roster`);
                        counts[o.id] = r.data.length;
                    } catch { counts[o.id] = 0; }
                }));
                setRosterCounts(counts);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [router]);

    const handleLogout = () => {
        localStorage.clear();
        router.push('/login');
    };

    const totalStudents = Object.values(rosterCounts).reduce((a, b) => a + b, 0);
    const pendingSubmissionsCount = assignments.reduce((acc, asg) => {
        return acc + asg.submissions.filter(s => s.grade === null).length;
    }, 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
                    <p className="text-slate-400 text-sm">Loading teacher workspace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f0f1a] flex text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
                .glass { background: rgba(255,255,255,0.04); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.07); }
                .glass-hover:hover { background: rgba(255,255,255,0.07); }
                .stat-card { background: rgba(255,255,255,0.04); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.06); }
                .nav-active { background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.15)); border-color: rgba(99,102,241,0.3); }
            `}</style>

            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 flex flex-col border-r border-white/5" style={{ background: 'rgba(15,15,26,0.95)' }}>
                {/* Logo */}
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                            <GraduationCap size={18} />
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-white">Faculty Portal</h1>
                            <p className="text-[10px] text-slate-500">Instructor Workspace</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1">
                    {[
                        { icon: LayoutDashboard, label: 'Overview', id: 'courses' },
                        { icon: BookOpen, label: 'My Courses', id: 'courses' },
                        { icon: ClipboardList, label: 'Assignments', id: 'assignments' },
                        { icon: Calendar, label: 'Attendance Sessions', id: 'attendance' },
                    ].map(({ icon: Icon, label, id }) => (
                        <button
                            key={label}
                            onClick={() => setActiveTab(id as any)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${activeTab === id ? 'nav-active text-indigo-300 border-indigo-500/30' : 'text-slate-400 border-transparent glass-hover'}`}
                        >
                            <Icon size={17} />
                            {label}
                        </button>
                    ))}
                </nav>

                {/* User info */}
                <div className="p-4 border-t border-white/5">
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                            {email.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-medium text-white truncate">Faculty Member</p>
                            <p className="text-[10px] text-slate-500 truncate">{email}</p>
                        </div>
                    </div>
                    <button
                        id="teacher-logout-btn"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 rounded-xl hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut size={15} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {/* Header */}
                <header className="sticky top-0 z-10 border-b border-white/5 px-8 py-4 flex items-center justify-between" style={{ background: 'rgba(15,15,26,0.8)', backdropFilter: 'blur(20px)' }}>
                    <div>
                        <h2 className="text-xl font-bold text-white">Teacher Dashboard</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Manage courses, grade submissions, and track attendance</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowSessionForm(true)}
                            className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center gap-2"
                        >
                            <Plus size={15} /> Create Attendance Session
                        </button>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center gap-2"
                        >
                            <Plus size={15} /> Create Assignment
                        </button>
                    </div>
                </header>

                <div className="p-8">
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="stat-card rounded-2xl p-5">
                            <div className="inline-flex p-2 rounded-xl bg-indigo-500/10 text-indigo-400 mb-3"><BookOpen size={16} /></div>
                            <p className="text-2xl font-bold text-white">{offerings.length}</p>
                            <p className="text-xs text-slate-400">Assigned Courses</p>
                        </div>
                        <div className="stat-card rounded-2xl p-5">
                            <div className="inline-flex p-2 rounded-xl bg-purple-500/10 text-purple-400 mb-3"><Users size={16} /></div>
                            <p className="text-2xl font-bold text-white">{totalStudents}</p>
                            <p className="text-xs text-slate-400">Total Enrolled Students</p>
                        </div>
                        <div className="stat-card rounded-2xl p-5">
                            <div className="inline-flex p-2 rounded-xl bg-amber-500/10 text-amber-400 mb-3"><ClipboardList size={16} /></div>
                            <p className="text-2xl font-bold text-white">{assignments.length}</p>
                            <p className="text-xs text-slate-400">Total Assignments</p>
                        </div>
                        <div className="stat-card rounded-2xl p-5">
                            <div className="inline-flex p-2 rounded-xl bg-teal-500/10 text-teal-400 mb-3"><Calendar size={16} /></div>
                            <p className="text-2xl font-bold text-white">{sessions.length}</p>
                            <p className="text-xs text-slate-400">Attendance Sessions Logged</p>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-2 border-b border-white/5 mb-6">
                        <button
                            onClick={() => setActiveTab('courses')}
                            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${activeTab === 'courses' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                        >
                            My Offerings ({offerings.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('assignments')}
                            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${activeTab === 'assignments' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                        >
                            Assignments & Grading ({assignments.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('attendance')}
                            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${activeTab === 'attendance' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                        >
                            Attendance Sessions ({sessions.length})
                        </button>
                    </div>

                    {/* Courses Tab */}
                    {activeTab === 'courses' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {offerings.map((o) => (
                                <div key={o.id} className="glass rounded-2xl p-6 border border-white/5 space-y-4">
                                    <div>
                                        <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                                            {o.course.code}
                                        </span>
                                        <h3 className="text-lg font-bold text-white mt-3">{o.course.title}</h3>
                                        <p className="text-xs text-slate-400">{o.semester.name}</p>
                                    </div>
                                    <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                                        <span className="text-slate-400">Enrolled Students:</span>
                                        <span className="text-white font-bold">{rosterCounts[o.id] ?? 0}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Assignments Tab */}
                    {activeTab === 'assignments' && (
                        <div className="space-y-4">
                            {assignments.map((asg) => (
                                <div key={asg.id} className="glass rounded-2xl p-6 border border-white/5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                                                {asg.courseOffering.course.code}
                                            </span>
                                            <h3 className="text-base font-bold text-white mt-2">{asg.title}</h3>
                                            <p className="text-xs text-slate-400">Max Score: {asg.maxScore} • Submissions: {asg.submissions.length}</p>
                                        </div>
                                        <button
                                            onClick={() => setExpandedAssignment(expandedAssignment === asg.id ? null : asg.id)}
                                            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-xs font-semibold rounded-xl text-slate-300"
                                        >
                                            {expandedAssignment === asg.id ? 'Hide Submissions' : `View Submissions (${asg.submissions.length})`}
                                        </button>
                                    </div>

                                    {expandedAssignment === asg.id && (
                                        <div className="mt-6 pt-4 border-t border-white/5 space-y-4">
                                            {asg.submissions.length === 0 ? (
                                                <p className="text-xs text-slate-500">No submissions received yet.</p>
                                            ) : (
                                                asg.submissions.map((sub) => (
                                                    <div key={sub.id} className="bg-white/5 rounded-xl p-4 space-y-3">
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-indigo-300 font-semibold">{sub.student.user.email}</span>
                                                            <span className="text-slate-400">{sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : ''}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-300 bg-black/30 p-3 rounded-lg font-mono">{sub.content}</p>

                                                        {sub.grade !== null ? (
                                                            <div className="text-xs text-emerald-400 font-semibold">
                                                                Grade: {sub.grade} / {asg.maxScore} {sub.feedback ? `(${sub.feedback})` : ''}
                                                            </div>
                                                        ) : (
                                                            <div className="flex gap-3">
                                                                <input
                                                                    type="number"
                                                                    placeholder="Grade"
                                                                    className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs text-white"
                                                                    value={grading[sub.id]?.grade || ''}
                                                                    onChange={(e) => setGrading({ ...grading, [sub.id]: { ...grading[sub.id], grade: e.target.value } })}
                                                                />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Feedback (optional)"
                                                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs text-white"
                                                                    value={grading[sub.id]?.feedback || ''}
                                                                    onChange={(e) => setGrading({ ...grading, [sub.id]: { ...grading[sub.id], feedback: e.target.value } })}
                                                                />
                                                                <button
                                                                    onClick={() => handleGrade(sub.id)}
                                                                    className="px-4 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg"
                                                                >
                                                                    Save Grade
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Attendance Tab */}
                    {activeTab === 'attendance' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Sessions List */}
                            <div className="glass rounded-2xl p-6 space-y-4">
                                <h3 className="text-base font-bold text-white">Attendance Sessions</h3>
                                {sessions.length === 0 ? (
                                    <p className="text-xs text-slate-500">No attendance sessions created yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {sessions.map((s) => (
                                            <div
                                                key={s.id}
                                                onClick={() => handleSelectSession(s.id)}
                                                className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedSession?.id === s.id ? 'bg-indigo-500/20 border-indigo-500/40' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-xs font-bold text-indigo-300">{s.courseOffering?.course?.title}</p>
                                                        <p className="text-[11px] text-slate-400 mt-1">Date: {new Date(s.date).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                {s.topic && <p className="text-xs text-slate-300 mt-2">Topic: {s.topic}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Session Student Marking Panel */}
                            <div className="lg:col-span-2 glass rounded-2xl p-6">
                                {selectedSession ? (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-white">
                                                    Mark Attendance: {selectedSession.courseOffering?.course?.title}
                                                </h3>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    Session Date: {new Date(selectedSession.date).toLocaleDateString()} {selectedSession.topic ? `• Topic: ${selectedSession.topic}` : ''}
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleSaveAttendance}
                                                disabled={savingAttendance}
                                                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg"
                                            >
                                                {savingAttendance ? 'Saving...' : 'Save Attendance'}
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {selectedSession.records && selectedSession.records.length > 0 ? (
                                                selectedSession.records.map((r) => {
                                                    const currentStatus = marks[r.studentProfileId] || r.status;
                                                    return (
                                                        <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                                            <span className="text-xs font-medium text-white">{r.student?.user?.email || 'Student'}</span>
                                                            <div className="flex gap-2">
                                                                {(['PRESENT', 'ABSENT', 'LATE'] as const).map((st) => (
                                                                    <button
                                                                        key={st}
                                                                        onClick={() => setMarks({ ...marks, [r.studentProfileId]: st })}
                                                                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${currentStatus === st ? (st === 'PRESENT' ? 'bg-emerald-500 text-white' : st === 'ABSENT' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white') : 'bg-white/5 text-slate-400 hover:text-white'}`}
                                                                    >
                                                                        {st}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <p className="text-xs text-slate-500">No student records initialized for this session yet.</p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-16 text-slate-500">
                                        <Calendar size={40} className="mx-auto mb-3 text-slate-700" />
                                        <p className="text-sm">Select an attendance session from the left to mark student attendance.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Create Session Modal */}
            {showSessionForm && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="glass rounded-2xl max-w-md w-full p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white">Create Attendance Session</h3>
                            <button onClick={() => setShowSessionForm(false)}><X size={18} className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleCreateSession} className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Select Course Offering</label>
                                <select
                                    value={newSession.courseOfferingId}
                                    onChange={(e) => setNewSession({ ...newSession, courseOfferingId: e.target.value })}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white"
                                >
                                    {offerings.map((o) => (
                                        <option key={o.id} value={o.id}>{o.course.title} ({o.course.code})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Date</label>
                                <input
                                    type="date"
                                    value={newSession.date}
                                    onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Topic / Lecture Title (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Introduction to Algorithms"
                                    value={newSession.topic}
                                    onChange={(e) => setNewSession({ ...newSession, topic: e.target.value })}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={creatingSession}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all"
                            >
                                {creatingSession ? 'Creating...' : 'Create Session'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Assignment Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="glass rounded-2xl max-w-md w-full p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white">Create New Assignment</h3>
                            <button onClick={() => setShowCreateForm(false)}><X size={18} className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleCreateAssignment} className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Course Offering</label>
                                <select
                                    value={newAsg.courseOfferingId}
                                    onChange={(e) => setNewAsg({ ...newAsg, courseOfferingId: e.target.value })}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white"
                                >
                                    {offerings.map((o) => (
                                        <option key={o.id} value={o.id}>{o.course.title} ({o.course.code})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={newAsg.title}
                                    onChange={(e) => setNewAsg({ ...newAsg, title: e.target.value })}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Description</label>
                                <textarea
                                    value={newAsg.description}
                                    onChange={(e) => setNewAsg({ ...newAsg, description: e.target.value })}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">Max Score</label>
                                    <input
                                        type="number"
                                        value={newAsg.maxScore}
                                        onChange={(e) => setNewAsg({ ...newAsg, maxScore: e.target.value })}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        value={newAsg.dueDate}
                                        onChange={(e) => setNewAsg({ ...newAsg, dueDate: e.target.value })}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={creating}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all"
                            >
                                {creating ? 'Creating...' : 'Create Assignment'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
