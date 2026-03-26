import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../services/api';

const AdminUsers = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [blockMsg, setBlockMsg] = useState<string | null>(null);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const res = await fetchWithAuth('/api/users');
                if (res.ok) {
                    setUsers(await res.json());
                }
            } catch {
                setError('Failed to load users data.');
            }
        };
        loadUsers();
    }, []);

    const handleBlock = async (id: number) => {
        try {
            const res = await fetchWithAuth(`/api/users/${id}/block`, { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                setUsers(prev => prev.map(u => u.id === id ? { ...u, isBlocked: data.isBlocked } : u));
                setBlockMsg(data.message);
                setTimeout(() => setBlockMsg(null), 3000);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
        try {
            const res = await fetchWithAuth(`/api/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setUsers(prev => prev.filter(u => u.id !== id));
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto w-full animate-enter">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black tracking-tight mb-2 text-slate-900 dark:text-white">Manage Users</h2>
                    <p className="text-slate-500 dark:text-slate-400">Administration panel for platform user directory and permissions management.</p>
                </div>
                <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-all shadow-md shadow-primary/20 pointer-events-none">
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    Add New User
                </button>
            </div>

            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl mb-6">{error}</div>}
            {blockMsg && <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-medium rounded-xl mb-6">{blockMsg}</div>}

            <div className="bg-white/80 dark:bg-primary/5 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-primary/10">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-primary/10">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">User</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Email</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Role</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Subscription</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-primary/10">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500 font-medium">No users found.</td>
                                </tr>
                            ) : (
                                users.map(user => (
                                    <tr
                                        key={user.id}
                                        className={`hover:bg-slate-50/50 dark:hover:bg-primary/5 transition-colors ${user.isBlocked ? 'opacity-50' : ''}`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-full border-2 border-primary/20 bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {user.username?.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{user.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                            {user.email || '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.role === 'Admin' ? (
                                                <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Admin</span>
                                            ) : user.role === 'Artist' ? (
                                                <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">Artist</span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-500/10 text-slate-500 border border-slate-500/20">User</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.subscriptionPlan === 'Premium' || user.subscriptionPlan === 'Pro' ? (
                                                <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">{user.subscriptionPlan}</span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-500/10 text-slate-500 border border-slate-500/20">{user.subscriptionPlan || 'Free'}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleBlock(user.id)}
                                                    className="size-8 flex items-center justify-center rounded-lg hover:bg-amber-500/10 hover:text-amber-500 transition-all text-slate-400"
                                                    title={user.isBlocked ? "Unblock User" : "Suspend User"}
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">{user.isBlocked ? 'lock_open' : 'block'}</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className={`size-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-all ${user.role === 'Admin' ? 'opacity-20 pointer-events-none' : 'text-slate-400'}`}
                                                    title="Delete User"
                                                    disabled={user.role === 'Admin'}
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {users.length > 0 && (
                    <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-primary/10 bg-slate-50/50 dark:bg-transparent">
                        <p className="text-sm text-slate-500 font-medium">Showing all {users.length} users</p>
                        <div className="flex items-center gap-1">
                            <button className="size-10 flex items-center justify-center rounded-lg bg-primary text-white font-bold text-sm shadow-md">1</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;
