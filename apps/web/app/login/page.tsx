'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    GraduationCap, Mail, Lock, ArrowRight,
    BookOpen, Users, Building2, Award, CheckCircle2
} from 'lucide-react';
import api from '@/lib/api';

const DEMO_USERS = [
    { label: 'Student', email: 'student1@university.edu', password: 'secret', role: 'STUDENT', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: 'Professor Smith', email: 'prof.smith@university.edu', password: 'secret', role: 'TEACHER', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'Admin', email: 'admin@university.edu', password: 'admin123', role: 'SUPER_ADMIN', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
    { label: 'Staff Member', email: 'staff@university.edu', password: 'secret', role: 'STAFF', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
];

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('student1@university.edu');
    const [password, setPassword] = useState('secret');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/login', { email, password });
            const { access_token, role, facultyId } = res.data;
            localStorage.setItem('token', access_token);
            localStorage.setItem('role', role);
            localStorage.setItem('facultyId', facultyId || '');
            localStorage.setItem('email', email);

            if (role === 'STUDENT') router.push('/dashboard');
            else if (role === 'TEACHER') router.push('/teacher');
            else router.push('/users');
        } catch {
            setError('Invalid credentials. Please verify your email and password.');
        } finally {
            setLoading(false);
        }
    };

    const fillDemo = (user: typeof DEMO_USERS[0]) => {
        setEmail(user.email);
        setPassword(user.password);
        setError('');
    };

    return (
        <div className="min-h-screen flex" style={{ background: '#0F172A' }}>
            {/* Left Panel: Institutional Brand & Credibility */}
            <div className="hidden lg:flex flex-1 flex-col justify-between p-16 relative overflow-hidden">
                {/* Subtle trust lighting */}
                <div 
                    className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-25 filter blur-3xl"
                    style={{ background: '#1D4ED8' }}
                />
                <div 
                    className="absolute -bottom-32 right-0 w-96 h-96 rounded-full opacity-20 filter blur-3xl"
                    style={{ background: '#0284C7' }}
                />

                {/* Brand Header */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: '#1D4ED8' }}>
                        <GraduationCap size={24} className="text-white" />
                    </div>
                    <div>
                        <span className="text-white font-bold text-lg tracking-tight">UniPortal</span>
                        <p className="text-xs text-slate-400">Higher Education Management System</p>
                    </div>
                </div>

                {/* Hero Content */}
                <div className="relative z-10 max-w-xl my-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-blue-200 bg-blue-900/50 border border-blue-700/50 mb-6">
                        <CheckCircle2 size={13} className="text-blue-400" />
                        Accredited Higher Education System
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-5">
                        Academic Rigor.<br />
                        <span className="text-blue-400">Streamlined Learning.</span>
                    </h1>
                    <p className="text-slate-300 text-base leading-relaxed mb-8">
                        The comprehensive academic environment designed for faculty excellence, 
                        seamless registrar workflows, and student achievement.
                    </p>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { icon: BookOpen, label: 'Accredited Courses', value: '48+' },
                            { icon: Users, label: 'Active Students', value: '1,200+' },
                            { icon: Building2, label: 'Faculties & Depts', value: '14' },
                            { icon: Award, label: 'Graduation Rate', value: '96.4%' },
                        ].map((stat, idx) => (
                            <div 
                                key={idx}
                                className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <stat.icon size={15} className="text-blue-400" />
                                    <span className="text-xs font-medium text-slate-400">{stat.label}</span>
                                </div>
                                <p className="text-2xl font-bold text-white tabular">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer copyright */}
                <div className="relative z-10 text-xs text-slate-500">
                    © 2026 University Academic System. WCAG 2.2 Compliant Portal.
                </div>
            </div>

            {/* Right Panel: High-Contrast Sign In Form */}
            <div className="w-full lg:w-[500px] flex-shrink-0 flex items-center justify-center p-8 bg-white shadow-2xl">
                <div className="w-full max-w-sm">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#1D4ED8' }}>
                            <GraduationCap size={20} className="text-white" />
                        </div>
                        <div>
                            <span className="text-slate-900 font-bold text-base">UniPortal</span>
                            <p className="text-xs text-slate-500">Student & Faculty Sign In</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign In</h2>
                        <p className="text-xs text-slate-500 mt-1">Access your academic account, courses, and records</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Institutional Email
                            </label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    id="login-email"
                                    type="email"
                                    required
                                    placeholder="name@university.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-10"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-semibold text-slate-700">
                                    Password
                                </label>
                                <a href="#" className="text-xs font-medium text-blue-700 hover:text-blue-800">
                                    Forgot?
                                </a>
                            </div>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    id="login-password"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-10"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-xs p-3 rounded-lg border border-red-200 bg-red-50 text-red-700">
                                {error}
                            </div>
                        )}

                        <button
                            id="login-submit-btn"
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all flex items-center justify-center gap-2"
                            style={{ background: '#1D4ED8' }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#1E3A8A')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = '#1D4ED8')}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign In to Portal
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Quick Demo Accounts */}
                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <p className="text-xs font-semibold text-slate-600 mb-2.5">
                            Quick Demo Sign-In
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {DEMO_USERS.map((user) => (
                                <button
                                    key={user.email}
                                    type="button"
                                    onClick={() => fillDemo(user)}
                                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-left transition-all"
                                >
                                    <p className="text-xs font-bold text-slate-800 truncate">{user.label}</p>
                                    <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${user.badge}`}>
                                        {user.role}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <a href="/admissions" className="text-xs font-semibold text-blue-700 hover:text-blue-800">
                            Prospective student? Apply for admission →
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
