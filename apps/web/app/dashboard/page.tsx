'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard, BookOpen, ClipboardList, Calendar,
    LogOut, User, Bell, ChevronRight, GraduationCap,
    CheckCircle2, Clock, AlertCircle, Star, Zap, Check, X, Minus, Award, FileText, Download, CheckCheck, MapPin
} from 'lucide-react';
import api from '@/lib/api';

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

const COURSE_GRADIENTS = [
    'from-violet-600 to-indigo-700',
    'from-teal-500 to-emerald-700',
    'from-rose-500 to-pink-700',
    'from-amber-500 to-orange-700',
    'from-sky-500 to-blue-700',
    'from-purple-600 to-fuchsia-700',
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
    const submittedAssignments = assignments.filter((a) => a.mySubmission);

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

    const handleLogout = () => {
        localStorage.clear();
        router.push('/login');
    };

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

    const getDueDateLabel = (dueDate: string | null) => {
        if (!dueDate) return null;
        const due = new Date(dueDate);
        const now = new Date();
        const diffMs = due.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return { label: 'Overdue', color: 'text-red-400 bg-red-500/10 border-red-500/20' };
        if (diffDays === 0) return { label: 'Due Today', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
        if (diffDays <= 3) return { label: `${diffDays}d left`, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
        return { label: due.toLocaleDateString(), color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
                    <p className="text-slate-400 text-sm">Loading your dashboard…</p>
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
                .course-card:hover .card-arrow { transform: translateX(4px); }
                .nav-active { background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.15)); border-color: rgba(139,92,246,0.3); }
            `}</style>

            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 flex flex-col border-r border-white/5" style={{ background: 'rgba(15,15,26,0.95)' }}>
                {/* Logo */}
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                            <GraduationCap size={18} />
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-white">UniPortal</h1>
                            <p className="text-[10px] text-slate-500">Student Portal</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1">
                    {[
                        { icon: LayoutDashboard, label: 'Dashboard', id: 'courses' },
                        { icon: BookOpen, label: 'My Courses', id: 'courses' },
                        { icon: ClipboardList, label: 'Assignments', id: 'assignments' },
                        { icon: Calendar, label: 'Schedule', id: 'schedule' },
                        { icon: CheckCircle2, label: 'Attendance', id: 'attendance' },
                        { icon: Award, label: 'Transcript & GPA', id: 'transcript' },
                    ].map(({ icon: Icon, label, id }) => (
                        <a
                            key={label}
                            href="#"
                            onClick={(e) => { e.preventDefault(); setActiveTab(id as any); }}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${activeTab === id ? 'nav-active text-violet-300 border-violet-500/30' : 'text-slate-400 border-transparent glass-hover'}`}
                        >
                            <Icon size={17} />
                            {label}
                        </a>
                    ))}
                </nav>

                {/* User info */}
                <div className="p-4 border-t border-white/5">
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                            {email.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-medium text-white truncate">Student</p>
                            <p className="text-[10px] text-slate-500 truncate">{email}</p>
                        </div>
                    </div>
                    <button
                        id="student-logout-btn"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 rounded-xl hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut size={15} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 overflow-auto">
                {/* Top Header */}
                <header className="sticky top-0 z-10 border-b border-white/5 px-8 py-4 flex items-center justify-between" style={{ background: 'rgba(15,15,26,0.8)', backdropFilter: 'blur(20px)' }}>
                    <div>
                        <h2 className="text-xl font-bold text-white">My Dashboard</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Welcome back — here's what's happening</p>
                    </div>
                    <div className="flex items-center gap-3 relative">
                        {/* Notifications Bell */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                                className="relative p-2 rounded-xl glass glass-hover transition-all"
                            >
                                <Bell size={17} className="text-slate-400" />
                                {unreadNotifCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-violet-600 rounded-full text-[9px] flex items-center justify-center font-bold">
                                        {unreadNotifCount}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown Panel */}
                            {showNotifDropdown && (
                                <div className="absolute right-0 mt-2 w-80 glass rounded-2xl p-4 shadow-2xl z-50 border border-white/10 space-y-3" style={{ background: 'rgba(20,20,35,0.95)', backdropFilter: 'blur(25px)' }}>
                                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                                            <Bell size={14} className="text-violet-400" /> Notifications ({unreadNotifCount} new)
                                        </h4>
                                        {unreadNotifCount > 0 && (
                                            <button
                                                onClick={handleMarkAllRead}
                                                className="text-[10px] text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1"
                                            >
                                                <CheckCheck size={12} /> Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-72 overflow-y-auto space-y-2">
                                        {notifications.length === 0 ? (
                                            <p className="text-xs text-slate-500 text-center py-4">No notifications yet.</p>
                                        ) : (
                                            notifications.map((n) => (
                                                <div
                                                    key={n.id}
                                                    onClick={() => handleMarkNotifRead(n.id)}
                                                    className={`p-3 rounded-xl text-xs space-y-1 cursor-pointer transition-all border ${n.isRead ? 'bg-white/5 border-transparent opacity-60' : 'bg-violet-600/10 border-violet-500/30'}`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-semibold text-white">{n.title}</p>
                                                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-violet-500" />}
                                                    </div>
                                                    <p className="text-[11px] text-slate-300">{n.message}</p>
                                                    <p className="text-[9px] text-slate-500">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                            {email.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: 'Cumulative GPA', value: gpaData?.gpa !== undefined ? gpaData.gpa.toFixed(2) : 'N/A', icon: Award, color: 'from-amber-500 to-orange-600' },
                            { label: 'Total Credits', value: totalCredits, icon: Star, color: 'from-violet-600 to-indigo-600' },
                            { label: 'Assignments Due', value: pendingAssignments.length, icon: Clock, color: 'from-amber-600 to-orange-600' },
                            { label: 'Attendance Rate', value: `${attendanceRate}%`, icon: CheckCircle2, color: 'from-emerald-600 to-teal-600' },
                        ].map(({ label, value, icon: Icon, color }) => (
                            <div key={label} className="stat-card rounded-2xl p-5 relative overflow-hidden group">
                                <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                                <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${color} mb-3`}>
                                    <Icon size={15} className="text-white" />
                                </div>
                                <p className="text-2xl font-bold text-white">{value}</p>
                                <p className="text-xs text-slate-500 mt-1">{label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Tab switcher */}
                    <div className="flex gap-1 mb-6 p-1 rounded-xl glass w-fit overflow-x-auto">
                        {(['courses', 'assignments', 'schedule', 'attendance', 'transcript'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap ${activeTab === tab ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                {tab === 'courses' ? `Courses (${enrollments.length})` : tab === 'assignments' ? `Assignments (${assignments.length})` : tab === 'schedule' ? `Schedule` : tab === 'attendance' ? `Attendance (${attendance.length})` : `Transcript & GPA`}
                            </button>
                        ))}
                    </div>

                    {/* Courses tab */}
                    {activeTab === 'courses' && (
                        <div>
                            {enrollments.length === 0 ? (
                                <div className="glass rounded-2xl p-16 text-center">
                                    <BookOpen size={40} className="text-slate-700 mx-auto mb-4" />
                                    <p className="text-slate-500">You are not enrolled in any courses yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {enrollments.map((e, idx) => {
                                        const grad = COURSE_GRADIENTS[idx % COURSE_GRADIENTS.length];
                                        return (
                                            <div key={e.id} className="glass rounded-2xl overflow-hidden group hover:border-violet-500/30 transition-all duration-300 flex flex-col">
                                                <div className={`p-6 bg-gradient-to-br ${grad} relative`}>
                                                    <span className="text-[10px] font-bold tracking-wider uppercase bg-black/30 text-white/90 px-2.5 py-1 rounded-full backdrop-blur-sm">
                                                        {e.courseOffering.course.code}
                                                    </span>
                                                    <h3 className="text-lg font-bold text-white mt-3 line-clamp-1">
                                                        {e.courseOffering.course.title}
                                                    </h3>
                                                    <p className="text-xs text-white/70 mt-1">{e.courseOffering.semester.name}</p>
                                                </div>
                                                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-xs text-slate-400">
                                                            <span>Instructor</span>
                                                            <span className="text-white font-medium">{e.courseOffering.teacher?.user?.email || 'Faculty'}</span>
                                                        </div>
                                                        <div className="flex justify-between text-xs text-slate-400">
                                                            <span>Credits</span>
                                                            <span className="text-white font-medium">{e.courseOffering.course.credits} Cr</span>
                                                        </div>
                                                        <div className="flex justify-between text-xs text-slate-400">
                                                            <span>Status</span>
                                                            <span className="text-emerald-400 font-medium">{e.status}</span>
                                                        </div>
                                                        {e.letterGrade && (
                                                            <div className="flex justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
                                                                <span>Grade</span>
                                                                <span className="text-amber-400 font-bold">{e.letterGrade} ({e.gradePoints} GP)</span>
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
                        <div className="space-y-6">
                            <div className="glass rounded-2xl p-6 border border-white/5">
                                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                                    <Calendar className="text-violet-400" size={18} /> Weekly Class Schedule
                                </h3>
                                <p className="text-xs text-slate-400 mb-6">Your weekly timetable for enrolled course offerings.</p>

                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                    {DAYS_OF_WEEK.map((day) => {
                                        const daySlots = schedule.filter((s) => s.dayOfWeek === day);
                                        return (
                                            <div key={day} className="glass rounded-xl p-4 border border-white/5 flex flex-col space-y-3">
                                                <div className="border-b border-white/10 pb-2 flex items-center justify-between">
                                                    <span className="text-xs font-extrabold text-violet-300 capitalize">{day.toLowerCase()}</span>
                                                    <span className="text-[10px] text-slate-500">{daySlots.length} classes</span>
                                                </div>

                                                {daySlots.length === 0 ? (
                                                    <div className="flex-1 flex items-center justify-center py-8 text-[11px] text-slate-600">
                                                        No classes
                                                    </div>
                                                ) : (
                                                    daySlots.map((slot) => (
                                                        <div key={slot.id} className="p-3 rounded-xl bg-violet-600/10 border border-violet-500/20 space-y-1.5">
                                                            <div className="flex justify-between items-start">
                                                                <span className="text-[10px] font-bold text-violet-400 bg-violet-500/20 px-1.5 py-0.5 rounded">
                                                                    {slot.courseOffering?.course?.code}
                                                                </span>
                                                                <span className="text-[10px] text-slate-400 font-mono">
                                                                    {slot.startTime}-{slot.endTime}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs font-bold text-white truncate">{slot.courseOffering?.course?.title}</p>
                                                            {slot.room && (
                                                                <p className="text-[10px] text-slate-300 flex items-center gap-1 mt-1">
                                                                    <MapPin size={10} className="text-emerald-400" /> {slot.room}
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
                        </div>
                    )}

                    {/* Assignments tab */}
                    {activeTab === 'assignments' && (
                        <div className="space-y-4">
                            {assignments.length === 0 ? (
                                <div className="glass rounded-2xl p-16 text-center">
                                    <ClipboardList size={40} className="text-slate-700 mx-auto mb-4" />
                                    <p className="text-slate-500">No assignments posted for your courses.</p>
                                </div>
                            ) : (
                                assignments.map((asg) => {
                                    const dueBadge = getDueDateLabel(asg.dueDate);
                                    const isSubmitted = !!asg.mySubmission;
                                    const isGraded = asg.mySubmission?.grade !== null && asg.mySubmission?.grade !== undefined;

                                    return (
                                        <div key={asg.id} className="glass rounded-2xl p-6 transition-all hover:border-white/10">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="text-xs font-semibold text-violet-400 bg-violet-500/10 px-2.5 py-0.5 rounded-full border border-violet-500/20">
                                                            {asg.courseOffering.course.code}
                                                        </span>
                                                        {dueBadge && (
                                                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${dueBadge.color}`}>
                                                                {dueBadge.label}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="text-base font-bold text-white">{asg.title}</h3>
                                                    {asg.description && <p className="text-xs text-slate-400 mt-1">{asg.description}</p>}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-slate-500">Max Score: <strong className="text-white">{asg.maxScore}</strong></span>
                                                    {isGraded ? (
                                                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-xl">
                                                            Graded: {asg.mySubmission?.grade} / {asg.maxScore}
                                                        </span>
                                                    ) : isSubmitted ? (
                                                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold rounded-xl">
                                                            Submitted
                                                        </span>
                                                    ) : (
                                                        <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold rounded-xl">
                                                            Pending
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {isSubmitted ? (
                                                <div className="bg-white/5 rounded-xl p-4 text-xs space-y-2">
                                                    <p className="text-slate-400"><strong>Submission:</strong> {asg.mySubmission?.id}</p>
                                                    {asg.mySubmission?.feedback && (
                                                        <p className="text-emerald-300"><strong>Teacher Feedback:</strong> {asg.mySubmission.feedback}</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col sm:flex-row gap-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Paste submission link or content..."
                                                        value={submitText[asg.id] || ''}
                                                        onChange={(e) => setSubmitText({ ...submitText, [asg.id]: e.target.value })}
                                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                                                    />
                                                    <button
                                                        disabled={submitting === asg.id || !submitText[asg.id]}
                                                        onClick={() => handleSubmitAssignment(asg.id)}
                                                        className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-violet-600/20"
                                                    >
                                                        {submitting === asg.id ? 'Submitting...' : 'Submit'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* Attendance tab */}
                    {activeTab === 'attendance' && (
                        <div className="space-y-4">
                            {attendance.length === 0 ? (
                                <div className="glass rounded-2xl p-16 text-center">
                                    <Calendar size={40} className="text-slate-700 mx-auto mb-4" />
                                    <p className="text-slate-500">No attendance sessions logged for your courses yet.</p>
                                </div>
                            ) : (
                                <div className="glass rounded-2xl p-6">
                                    <h3 className="text-base font-bold text-white mb-4">Attendance History</h3>
                                    <div className="divide-y divide-white/5">
                                        {attendance.map((rec) => (
                                            <div key={rec.id} className="py-3 flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-semibold text-white">
                                                        {rec.session?.courseOffering?.course?.title} ({rec.session?.courseOffering?.course?.code})
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-0.5">
                                                        Date: {new Date(rec.session?.date).toLocaleDateString()} {rec.session?.topic ? `• Topic: ${rec.session.topic}` : ''}
                                                    </p>
                                                </div>
                                                <div>
                                                    {rec.status === 'PRESENT' && (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-full">
                                                            <Check size={12} /> Present
                                                        </span>
                                                    )}
                                                    {rec.status === 'LATE' && (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold rounded-full">
                                                            <Minus size={12} /> Late
                                                        </span>
                                                    )}
                                                    {rec.status === 'ABSENT' && (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold rounded-full">
                                                            <X size={12} /> Absent
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Transcript Tab */}
                    {activeTab === 'transcript' && (
                        <div className="space-y-6">
                            {/* Header Summary */}
                            <div className="glass rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/5 bg-gradient-to-r from-violet-900/20 to-indigo-900/20">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Award className="text-amber-400" size={20} /> Academic Transcript
                                    </h3>
                                    <p className="text-xs text-slate-400">Official record of completed courses, letter grades, and grade points.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400">Cumulative GPA</p>
                                        <p className="text-2xl font-extrabold text-amber-400">{gpaData?.gpa !== undefined ? gpaData.gpa.toFixed(2) : '0.00'} / 4.00</p>
                                    </div>
                                    <button
                                        onClick={() => window.print()}
                                        className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-2 border border-white/10"
                                    >
                                        <Download size={14} /> Print Transcript
                                    </button>
                                </div>
                            </div>

                            {/* Transcript Table */}
                            <div className="glass rounded-2xl p-6 border border-white/5">
                                <h4 className="text-sm font-bold text-white mb-4">Completed Courses</h4>
                                {!gpaData || gpaData.breakdown.length === 0 ? (
                                    <p className="text-xs text-slate-500 py-8 text-center">No graded courses recorded on transcript yet.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-white/10 text-slate-400">
                                                    <th className="pb-3 font-semibold">Course Code</th>
                                                    <th className="pb-3 font-semibold">Course Title</th>
                                                    <th className="pb-3 font-semibold">Semester</th>
                                                    <th className="pb-3 font-semibold">Credits</th>
                                                    <th className="pb-3 font-semibold">Score</th>
                                                    <th className="pb-3 font-semibold">Grade</th>
                                                    <th className="pb-3 font-semibold">Grade Points</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {gpaData.breakdown.map((row) => (
                                                    <tr key={row.id} className="hover:bg-white/5">
                                                        <td className="py-3 font-bold text-violet-300">{row.courseCode}</td>
                                                        <td className="py-3 text-white font-medium">{row.courseTitle}</td>
                                                        <td className="py-3 text-slate-400">{row.semester}</td>
                                                        <td className="py-3 text-slate-300">{row.credits} Cr</td>
                                                        <td className="py-3 text-slate-300">{row.grade}%</td>
                                                        <td className="py-3">
                                                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                                {row.letterGrade}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 font-bold text-emerald-400">{row.gradePoints.toFixed(1)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
