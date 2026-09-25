'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface User {
    id: string;
    email: string;
    isSuperAdmin: boolean;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [newUser, setNewUser] = useState({ email: '', password: '', isSuperAdmin: false });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

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
        try {
            await api.post('/users', {
                email: newUser.email,
                password: newUser.password,
                isSuperAdmin: newUser.isSuperAdmin
            });
            setNewUser({ email: '', password: '', isSuperAdmin: false });
            loadUsers();
        } catch (error) {
            console.error('Failed to create user:', error);
        }
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Users</h1>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 mb-8">
                <h2 className="text-xl font-semibold mb-4">Add New User</h2>
                <form onSubmit={handleSubmit} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                            required
                        />
                    </div>
                    <div className="w-48">
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                            required
                        />
                    </div>
                    <div className="pb-3 pl-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={newUser.isSuperAdmin}
                                onChange={(e) => setNewUser({ ...newUser, isSuperAdmin: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <span className="text-sm font-medium">Super Admin</span>
                        </label>
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                    >
                        Add User
                    </button>
                </form>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                        <tr>
                            <th className="p-4 font-medium text-zinc-500 dark:text-zinc-400">Email</th>
                            <th className="p-4 font-medium text-zinc-500 dark:text-zinc-400">Role</th>
                            <th className="p-4 font-medium text-zinc-500 dark:text-zinc-400">ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={3} className="p-4 text-center">Loading...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan={3} className="p-4 text-center text-zinc-500">No users found.</td></tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="border-t border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                    <td className="p-4 font-medium">{user.email}</td>
                                    <td className="p-4">
                                        {user.isSuperAdmin ? (
                                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold dark:bg-purple-900/30 dark:text-purple-300">
                                                SUPER ADMIN
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 bg-zinc-100 text-zinc-700 rounded text-xs font-bold dark:bg-zinc-800 dark:text-zinc-300">
                                                USER
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-zinc-400 text-sm font-mono">{user.id}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
