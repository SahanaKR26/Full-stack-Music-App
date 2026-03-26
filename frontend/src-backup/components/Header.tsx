import { Search, Bell, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { username, subscriptionPlan } = useAuth();
    const plan = subscriptionPlan || 'Free';

    return (
        <header className="h-16 flex items-center justify-between px-8 bg-background-dark/80 backdrop-blur-md z-10 shrink-0">
            <div className="w-96">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
                    <input
                        className="w-full bg-card-dark border-none rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-slate-600 transition-all"
                        placeholder="Search for songs, artists, or albums"
                        type="text"
                    />
                </div>
            </div>
            <div className="flex items-center gap-6">
                <button className="relative text-slate-400 hover:text-slate-100 transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-0 right-0 size-2 bg-primary rounded-full border-2 border-background-dark"></span>
                </button>
                <button className="text-slate-400 hover:text-slate-100 transition-colors">
                    <Settings size={20} />
                </button>
                <div className="flex items-center gap-3 pl-6 border-l border-primary/10">
                    <div className="text-right">
                        <p className="text-sm font-semibold text-slate-100">{username || 'Guest User'}</p>
                        <p className="text-[10px] text-primary uppercase font-bold tracking-widest">{plan}</p>
                    </div>
                    <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border-2 border-primary/20">
                        {username?.[0]?.toUpperCase() || 'U'}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
