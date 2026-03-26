import { NavLink } from 'react-router-dom';
import { Home, Compass, Radio, Disc, Mic2, History, Heart, Folder, PlusCircle, Plus, Music } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
    return (
        <aside className="w-64 bg-background-dark border-r border-primary/10 flex flex-col h-full overflow-y-auto custom-scrollbar shrink-0">
            <div className="p-6 flex items-center gap-3">
                <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
                    <Music size={20} />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-100">MusicFlow</h2>
            </div>

            <nav className="flex-1 px-4 space-y-6">
                <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">Menu</p>
                    <div className="space-y-1">
                        <NavLink to="/" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-slate-400 hover:bg-primary/5 hover:text-slate-100"}`} end>
                            <Home size={18} />
                            <span className="text-sm font-medium">Home</span>
                        </NavLink>
                        <NavLink to="/search" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-slate-400 hover:bg-primary/5 hover:text-slate-100"}`}>
                            <Compass size={18} />
                            <span className="text-sm font-medium">Explore</span>
                        </NavLink>
                        <NavLink to="/artists" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-slate-400 hover:bg-primary/5 hover:text-slate-100"}`}>
                            <Mic2 size={18} />
                            <span className="text-sm font-medium">Artists</span>
                        </NavLink>
                        <NavLink to="/albums" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-slate-400 hover:bg-primary/5 hover:text-slate-100"}`}>
                            <Disc size={18} />
                            <span className="text-sm font-medium">Albums</span>
                        </NavLink>
                        <NavLink to="/radio" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-slate-400 hover:bg-primary/5 hover:text-slate-100"}`}>
                            <Radio size={18} />
                            <span className="text-sm font-medium">Radio</span>
                        </NavLink>
                    </div>
                </div>

                <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">Library</p>
                    <div className="space-y-1">
                        <NavLink to="/recent" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-slate-400 hover:bg-primary/5 hover:text-slate-100"}`}>
                            <History size={18} />
                            <span className="text-sm font-medium">Recent</span>
                        </NavLink>
                        <NavLink to="/library" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-slate-400 hover:bg-primary/5 hover:text-slate-100"}`}>
                            <Heart size={18} />
                            <span className="text-sm font-medium">Favourites</span>
                        </NavLink>
                        <NavLink to="/local" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-slate-400 hover:bg-primary/5 hover:text-slate-100"}`}>
                            <Folder size={18} />
                            <span className="text-sm font-medium">Local</span>
                        </NavLink>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between px-3 mb-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Playlists</p>
                        <button className="text-primary hover:text-primary/80 transition-colors">
                            <PlusCircle size={16} />
                        </button>
                    </div>
                    <div className="space-y-1">
                        <NavLink to="/playlists/1" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-primary/5 hover:text-slate-100 transition-colors">
                            <Music size={18} className="text-primary" />
                            <span className="text-sm font-medium">Design Flow</span>
                        </NavLink>
                        <NavLink to="/playlists/2" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-primary/5 hover:text-slate-100 transition-colors">
                            <Music size={18} className="text-emerald-400" />
                            <span className="text-sm font-medium">Best of 2020</span>
                        </NavLink>
                        <NavLink to="/playlists/3" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-primary/5 hover:text-slate-100 transition-colors">
                            <Music size={18} className="text-orange-400" />
                            <span className="text-sm font-medium">Nigeria Jams</span>
                        </NavLink>
                    </div>
                </div>
            </nav>

            <div className="p-4 border-t border-primary/10">
                <button className="w-full bg-primary hover:bg-primary/90 text-white text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                    <Plus size={18} />
                    Create New Playlist
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;

