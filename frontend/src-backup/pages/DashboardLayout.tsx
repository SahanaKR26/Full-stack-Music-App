import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import PlayerBar from '../components/PlayerBar';
import Header from '../components/Header';
import './DashboardLayout.css';

const DashboardLayout = () => {
    return (
        <div className="flex h-screen overflow-hidden bg-background-dark text-slate-100 font-display">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full relative overflow-hidden">
                <Header />
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <Outlet />
                </div>
            </main>
            <PlayerBar />
        </div>
    );
};

export default DashboardLayout;
