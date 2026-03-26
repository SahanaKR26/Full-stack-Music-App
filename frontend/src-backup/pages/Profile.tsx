import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth, API_URL } from '../services/api';
import { User, Lock, Camera, Check } from 'lucide-react';
import './Profile.css';

const Profile = () => {
    const { username, subscriptionPlan } = useAuth();
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [saving, setSaving] = useState(false);

    const notify = (text: string, type: 'success' | 'error' = 'success') => {
        setMsg({ text, type });
        setTimeout(() => setMsg(null), 3500);
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetchWithAuth('/api/users/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    currentPassword: currentPassword || undefined,
                    newPassword: newPassword || undefined
                })
            });
            if (res.ok) {
                notify('Profile updated successfully!');
                setCurrentPassword('');
                setNewPassword('');
            } else {
                const data = await res.text();
                notify(data || 'Failed to update profile.', 'error');
            }
        } catch {
            notify('Network error.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const form = new FormData();
        form.append('file', file);
        const res = await fetchWithAuth('/api/users/me/avatar', { method: 'POST', body: form });
        if (res.ok) {
            const data = await res.json();
            setAvatarUrl(data.avatarUrl);
            notify('Avatar updated!');
        }
    };

    const planColors: Record<string, string> = { Free: '#95a5a6', Premium: '#f1c40f', Pro: '#9b59b6' };
    const plan = subscriptionPlan || 'Free';

    return (
        <div className="profile-container animate-enter">
            <header className="page-header">
                <h1 className="gradient-text">My Profile</h1>
                <p>Manage your account and preferences</p>
            </header>

            {msg && <div className={`profile-alert ${msg.type}`}>{msg.text}</div>}

            <div className="profile-grid">
                {/* Avatar & Plan Card */}
                <div className="profile-card glass-panel">
                    <div className="avatar-section">
                        <div className="profile-avatar-wrap">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl.startsWith('http') ? avatarUrl : `${API_URL}${avatarUrl}`}
                                    alt="avatar"
                                    className="profile-avatar-img"
                                />
                            ) : (
                                <div className="profile-avatar-placeholder">
                                    {username?.[0]?.toUpperCase() || 'U'}
                                </div>
                            )}
                            <label className="avatar-upload-btn" title="Change avatar">
                                <Camera size={18} />
                                <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
                            </label>
                        </div>
                        <h2>{username}</h2>
                        <span
                            className="profile-plan-badge"
                            style={{
                                background: `${planColors[plan]}22`,
                                color: planColors[plan],
                                border: `1px solid ${planColors[plan]}55`
                            }}
                        >
                            {plan} Plan
                        </span>
                    </div>
                </div>

                {/* Edit Form Card */}
                <div className="profile-card glass-panel">
                    <h3><User size={18} className="icon-inline" /> Account Details</h3>
                    <form onSubmit={handleSaveProfile} className="profile-form">
                        <div className="profile-input-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="your@email.com"
                            />
                        </div>

                        <div className="profile-divider"><Lock size={14} /> Change Password</div>

                        <div className="profile-input-group">
                            <label>Current Password</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                placeholder="Required to change password"
                            />
                        </div>
                        <div className="profile-input-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                placeholder="Leave blank to keep current"
                            />
                        </div>

                        <button type="submit" className="primary-btn" disabled={saving}>
                            <Check size={18} />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
