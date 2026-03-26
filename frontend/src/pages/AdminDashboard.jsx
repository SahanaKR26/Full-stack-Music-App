import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../services/api';
import './AdminDashboard.css';
const AdminDashboard = () => {
    const [overview, setOverview] = useState(null);
    const [error, setError] = useState(null);
    useEffect(() => {
        const load = async () => {
            try {
                const ov = await fetchWithAuth('/api/analytics/overview');
                if (ov.ok)
                    setOverview(await ov.json());
            }
            catch {
                setError('Failed to load admin data.');
            }
        };
        load();
    }, []);
    return (<div className="p-6 lg:p-10 space-y-8 max-w-7xl w-full mx-auto animate-enter">
            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl">{error}</div>}

            {/* Hero Welcome */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">Dashboard Overview</h1>
                    <p className="text-slate-500 dark:text-primary/60">Welcome back, Groovvy Admin. Here's your platform status.</p>
                </div>
                <button className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all w-fit pointer-events-none">
                    <span className="material-symbols-outlined">download</span>
                    Export Report
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {/* User Stat */}
                <div className="relative group overflow-hidden rounded-xl p-6 border border-slate-200 dark:border-primary/10 bg-white/80 dark:bg-primary/5 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-primary group-hover:scale-110 transition-transform pointer-events-none">
                        <span className="material-symbols-outlined text-6xl">group</span>
                    </div>
                    <p className="text-slate-500 dark:text-primary/60 font-medium">Total Users</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{overview?.totalUsers?.toLocaleString() || '0'}</h3>
                        <span className="text-emerald-500 text-sm font-bold flex items-center">
                            <span className="material-symbols-outlined text-xs mr-0.5">trending_up</span> 12%
                        </span>
                    </div>
                </div>

                {/* Streams Stat */}
                <div className="relative group overflow-hidden rounded-xl p-6 border border-slate-200 dark:border-primary/10 bg-white/80 dark:bg-primary/5 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-primary group-hover:scale-110 transition-transform pointer-events-none">
                        <span className="material-symbols-outlined text-6xl">play_circle</span>
                    </div>
                    <p className="text-slate-500 dark:text-primary/60 font-medium">Total Streams</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{overview?.totalPlays?.toLocaleString() || '0'}</h3>
                        <span className="text-emerald-500 text-sm font-bold flex items-center">
                            <span className="material-symbols-outlined text-xs mr-0.5">trending_up</span> 8%
                        </span>
                    </div>
                </div>

                {/* Premium Stat */}
                <div className="relative group overflow-hidden rounded-xl p-6 border border-slate-200 dark:border-primary/10 bg-white/80 dark:bg-primary/5 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-primary group-hover:scale-110 transition-transform pointer-events-none">
                        <span className="material-symbols-outlined text-6xl">account_balance_wallet</span>
                    </div>
                    <p className="text-slate-500 dark:text-primary/60 font-medium">Premium Users</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{overview?.premiumUsers?.toLocaleString() || '0'}</h3>
                        <span className="text-emerald-500 text-sm font-bold flex items-center">
                            <span className="material-symbols-outlined text-xs mr-0.5">trending_up</span> 15%
                        </span>
                    </div>
                </div>

                {/* Artists Stat */}
                <div className="relative group overflow-hidden rounded-xl p-6 border border-slate-200 dark:border-primary/10 bg-white/80 dark:bg-primary/5 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-primary group-hover:scale-110 transition-transform pointer-events-none">
                        <span className="material-symbols-outlined text-6xl">artist</span>
                    </div>
                    <p className="text-slate-500 dark:text-primary/60 font-medium">Active Artists</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{overview?.totalArtists?.toLocaleString() || '0'}</h3>
                        <span className="text-rose-500 text-sm font-bold flex items-center">
                            <span className="material-symbols-outlined text-xs mr-0.5">trending_down</span> 2%
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart Placeholder */}
                <div className="lg:col-span-2 space-y-4 rounded-xl border border-slate-200 dark:border-primary/10 bg-white/50 dark:bg-primary/5 p-6 backdrop-blur-sm shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Streaming Trends</h4>
                            <p className="text-sm text-slate-500 dark:text-primary/60">Weekly play counts (millions)</p>
                        </div>
                        <select className="bg-slate-100 dark:bg-primary/20 border-none rounded-lg text-xs font-bold text-slate-600 dark:text-primary/80 focus:ring-primary">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>

                    <div className="pt-6 h-[240px] w-full">
                        {/* Static SVG Chart mimicking design */}
                        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 120">
                            <defs>
                                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#6b59f3" stopOpacity={0.3}/>
                                    <stop offset="100%" stopColor="#6b59f3" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <path d="M0,100 Q40,40 80,80 T160,20 T240,60 T320,40 T400,10 L400,120 L0,120 Z" fill="url(#chartGradient)"></path>
                            <path d="M0,100 Q40,40 80,80 T160,20 T240,60 T320,40 T400,10" fill="none" stroke="#6b59f3" strokeLinecap="round" strokeWidth={3}></path>
                        </svg>
                    </div>

                    <div className="flex justify-between text-xs font-bold text-slate-400 dark:text-primary/40 uppercase tracking-tighter">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="space-y-4 rounded-xl border border-slate-200 dark:border-primary/10 bg-white/50 dark:bg-primary/5 p-6 backdrop-blur-sm shadow-sm flex flex-col">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h4>
                    <div className="space-y-6 flex-1">
                        <div className="flex gap-4">
                            <div className="flex-none size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-[20px]">person_add</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <p className="text-sm font-medium"><span className="text-primary font-bold">New Artist</span> "Lunar Pulse" joined.</p>
                                <span className="text-xs text-slate-500 dark:text-primary/40">2 mins ago</span>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-none size-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <p className="text-sm font-medium">Payout of <span className="text-emerald-500 font-bold">$1,200</span> processed.</p>
                                <span className="text-xs text-slate-500 dark:text-primary/40">45 mins ago</span>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-none size-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                                <span className="material-symbols-outlined text-[20px]">warning</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <p className="text-sm font-medium">Server load exceeded <span className="text-amber-500 font-bold">85%</span>.</p>
                                <span className="text-xs text-slate-500 dark:text-primary/40">2 hours ago</span>
                            </div>
                        </div>
                    </div>
                    <button className="w-full py-2.5 text-sm font-bold text-primary hover:bg-primary/10 rounded-lg transition-colors mt-auto pointer-events-none">
                        View All Activity
                    </button>
                </div>
            </div>

            {/* Revenue Detailed Card */}
            <div className="rounded-xl border border-slate-200 dark:border-primary/10 bg-gradient-to-br from-primary to-primary/60 p-8 text-white relative overflow-hidden group shadow-lg">
                <div className="absolute -right-16 -bottom-16 size-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 pointer-events-none">
                    <div className="space-y-2 text-center md:text-left">
                        <p className="text-white/80 font-medium uppercase tracking-widest text-xs">Platform Health</p>
                        <h2 className="text-3xl font-black">Revenue is up 24% this month</h2>
                        <p className="text-white/70 max-w-md">Your strategies are working! Most growth is coming from premium subscription renewals in European markets.</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="bg-white text-primary px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-50 transition-colors pointer-events-auto">See Details</button>
                    </div>
                </div>
            </div>
        </div>);
};
export default AdminDashboard;
