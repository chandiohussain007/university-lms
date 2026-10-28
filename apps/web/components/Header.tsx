'use client';

import { Bell, ShieldCheck } from 'lucide-react';

interface HeaderProps {
    title?: string;
    subtitle?: string;
}

export default function Header({ title = 'Admin Panel', subtitle = 'University LMS' }: HeaderProps) {
    return (
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-8 border-b border-slate-200 bg-white shadow-xs">
            <div>
                <h1 className="text-lg font-bold text-slate-900">{title}</h1>
                <p className="text-xs text-slate-400">{subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors border border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                >
                    <Bell size={16} />
                </button>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                    <ShieldCheck size={14} className="text-blue-700" />
                    <span className="text-xs font-medium text-slate-600">Admin</span>
                </div>
            </div>
        </header>
    );
}
