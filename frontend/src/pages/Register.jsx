import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../services/api';
import './Auth.css';
const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Registration failed');
            }
            navigate('/login');
        }
        catch (err) {
            setError(err.message);
        }
    };
    return (<div className="flex flex-col lg:flex-row w-full min-h-screen font-display items-stretch animate-enter">
        {/* Left Side: Visual Content */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary/10">
            <div className="absolute inset-0 z-0">
                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAcbZEwpGFLr7K-WNshYohQkb1JtGLTAb7Fv8mHMxAamCwIxt60w_ukCXyTdZqHSz-t8zMoBnUx5kqi60mPVGOnmk3uZTsG2tGi7Rr58R4ZCkixxQAWKCeXDB555DiiN6x_01W-RzHxPZiNwm9ntXV_cWiywHW5d9dQ_YrKOTal78yBeKWtsGOKLhw7no7e0dlQNH5X6vA2QB4Bs89MPaVxHWcw49QfEefu1BSSMk6xqWxMtFr1ai_H8w9W7PLi6WwYssZzQvRCVaM')" }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent"></div>
            </div>
            <div className="relative z-10 flex flex-col justify-between p-16 w-full">
                <div className="flex items-center gap-3">
                    <div className="bg-primary p-2 rounded-lg">
                        <span className="material-symbols-outlined text-white text-3xl">database</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-white">Groovvy</h1>
                </div>
                <div className="max-w-md">
                    <h2 className="text-5xl font-extrabold text-white leading-tight mb-6">Experience music like never before.</h2>
                    <p className="text-slate-300 text-lg">Join a community of millions of artists and fans. High fidelity sound, exclusive drops, and seamless sharing.</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex -space-x-3">
                        <img className="h-10 w-10 rounded-full border-2 border-background-dark" src="https://lh3.googleusercontent.com/aida-public/AB6AXuClzQq39a0dmLvyYCOwLKORLtbDnuYsvqbJ8RNjeFxY252fCUxlhIkV5jBDQJRgO1nW0jNzgf5pwPPzHcMYAgdqDxJoGi8O2eVaIZssn66fx5CKEMbw220FQhm6T7Y69Lj1He6sqy65HBg1VGaEDCakAmabHloS9Bljo4xFy4S0RfhNWHOulaAIoTeIpFlTZuRSHGcSb0tEwKMLTYGM4froEbMnaZ73BsWgIBkbbFNzZT-vxhqjOHdRSwjsgp1sOKbN0jvcc6J4jNw" alt="" />
                        <img className="h-10 w-10 rounded-full border-2 border-background-dark" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZaU6uzCMd7jvYqkk1XgP7E8eFzmmZnT2q4L_FvfiM_eFzUe6broJA1uKOqyk3JjlU-bRmX0avW5_oyFadGGVM0jSpJpJFF8KYofkY7s5CaCdXwQhRsJcqqjDzFbhe1wOsfcuYbVf5LOQKqIHu8YB4SvrJCXvlp0XVI1k0wkZhdrvXJLRfFg_v-q0nVDRhmH9ub6Qbs-WUCs-So1Bi6AGvOTU_1Y6dsTRXddGCwFJVRfgGkn4cQwuF0Cbq4sBeOarExbHvz-irjbY" alt="" />
                    </div>
                    <p className="text-sm text-slate-400 self-center">Joined by 20k+ listeners this week</p>
                </div>
            </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 lg:px-24 bg-background-light dark:bg-background-dark min-h-screen">
            <div className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center">
                {/* Mobile Logo */}
                <div className="lg:hidden flex items-center gap-2 mb-8">
                    <div className="bg-primary p-1.5 rounded-lg">
                        <span className="material-symbols-outlined text-white text-xl">database</span>
                    </div>
                    <h1 className="text-xl font-black tracking-tight dark:text-white">Groovvy</h1>
                </div>

                <div className="mb-10">
                    <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Create Account</h2>
                    <p className="text-slate-500 dark:text-slate-400">Join the Groovvy platform and explore new music.</p>
                </div>

                {/* Toggle */}
                <div className="flex p-1 mb-8 bg-slate-200 dark:bg-primary/10 rounded-xl">
                    <Link to="/login" className="flex-1 py-2 text-sm font-semibold text-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Login</Link>
                    <button className="flex-1 py-2 text-sm font-semibold rounded-lg bg-white dark:bg-primary text-slate-900 dark:text-white shadow-sm transition-colors cursor-default">Sign Up</button>
                </div>

                {error && (<div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                    {error}
                </div>)}

                {/* Form */}
                <form className="space-y-5" onSubmit={handleRegister}>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Username</label>
                        <input className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" placeholder="Choose a username" type="text" value={username} onChange={e => setUsername(e.target.value)} required />
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                        </div>
                        <div className="relative">
                            <input className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" placeholder="••••••••" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" type="button">
                                <span className="material-symbols-outlined text-xl">visibility</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary bg-transparent" id="terms" type="checkbox" required />
                        <label className="text-sm text-slate-600 dark:text-slate-400" htmlFor="terms">I agree to the Terms & Privacy Policy</label>
                    </div>

                    <button className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all transform hover:scale-[1.01] active:scale-[0.99] mt-4" type="submit">
                        Sign Up
                    </button>
                </form>

                <p className="mt-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                    Already have an account? <Link className="text-primary font-bold hover:underline ml-1" to="/login">Sign in</Link>
                </p>
            </div>

            {/* Footer Info */}
            <div className="mt-auto pt-10 flex flex-wrap justify-between gap-4 text-xs text-slate-400 uppercase tracking-tight">
                <p>© 2024 Groovvy Music Platform</p>
                <div className="flex gap-4">
                    <a className="hover:text-primary transition-colors" href="#">Privacy</a>
                    <a className="hover:text-primary transition-colors" href="#">Terms</a>
                    <a className="hover:text-primary transition-colors" href="#">Support</a>
                </div>
            </div>
        </div>
    </div>);
};
export default Register;
