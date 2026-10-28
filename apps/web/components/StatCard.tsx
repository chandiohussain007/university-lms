import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    iconBg: string;   // e.g. '#1D4ED8'
    iconColor?: string;
    subLabel?: string;
}

export default function StatCard({ label, value, icon: Icon, iconBg, iconColor = '#FFFFFF', subLabel }: StatCardProps) {
    return (
        <div className="card card-hover p-5">
            <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-4 flex-shrink-0"
                style={{ background: iconBg }}
            >
                <Icon size={17} style={{ color: iconColor }} />
            </div>
            <p className="text-2xl font-bold tabular" style={{ color: '#0F172A' }}>{value}</p>
            <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>{label}</p>
            {subLabel && (
                <p className="text-[11px] mt-0.5" style={{ color: '#CBD5E1' }}>{subLabel}</p>
            )}
        </div>
    );
}
