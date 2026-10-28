import { CheckCircle2, XCircle, Clock, BookOpen, Award, Check, X, Minus, AlertCircle } from 'lucide-react';

type StatusType =
    | 'PENDING' | 'ACCEPTED' | 'REJECTED'
    | 'PRESENT' | 'ABSENT' | 'LATE'
    | 'ENROLLED' | 'COMPLETED' | 'DROPPED'
    | 'SUBMITTED' | 'GRADED'
    | string;

const config: Record<string, { bg: string; text: string; border: string; Icon: React.ElementType }> = {
    PENDING:   { bg: '#FEF9C3', text: '#A16207', border: '#FDE047', Icon: Clock },
    ACCEPTED:  { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC', Icon: CheckCircle2 },
    REJECTED:  { bg: '#FEE2E2', text: '#B91C1C', border: '#FCA5A5', Icon: XCircle },
    PRESENT:   { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC', Icon: Check },
    ABSENT:    { bg: '#FEE2E2', text: '#B91C1C', border: '#FCA5A5', Icon: X },
    LATE:      { bg: '#FEF9C3', text: '#A16207', border: '#FDE047', Icon: Minus },
    ENROLLED:  { bg: '#DBEAFE', text: '#1D4ED8', border: '#93C5FD', Icon: BookOpen },
    COMPLETED: { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC', Icon: Award },
    DROPPED:   { bg: '#FEE2E2', text: '#B91C1C', border: '#FCA5A5', Icon: XCircle },
    SUBMITTED: { bg: '#DBEAFE', text: '#1D4ED8', border: '#93C5FD', Icon: CheckCircle2 },
    GRADED:    { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC', Icon: Award },
};

const fallback = { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1', Icon: AlertCircle };

interface StatusBadgeProps {
    status: StatusType;
    className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
    const cfg = config[status] ?? fallback;
    const { bg, text, border, Icon } = cfg;

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${className}`}
            style={{ background: bg, color: text, borderColor: border }}
        >
            <Icon size={11} />
            {status.charAt(0) + status.slice(1).toLowerCase()}
        </span>
    );
}
