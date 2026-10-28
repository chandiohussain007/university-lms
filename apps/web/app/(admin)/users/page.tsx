'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Users, Trash2, ShieldCheck, User } from 'lucide-react';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';

interface User {
    id: string;
    email: string;
    isSuperAdmin: boolean;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [newUser, setNewUser] = useState({ email: '', password: '', isSuperAdmin: false });
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => { loadUsers(); }, []);

    async function loadUsers() {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setCreating(true);
        try {
            await api.post('/users', newUser);
            setNewUser({ email: '', password: '', isSuperAdmin: false });
            setShowForm(false);
            loadUsers();
        } catch (error) {
            console.error('Failed to create user:', error);
        } finally {
            setCreating(false);
        }
    }

    const inputCls = 'input-field';

    return (
        <div className="animate-fade-up">
            <PageHeader
                title={`Users ${!loading ? `(${users.length})` : ''}`}
                subtitle="Manage system accounts and access roles"
                action={{ label: 'Add User', icon: Plus, onClick: () => setShowForm(v => !v) }}
            />

            {/* Create form */}
            {showForm && (
                <div
                    className="card p-6 mb-6"
                    style={{ background: '#F0F7FF', borderColor: '#BFDBFE' }}
                >
                    <h2 className="text-sm font-semibold mb-4" style={{ color: '#1E3A8A' }}>
                        New User Account
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: '#475569' }}>
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="user@university.edu"
                                    value={newUser.email}
                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: '#475569' }}>
                                    Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    placeholder="Min. 6 characters"
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                    className={inputCls}
                                />
                            </div>
                            <div className="flex flex-col justify-end">
                                <label className="flex items-center gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={newUser.isSuperAdmin}
                                        onChange={e => setNewUser({ ...newUser, isSuperAdmin: e.target.checked })}
                                        className="w-4 h-4 rounded accent-blue-700"
                                    />
                                    <span className="text-sm" style={{ color: '#1E293B' }}>Super Admin privileges</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={creating}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-colors"
                                style={{ background: '#1D4ED8' }}
                                onMouseEnter={e => !creating && (e.currentTarget.style.background = '#1E3A8A')}
                                onMouseLeave={e => (e.currentTarget.style.background = '#1D4ED8')}
                            >
                                {creating ? 'Creating…' : 'Create User'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                                style={{ border: '1px solid #E2E8F0', color: '#475569', background: '#FFFFFF' }}
                                onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                                onMouseLeave={e => (e.currentTarget.style.background = '#FFFFFF')}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Users table */}
            <div className="card overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                            <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style={{ color: '#94A3B8' }}>
                                User
                            </th>
                            <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style={{ color: '#94A3B8' }}>
                                Role
                            </th>
                            <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style={{ color: '#94A3B8' }}>
                                User ID
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={3} className="px-5 py-12 text-center text-sm" style={{ color: '#94A3B8' }}>
                                    <div className="spinner w-6 h-6 mx-auto mb-2" />
                                    Loading users…
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-5 py-12 text-center">
                                    <Users size={36} className="mx-auto mb-3" style={{ color: '#CBD5E1' }} />
                                    <p className="text-sm" style={{ color: '#94A3B8' }}>No users found.</p>
                                    <button
                                        onClick={() => setShowForm(true)}
                                        className="mt-3 text-sm font-medium"
                                        style={{ color: '#1D4ED8' }}
                                    >
                                        Create the first user →
                                    </button>
                                </td>
                            </tr>
                        ) : (
                            users.map((u, i) => (
                                <tr
                                    key={u.id}
                                    style={{
                                        borderTop: i === 0 ? 'none' : '1px solid #F1F5F9',
                                        transition: 'background 0.1s',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                                style={{ background: u.isSuperAdmin ? '#7C3AED' : '#1D4ED8' }}
                                            >
                                                {u.email.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium" style={{ color: '#0F172A' }}>
                                                {u.email}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        {u.isSuperAdmin ? (
                                            <span
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                                                style={{ background: '#F3E8FF', color: '#6B21A8', borderColor: '#D8B4FE' }}
                                            >
                                                <ShieldCheck size={11} /> Super Admin
                                            </span>
                                        ) : (
                                            <span
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                                                style={{ background: '#F1F5F9', color: '#475569', borderColor: '#CBD5E1' }}
                                            >
                                                <User size={11} /> User
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className="text-xs font-mono" style={{ color: '#94A3B8' }}>
                                            {u.id}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
