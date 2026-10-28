'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard, BookOpen, ClipboardList, Calendar,
    CheckCircle2, Award, Inbox, LogOut, GraduationCap,
    Users, Building2, ShieldCheck, ClipboardCheck,
    BarChart3,
} from 'lucide-react';

type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';

interface NavItem {
    icon: React.ElementType;
    label: string;
    href: string;
    badge?: number;
}

const studentNav: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard',       href: '/dashboard' },
    { icon: BookOpen,        label: 'My Courses',      href: '/dashboard#courses' },
    { icon: ClipboardList,   label: 'Assignments',     href: '/dashboard#assignments' },
    { icon: Calendar,        label: 'Schedule',        href: '/dashboard#schedule' },
    { icon: CheckCircle2,    label: 'Attendance',      href: '/dashboard#attendance' },
    { icon: Award,           label: 'Transcript & GPA',href: '/dashboard#transcript' },
];

const teacherNav: NavItem[] = [
    { icon: BarChart3,     label: 'Overview',       href: '/teacher' },
    { icon: BookOpen,      label: 'My Courses',     href: '/teacher#courses' },
    { icon: ClipboardList, label: 'Assignments',    href: '/teacher#assignments' },
    { icon: CheckCircle2,  label: 'Attendance',     href: '/teacher#attendance' },
    { icon: Inbox,         label: 'Notifications',  href: '/teacher#notifications' },
];

const adminNav: NavItem[] = [
    { icon: LayoutDashboard, label: 'Overview',       href: '/' },
    { icon: Users,           label: 'Users',          href: '/users' },
    { icon: Building2,       label: 'Departments',    href: '/departments' },
    { icon: BookOpen,        label: 'Faculties',      href: '/faculties' },
    { icon: ClipboardCheck,  label: 'Admissions',     href: '/admissions-review' },
];

interface SidebarProps {
    role?: Role;
    email?: string;
    onLogout?: () => void;
}

export default function Sidebar({ role = 'ADMIN', email = '', onLogout }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const navItems = role === 'STUDENT' ? studentNav
                   : role === 'TEACHER' ? teacherNav
                   : adminNav;

    const roleLabel = role === 'STUDENT' ? 'Student Portal'
                    : role === 'TEACHER' ? 'Teacher Workspace'
                    : 'Admin Panel';

    const initials = email ? email.charAt(0).toUpperCase() : (role === 'ADMIN' ? 'A' : 'U');
    const displayName = role === 'ADMIN' ? 'Admin' : role === 'TEACHER' ? 'Teacher' : 'Student';

    const handleLogout = () => {
        if (onLogout) { onLogout(); return; }
        localStorage.clear();
        router.push('/login');
    };

    const isActive = (href: string) => {
        const base = href.split('#')[0];
        if (base === '/' || base === '') return pathname === '/';
        return pathname.startsWith(base);
    };

    return (
        <aside
            className="w-64 flex-shrink-0 flex flex-col min-h-screen"
            style={{ background: '#0F172A' }}
        >
            {/* Logo */}
            <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-3">
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: '#1D4ED8' }}
                    >
                        <GraduationCap size={18} className="text-white" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-white text-sm font-bold leading-none">UniPortal</p>
                        <p className="text-[10px] mt-0.5 truncate" style={{ color: '#64748B' }}>{roleLabel}</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                {navItems.map(({ icon: Icon, label, href }) => {
                    const active = isActive(href);
                    return (
                        <Link
                            key={label}
                            href={href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 border-l-[3px] ${
                                active
                                    ? 'nav-active'
                                    : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <Icon size={16} className="flex-shrink-0" />
                            <span className="truncate">{label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User footer */}
            <div className="px-3 pb-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)', paddingTop: '1rem' }}>
                <div className="flex items-center gap-3 px-3 py-2 mb-1">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: '#1D4ED8' }}
                    >
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{displayName}</p>
                        {email && (
                            <p className="text-[10px] truncate" style={{ color: '#64748B' }}>{email}</p>
                        )}
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors duration-150"
                    style={{ color: '#F87171' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                    <LogOut size={15} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
