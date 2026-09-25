'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { GraduationCap, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

const DEMO_USERS = [
    { label: 'Student 1', email: 'student1@university.edu', password: 'secret', role: 'STUDENT' },
    { label: 'Professor Smith', email: 'prof.smith@university.edu', password: 'secret', role: 'TEACHER' },
    { label: 'Admin', email: 'admin@university.edu', password: 'admin123', role: 'SUPER_ADMIN' },
    { label: 'Staff', email: 'staff@university.edu', password: 'secret', role: 'STAFF' },
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
            else router.push('/');
        } catch {
            setError('Invalid credentials. Please check your email and password.');
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
        <div className="min-h-screen bg-[#0a0a16] flex" style={{ fontFamily: "'Inter', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
                .glass { background: rgba(255,255,255,0.04); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.07); }
                .input-glass { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: white; transition: all 0.2s; }
                .input-glass:focus { outline: none; border-color: rgba(139,92,246,0.5); background: rgba(255,255,255,0.08); box-shadow: 0 0 0 3px rgba(139,92,246,0.1); }
                .input-glass::placeholder { color: rgba(100,116,139,0.6); }
                .demo-chip { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); transition: all 0.2s; cursor: pointer; }
                .demo-chip:hover { background: rgba(255,255,255,0.08); border-color: rgba(139,92,246,0.3); }
                @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
                @keyframes pulse-glow { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
                .float { animation: float 6s ease-in-out infinite; }
                .pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
            `}</style>

            {/* Left Panel — Branding */}
            <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative overflow-hidden p-16">
                {/* Gradient orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 pulse-glow" style={{ background: 'radial-gradient(circle, #7c3aed, #4f46e5)' }} />
                <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-15 pulse-glow" style={{ background: 'radial-gradient(circle, #0ea5e9, #2563eb)', animationDelay: '1.5s' }} />

                <div className="relative z-10 text-center">
                    <div className="float inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-8 shadow-2xl" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                        <GraduationCap size={48} className="text-white" />
                    </div>
                    <h1 className="text-5xl font-extrabold text-white mb-4 leading-tight">
                        University<br />
                        <span style={{ backgroundImage: 'linear-gradient(135deg, #a78bfa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            LMS Portal
                        </span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-sm mx-auto leading-relaxed">
                        Your gateway to courses, assignments, grades, and attendance — all in one place.
                    </p>

                    <div className="mt-10 grid grid-cols-2 gap-4 max-w-xs mx-auto">
                        {[
                            { label: 'Active Courses', value: '12+' },
                            { label: 'Faculty Members', value: '50+' },
                            { label: 'Enrolled Students', value: '400+' },
                            { label: 'Departments', value: '8' },
                        ].map(({ label, value }) => (
                            <div key={label} className="glass rounded-2xl p-4 text-left">
                                <p className="text-2xl font-bold text-white">{value}</p>
                                <p className="text-xs text-slate-500 mt-1">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel — Login Form */}
            <div className="w-full lg:w-[480px] flex-shrink-0 flex items-center justify-center p-8 border-l border-white/5">
                <div className="w-full max-w-sm">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                            <GraduationCap size={20} />
                        </div>
                        <h1 className="text-xl font-bold text-white">University LMS</h1>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white">Welcome back</h2>
                        <p className="text-slate-500 text-sm mt-1">Sign in to your portal</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-2">Email address</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                                <input
                                    id="login-email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    placeholder="you@university.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-glass w-full pl-11 pr-4 py-3 rounded-xl text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-2">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                                <input
                                    id="login-password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-glass w-full pl-11 pr-4 py-3 rounded-xl text-sm"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                                {error}
                            </div>
                        )}

                        <button
                            id="login-submit-btn"
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-60 transition-all flex items-center justify-center gap-2 group"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Sign In <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </form>

                    {/* Demo quick-fill */}
                    <div className="mt-8">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles size={13} className="text-violet-400" />
                            <p className="text-xs text-slate-500">Quick demo — click to fill credentials</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {DEMO_USERS.map((user) => (
                                <button key={user.email} onClick={() => fillDemo(user)}
                                    className="demo-chip rounded-xl p-3 text-left">
                                    <p className="text-xs font-semibold text-white">{user.label}</p>
                                    <p className="text-[10px] text-slate-600 truncate">{user.role}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <a href="/admissions" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                            New student? Apply for admission →
                        </a>
                    </div>

                    <p className="mt-8 text-center text-[11px] text-slate-700">
                        © 2024 University LMS · Faculty of Engineering
                    </p>
                </div>
            </div>
        </div>
    );
}
