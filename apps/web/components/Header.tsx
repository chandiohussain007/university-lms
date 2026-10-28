import { Bell, ShieldCheck } from 'lucide-react';

interface HeaderProps {
    title?: string;
    subtitle?: string;
}

export default function Header({ title = 'Admin Panel', subtitle = 'University LMS' }: HeaderProps) {
    return (
        <header
            className="h-16 flex-shrink-0 flex items-center justify-between px-8 border-b"
            style={{
                background: '#FFFFFF',
                borderColor: '#E2E8F0',
                boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
            }}
        >
            <div>
                <h1 className="text-lg font-bold" style={{ color: '#0F172A' }}>{title}</h1>
                <p className="text-xs" style={{ color: '#94A3B8' }}>{subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
                <button
                    className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                    style={{ border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#64748B' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#FFFFFF')}
                >
                    <Bell size={16} />
                </button>
                <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                    style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
                >
                    <ShieldCheck size={14} style={{ color: '#1D4ED8' }} />
                    <span className="text-xs font-medium" style={{ color: '#475569' }}>Admin</span>
                </div>
            </div>
        </header>
    );
}
