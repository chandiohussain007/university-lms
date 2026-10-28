'use client';

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
                <h1 className="text-xl font-bold text-slate-900">{title}</h1>
                {subtitle && (
                    <p className="text-sm mt-0.5 text-slate-500">{subtitle}</p>
                )}
            </div>
            {action && (
                <button
                    type="button"
                    onClick={action.onClick}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors bg-blue-700 hover:bg-blue-800"
                >
                    {action.icon && <action.icon size={15} />}
                    {action.label}
                </button>
            )}
        </div>
    );
}
