import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
    const { logout, username } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex font-display animate-enter">
            {/* Sidebar */}
            <aside className="w-72 border-r border-slate-200 dark:border-primary/10 flex flex-col fixed h-full bg-white dark:bg-background-dark z-50 shadow-xl shadow-slate-200/20 dark:shadow-none">
                <div className="p-6 flex items-center gap-3">
                    <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined">database</span>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">Groovvy Admin</h1>
                </div>

                <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                    <NavLink
                        to="/admin"
                        end
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-primary/5 font-medium'}`
                        }
                    >
                        <span className="material-symbols-outlined">dashboard</span>
                        <span>Dashboard Overview</span>
                    </NavLink>
                    <NavLink
                        to="/admin/users"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-primary/5 font-medium'}`
                        }
                    >
                        <span className="material-symbols-outlined">group</span>
                        <span>Manage Users</span>
                    </NavLink>
                    <NavLink
                        to="/admin/upload"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-primary/5 font-medium'}`
                        }
                    >
                        <span className="material-symbols-outlined">cloud_upload</span>
                        <span>Upload Music</span>
                    </NavLink>

                    <div className="pt-6 pb-2 px-4 text-xs font-bold text-slate-400 dark:text-primary/40 uppercase tracking-wider">System</div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all font-medium">
                        <span className="material-symbols-outlined">logout</span>
                        <span>Sign Out</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-primary/10 bg-slate-50 dark:bg-primary/5">
                    <div className="flex items-center gap-3 p-2">
                        <div className="size-10 rounded-full border-2 border-primary/20 bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{username}</span>
                            <span className="text-xs font-medium text-primary">Super Admin</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 ml-72 flex flex-col h-screen overflow-hidden bg-slate-50/50 dark:bg-transparent">
                <header className="h-20 border-b border-slate-200 dark:border-primary/10 flex items-center justify-between px-8 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md z-40 shrink-0">
                    <div className="flex-1 max-w-xl">
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                            <input
                                className="w-full bg-slate-100 dark:bg-primary/5 border-none rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/50 transition-all dark:text-white placeholder:text-slate-400 dark:placeholder:text-primary/40 font-medium"
                                placeholder="Search admin panel..."
                                type="text"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="size-10 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-primary/70 dark:hover:bg-primary/10 transition-all relative">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2 size-2.5 bg-red-500 rounded-full border-2 border-white dark:border-background-dark"></span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
