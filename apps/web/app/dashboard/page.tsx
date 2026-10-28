'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard, BookOpen, ClipboardList, Calendar,
    Award, CheckCircle2, Clock, MapPin, Bell,
    Check, X, Minus, Download, FileText, CheckCheck, Sparkles, AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';

interface Course { id: string; title: string; code: string; credits: number; }
interface CourseOffering {
    id: string; course: Course;
    semester: { name: string };
    teacher: { designation: string; user: { email: string } };
}
interface Enrollment { id: string; status: string; courseOffering: CourseOffering; grade?: number; letterGrade?: string; gradePoints?: number; }
interface MyAssignment {
    id: string; title: string; description: string | null;
    dueDate: string | null; maxScore: number;
    courseOffering: CourseOffering;
    mySubmission: { id: string; grade: number | null; feedback: string | null; submittedAt: string } | null;
}
interface AttendanceRecord {
    id: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE';
    note?: string | null;
    session: {
        id: string;
        date: string;
        topic?: string | null;
        courseOffering: CourseOffering;
    };
}
interface GpaData {
    gpa: number;
    totalCreditsCompleted: number;
    totalCoursesCompleted: number;
    breakdown: Array<{
        id: string;
        courseCode: string;
        courseTitle: string;
        semester: string;
        credits: number;
        grade: number;
        letterGrade: string;
        gradePoints: number;
    }>;
}
interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}
interface ScheduleSlot {
    id: string;
    dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
    startTime: string;
    endTime: string;
    room?: string | null;
    courseOffering: CourseOffering;
}

const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;

// Research-proven academic accent bars
const COURSE_ACCENTS = [
    { border: '#1D4ED8', badgeBg: '#EFF6FF', badgeText: '#1D4ED8' },
    { border: '#0D9488', badgeBg: '#F0FDFA', badgeText: '#0D9488' },
    { border: '#7C3AED', badgeBg: '#F5F3FF', badgeText: '#7C3AED' },
    { border: '#D97706', badgeBg: '#FFFBEB', badgeText: '#D97706' },
    { border: '#2563EB', badgeBg: '#EFF6FF', badgeText: '#2563EB' },
    { border: '#E11D48', badgeBg: '#FFF1F2', badgeText: '#E11D48' },
];

export default function DashboardPage() {
    const router = useRouter();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [assignments, setAssignments] = useState<MyAssignment[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [gpaData, setGpaData] = useState<GpaData | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);

    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [submitText, setSubmitText] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'courses' | 'assignments' | 'attendance' | 'transcript' | 'schedule'>('courses');

    const totalCredits = enrollments
        .filter((e) => e.status === 'ENROLLED' || e.status === 'COMPLETED')
        .reduce((sum, e) => sum + (e.courseOffering.course.credits || 0), 0);

    const pendingAssignments = assignments.filter((a) => !a.mySubmission);
    const presentCount = attendance.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
    const attendanceRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 100;
    const unreadNotifCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        setEmail(localStorage.getItem('email') || 'student');
        const role = localStorage.getItem('role');
        if (role !== 'STUDENT') { router.push('/login'); return; }

        const fetchData = async () => {
            try {
                const [enrollRes, asgRes, attRes, gpaRes, notifRes, schedRes] = await Promise.all([
                    api.get('/enrollments/my'),
                    api.get('/assignments/student'),
                    api.get('/attendance/my-attendance').catch(() => ({ data: [] })),
                    api.get('/enrollments/gpa').catch(() => ({ data: null })),
                    api.get('/notifications').catch(() => ({ data: [] })),
                    api.get('/enrollments/my-schedule').catch(() => ({ data: [] })),
                ]);
                setEnrollments(enrollRes.data);
                setAssignments(asgRes.data);
                setAttendance(attRes.data);
                setGpaData(gpaRes.data);
                setNotifications(notifRes.data);
                setSchedule(schedRes.data);
            } catch (error) {
                console.error('Failed to fetch data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [router]);

    const handleMarkNotifRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (e) {
            console.error(e);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.post('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (e) {
            console.error(e);
        }
    };

    const handleSubmitAssignment = async (assignmentId: string) => {
        setSubmitting(assignmentId);
        try {
            await api.post(`/assignments/${assignmentId}/submit`, { content: submitText[assignmentId] });
            const res2 = await api.get('/assignments/student');
            setAssignments(res2.data);
            setSubmitText((prev) => ({ ...prev, [assignmentId]: '' }));
        } catch (err: any) {
            alert(err?.response?.data?.message ?? 'Submission failed');
        } finally {
            setSubmitting(null);
        }
    };

    const getDueDateBadge = (dueDate: string | null) => {
        if (!dueDate) return null;
        const due = new Date(dueDate);
        const now = new Date();
        const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return { label: 'Overdue', bg: '#FEE2E2', text: '#B91C1C', border: '#FCA5A5' };
        if (diffDays === 0) return { label: 'Due Today', bg: '#FEF9C3', text: '#A16207', border: '#FDE047' };
        if (diffDays <= 3) return { label: `${diffDays}d left`, bg: '#FFEDD5', text: '#C2410C', border: '#FDBA74' };
        return { label: due.toLocaleDateString(), bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' };
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8FAFC' }}>
                <div className="text-center">
                    <div className="spinner w-8 h-8 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-500">Loading student portal…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex" style={{ background: '#F8FAFC' }}>
            <Sidebar role="STUDENT" email={email} />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 flex-shrink-0 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-xs">
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">Student Portal</h1>
                        <p className="text-xs text-slate-500">Academic Progress & Dashboard</p>
                    </div>

                    <div className="flex items-center gap-3 relative">
                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                                className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center relative transition-colors"
                            >
                                <Bell size={16} />
                                {unreadNotifCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                                        {unreadNotifCount}
                                    </span>
                                )}
                            </button>

                            {showNotifDropdown && (
                                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4 space-y-3">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                        <span className="text-xs font-bold text-slate-900">
                                            Notifications ({unreadNotifCount} unread)
                                        </span>
                                        {unreadNotifCount > 0 && (
                                            <button
                                                onClick={handleMarkAllRead}
                                                className="text-[11px] text-blue-700 hover:text-blue-800 font-semibold flex items-center gap-1"
                                            >
                                                <CheckCheck size={12} /> Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-72 overflow-y-auto space-y-2">
                                        {notifications.length === 0 ? (
                                            <p className="text-xs text-slate-400 text-center py-4">No notifications.</p>
                                        ) : (
                                            notifications.map((n) => (
                                                <div
                                                    key={n.id}
                                                    onClick={() => handleMarkNotifRead(n.id)}
                                                    className={`p-3 rounded-xl text-xs space-y-1 cursor-pointer transition-all border ${
                                                        n.isRead ? 'bg-slate-50 border-slate-100 opacity-70' : 'bg-blue-50/50 border-blue-100'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-semibold text-slate-900">{n.title}</p>
                                                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                                                    </div>
                                                    <p className="text-slate-600">{n.message}</p>
                                                    <p className="text-[10px] text-slate-400">
                                                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-bold">
                            {email.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-8 overflow-auto animate-fade-up">
                    {/* Bento Stat Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <StatCard
                            label="Cumulative GPA"
                            value={gpaData?.gpa !== undefined ? `${gpaData.gpa.toFixed(2)} / 4.00` : 'N/A'}
                            icon={Award}
                            iconBg="#F59E0B"
                            subLabel="Academic Standing"
                        />
                        <StatCard
                            label="Earned Credits"
                            value={`${totalCredits} Cr`}
                            icon={BookOpen}
                            iconBg="#1D4ED8"
                            subLabel="Completed & Active"
                        />
                        <StatCard
                            label="Pending Assignments"
                            value={pendingAssignments.length}
                            icon={Clock}
                            iconBg="#EA580C"
                            subLabel="Due this semester"
                        />
                        <StatCard
                            label="Attendance Rate"
                            value={`${attendanceRate}%`}
                            icon={CheckCircle2}
                            iconBg="#16A34A"
                            subLabel="Verified presence"
                        />
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-1.5 p-1 bg-slate-200/70 rounded-xl w-fit mb-6 overflow-x-auto">
                        {(['courses', 'assignments', 'schedule', 'attendance', 'transcript'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${
                                    activeTab === tab
                                        ? 'bg-white text-slate-900 shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                {tab === 'courses' ? `Courses (${enrollments.length})`
                                : tab === 'assignments' ? `Assignments (${assignments.length})`
                                : tab === 'schedule' ? 'Weekly Schedule'
                                : tab === 'attendance' ? `Attendance (${attendance.length})`
                                : 'Official Transcript'}
                            </button>
                        ))}
                    </div>

                    {/* Courses Tab */}
                    {activeTab === 'courses' && (
                        <div>
                            {enrollments.length === 0 ? (
                                <div className="card p-16 text-center">
                                    <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
                                    <p className="text-sm font-semibold text-slate-700">No course enrollments found</p>
                                    <p className="text-xs text-slate-400 mt-1">Contact the registrar office for semester registration.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {enrollments.map((e, idx) => {
                                        const accent = COURSE_ACCENTS[idx % COURSE_ACCENTS.length];
                                        return (
                                            <div key={e.id} className="card card-hover overflow-hidden flex flex-col">
                                                <div className="h-2" style={{ background: accent.border }} />
                                                <div className="p-6 flex-1 flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex items-center justify-between mb-3">
                                                            <span
                                                                className="text-xs font-bold px-2 py-0.5 rounded-md font-mono"
                                                                style={{ background: accent.badgeBg, color: accent.badgeText }}
                                                            >
                                                                {e.courseOffering.course.code}
                                                            </span>
                                                            <span className="text-xs font-semibold text-slate-400">
                                                                {e.courseOffering.course.credits} Credits
                                                            </span>
                                                        </div>
                                                        <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                                                            {e.courseOffering.course.title}
                                                        </h3>
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            {e.courseOffering.semester.name}
                                                        </p>
                                                    </div>

                                                    <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 text-xs">
                                                        <div className="flex justify-between text-slate-600">
                                                            <span>Instructor:</span>
                                                            <span className="font-semibold text-slate-800">
                                                                {e.courseOffering.teacher?.user?.email || 'Faculty'}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-slate-600">Status:</span>
                                                            <StatusBadge status={e.status} />
                                                        </div>
                                                        {e.letterGrade && (
                                                            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                                                <span className="text-slate-600">Final Grade:</span>
                                                                <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                                                    {e.letterGrade} ({e.gradePoints} GP)
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Schedule Tab */}
                    {activeTab === 'schedule' && (
                        <div className="card p-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar size={18} className="text-blue-700" />
                                <h3 className="text-base font-bold text-slate-900">Weekly Class Timetable</h3>
                            </div>
                            <p className="text-xs text-slate-500 mb-6">Regular lecture schedule for enrolled offerings.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                                {DAYS_OF_WEEK.map((day) => {
                                    const slots = schedule.filter(s => s.dayOfWeek === day);
                                    return (
                                        <div key={day} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 flex flex-col space-y-3">
                                            <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{day.slice(0, 3)}</span>
                                                <span className="text-[10px] font-semibold text-slate-400">{slots.length}</span>
                                            </div>

                                            {slots.length === 0 ? (
                                                <div className="flex-1 flex items-center justify-center py-6 text-[11px] text-slate-400">
                                                    No classes
                                                </div>
                                            ) : (
                                                slots.map((s) => (
                                                    <div key={s.id} className="p-2.5 rounded-lg border border-blue-200 bg-blue-50/70 space-y-1">
                                                        <div className="flex justify-between items-start">
                                                            <span className="text-[10px] font-bold text-blue-800 bg-white px-1.5 py-0.5 rounded border border-blue-200">
                                                                {s.courseOffering?.course?.code}
                                                            </span>
                                                            <span className="text-[10px] font-mono text-slate-600">
                                                                {s.startTime}-{s.endTime}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs font-bold text-slate-900 truncate">
                                                            {s.courseOffering?.course?.title}
                                                        </p>
                                                        {s.room && (
                                                            <p className="text-[10px] text-slate-600 flex items-center gap-1">
                                                                <MapPin size={10} className="text-blue-700" /> {s.room}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Assignments Tab */}
                    {activeTab === 'assignments' && (
                        <div className="space-y-4">
                            {assignments.length === 0 ? (
                                <div className="card p-16 text-center">
                                    <ClipboardList size={40} className="mx-auto text-slate-300 mb-3" />
                                    <p className="text-sm font-semibold text-slate-700">No active assignments</p>
                                    <p className="text-xs text-slate-400 mt-1">Check back later for coursework updates.</p>
                                </div>
                            ) : (
                                assignments.map((asg) => {
                                    const badge = getDueDateBadge(asg.dueDate);
                                    const isSubmitted = !!asg.mySubmission;
                                    const isGraded = asg.mySubmission?.grade !== null && asg.mySubmission?.grade !== undefined;

                                    return (
                                        <div key={asg.id} className="card card-hover p-6">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                                            {asg.courseOffering.course.code}
                                                        </span>
                                                        {badge && (
                                                            <span
                                                                className="text-xs font-semibold px-2 py-0.5 rounded border"
                                                                style={{ background: badge.bg, color: badge.text, borderColor: badge.border }}
                                                            >
                                                                {badge.label}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="text-base font-bold text-slate-900">{asg.title}</h3>
                                                    {asg.description && <p className="text-xs text-slate-600 mt-1">{asg.description}</p>}
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-slate-500">Max Score: <strong className="text-slate-900">{asg.maxScore}</strong></span>
                                                    {isGraded ? (
                                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg">
                                                            Score: {asg.mySubmission?.grade} / {asg.maxScore}
                                                        </span>
                                                    ) : isSubmitted ? (
                                                        <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold rounded-lg">
                                                            Submitted
                                                        </span>
                                                    ) : (
                                                        <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-lg">
                                                            Pending Submission
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {isSubmitted ? (
                                                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1.5">
                                                    <p className="text-slate-600"><strong>Submission Reference:</strong> {asg.mySubmission?.id}</p>
                                                    {asg.mySubmission?.feedback && (
                                                        <p className="text-emerald-800 font-medium"><strong>Instructor Feedback:</strong> {asg.mySubmission.feedback}</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col sm:flex-row gap-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Provide repository link, file URL, or answer text…"
                                                        value={submitText[asg.id] || ''}
                                                        onChange={(e) => setSubmitText({ ...submitText, [asg.id]: e.target.value })}
                                                        className="input-field flex-1"
                                                    />
                                                    <button
                                                        disabled={submitting === asg.id || !submitText[asg.id]}
                                                        onClick={() => handleSubmitAssignment(asg.id)}
                                                        className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white transition-all disabled:opacity-50"
                                                        style={{ background: '#1D4ED8' }}
                                                        onMouseEnter={(e) => (e.currentTarget.style.background = '#1E3A8A')}
                                                        onMouseLeave={(e) => (e.currentTarget.style.background = '#1D4ED8')}
                                                    >
                                                        {submitting === asg.id ? 'Submitting…' : 'Submit Assignment'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* Attendance Tab */}
                    {activeTab === 'attendance' && (
                        <div className="card p-6">
                            <h3 className="text-base font-bold text-slate-900 mb-4">Verified Attendance Records</h3>
                            {attendance.length === 0 ? (
                                <p className="text-xs text-slate-400 py-8 text-center">No attendance sessions recorded yet.</p>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {attendance.map((rec) => (
                                        <div key={rec.id} className="py-3 flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">
                                                    {rec.session?.courseOffering?.course?.title} ({rec.session?.courseOffering?.course?.code})
                                                </p>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    Session Date: {new Date(rec.session?.date).toLocaleDateString()} {rec.session?.topic ? `• Topic: ${rec.session.topic}` : ''}
                                                </p>
                                            </div>
                                            <StatusBadge status={rec.status} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Transcript Tab */}
                    {activeTab === 'transcript' && (
                        <div className="space-y-6">
                            <div className="card p-6 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 border-0">
                                <div>
                                    <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                                        <Award className="text-amber-400" size={20} /> Official University Transcript
                                    </h3>
                                    <p className="text-xs text-blue-200 mt-1">Official semester credit breakdown, GPA calculation, and course grades.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-xs text-blue-200">Cumulative GPA</p>
                                        <p className="text-3xl font-black text-amber-400 tabular">
                                            {gpaData?.gpa !== undefined ? gpaData.gpa.toFixed(2) : '0.00'} / 4.00
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => window.print()}
                                        className="px-4 py-2 bg-white text-slate-900 text-xs font-bold rounded-xl shadow-xs hover:bg-slate-100 transition-colors flex items-center gap-2"
                                    >
                                        <Download size={14} /> Print
                                    </button>
                                </div>
                            </div>

                            <div className="card overflow-hidden">
                                <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-900">
                                    Completed Course Records
                                </div>
                                {!gpaData || gpaData.breakdown.length === 0 ? (
                                    <p className="text-xs text-slate-400 py-8 text-center">No graded courses recorded on transcript yet.</p>
                                ) : (
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                                            <tr>
                                                <th className="p-3.5">Code</th>
                                                <th className="p-3.5">Course Title</th>
                                                <th className="p-3.5">Semester</th>
                                                <th className="p-3.5">Credits</th>
                                                <th className="p-3.5">Numeric</th>
                                                <th className="p-3.5">Grade</th>
                                                <th className="p-3.5">Grade Points</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {gpaData.breakdown.map((row) => (
                                                <tr key={row.id} className="hover:bg-slate-50/70">
                                                    <td className="p-3.5 font-bold font-mono text-blue-700">{row.courseCode}</td>
                                                    <td className="p-3.5 font-semibold text-slate-800">{row.courseTitle}</td>
                                                    <td className="p-3.5 text-slate-500">{row.semester}</td>
                                                    <td className="p-3.5 text-slate-700">{row.credits} Cr</td>
                                                    <td className="p-3.5 text-slate-700">{row.grade}%</td>
                                                    <td className="p-3.5">
                                                        <span className="font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                                                            {row.letterGrade}
                                                        </span>
                                                    </td>
                                                    <td className="p-3.5 font-bold text-slate-900">{row.gradePoints}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
