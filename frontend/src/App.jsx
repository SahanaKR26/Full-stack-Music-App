import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';
// User layout & pages
import DashboardLayout from './pages/DashboardLayout';
import Home from './pages/Home';
import Search from './pages/Search';
import Playlists from './pages/Playlists';
import Upload from './pages/Upload';
import Upgrade from './pages/Upgrade';
import Library from './pages/Library';
import Artists from './pages/Artists';
import Profile from './pages/Profile';
// Admin layout & pages
import AdminLayout from './pages/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminUpload from './pages/AdminUpload';
// --- Route Guards ---
const UserRoute = ({ children }) => {
    const { isAuthenticated, role } = useAuth();
    if (!isAuthenticated)
        return <Navigate to="/login" replace/>;
    if (role === 'Admin')
        return <Navigate to="/admin" replace/>;
    return <>{children}</>;
};
const AdminRoute = ({ children }) => {
    const { isAuthenticated, role } = useAuth();
    if (!isAuthenticated)
        return <Navigate to="/login" replace/>;
    if (role !== 'Admin')
        return <Navigate to="/" replace/>;
    return <>{children}</>;
};
const AppRoutes = () => {
    return (<Routes>
      {/* Public */}
      <Route path="/login" element={<Login />}/>
      <Route path="/register" element={<Register />}/>

      {/* User Routes — music player layout */}
      <Route path="/" element={<UserRoute><DashboardLayout /></UserRoute>}>
        <Route index element={<Home />}/>
        <Route path="search" element={<Search />}/>
        <Route path="playlists" element={<Playlists />}/>
        <Route path="upload" element={<Upload />}/>
        <Route path="upgrade" element={<Upgrade />}/>
        <Route path="library" element={<Library />}/>
        <Route path="artists" element={<Artists />}/>
        <Route path="profile" element={<Profile />}/>
      </Route>

      {/* Admin Routes — no player bar, separate layout */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />}/>
        <Route path="users" element={<AdminUsers />}/>
        <Route path="upload" element={<AdminUpload />}/>
      </Route>

      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>);
};
const AppWrapper = () => {
    const { subscriptionPlan } = useAuth();
    const isPremium = subscriptionPlan === 'Premium' || subscriptionPlan === 'Pro';
    return (<div className={`app-root ${isPremium ? 'theme-gold' : ''}`}>
      <PlayerProvider>
        <Router>
          <AppRoutes />
        </Router>
      </PlayerProvider>
    </div>);
};
const App = () => (<AuthProvider>
    <AppWrapper />
  </AuthProvider>);
export default App;
