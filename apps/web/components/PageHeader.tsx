import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    action?: {
        label: string;
        icon?: LucideIcon;
        onClick: () => void;
    };
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
    return (
        <div className="flex items-start justify-between mb-6">
            <div>
                <h1 className="text-xl font-bold" style={{ color: '#0F172A' }}>{title}</h1>
                {subtitle && (
                    <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>{subtitle}</p>
                )}
            </div>
            {action && (
                <button
                    onClick={action.onClick}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
                    style={{ background: '#1D4ED8' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#1E3A8A')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#1D4ED8')}
                >
                    {action.icon && <action.icon size={15} />}
                    {action.label}
                </button>
            )}
        </div>
    );
}
