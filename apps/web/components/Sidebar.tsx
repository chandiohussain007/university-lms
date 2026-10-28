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
            className="w-64 flex-shrink-0 flex flex-col min-h-screen bg-slate-900"
        >
            {/* Logo */}
            <div className="px-6 py-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-700 text-white"
                    >
                        <GraduationCap size={18} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-white text-sm font-bold leading-none">UniPortal</p>
                        <p className="text-[10px] mt-0.5 truncate text-slate-400">{roleLabel}</p>
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
            <div className="px-3 pb-4 border-t border-white/10 pt-4">
                <div className="flex items-center gap-3 px-3 py-2 mb-1">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 bg-blue-700"
                    >
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{displayName}</p>
                        {email && (
                            <p className="text-[10px] truncate text-slate-400">{email}</p>
                        )}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors duration-150"
                >
                    <LogOut size={15} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
