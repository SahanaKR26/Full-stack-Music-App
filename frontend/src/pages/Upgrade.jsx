import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../services/api';
import { Check, Star, Zap } from 'lucide-react';
import './Upgrade.css';
const Upgrade = () => {
    const { subscriptionPlan, updateSubscription } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const handleUpgrade = async (plan) => {
        if (subscriptionPlan === plan)
            return;
        setLoading(true);
        setMessage('');
        // Simulating a fake payment gateway delay
        setTimeout(async () => {
            try {
                const res = await fetchWithAuth('/api/users/upgrade', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ plan, Plan: plan })
                });
                if (res.ok) {
                    const data = await res.json();
                    updateSubscription(data.newPlan);
                    setMessage(`Payment successful! You are now on the ${data.newPlan} plan.`);
                }
                else {
                    setMessage('Failed to upgrade. Please try again.');
                }
            }
            catch (err) {
                setMessage('Network error during upgrade.');
            }
            finally {
                setLoading(false);
            }
        }, 1500); // 1.5s fake delay
    };
    return (<div className="upgrade-container animate-enter">
            <header className="page-header text-center">
                <h1 className="gradient-text">Upgrade Your Experience</h1>
                <p>Unlock premium features and support the platform</p>
                {message && <div className="upgrade-message">{message}</div>}
            </header>

            <div className="pricing-grid">
                {/* Free Plan */}
                <div className={`pricing-card glass-panel ${subscriptionPlan === 'Free' ? 'current-plan' : ''}`}>
                    <div className="plan-header">
                        <h2>Free</h2>
                        <div className="price">₹0<span>/month</span></div>
                    </div>
                    <ul className="plan-features">
                        <li><Check size={18}/> Basic streaming</li>
                        <li><Check size={18}/> Standard audio quality</li>
                        <li><Check size={18}/> Create playlists</li>
                        <li className="disabled-feature">Offline downloads</li>
                        <li className="disabled-feature">Ad-free experience</li>
                        <li className="disabled-feature">Golden Theme</li>
                    </ul>
                    <button className="plan-btn" disabled={subscriptionPlan === 'Free'}>
                        {subscriptionPlan === 'Free' ? 'Current Plan' : 'Downgrade to Free'}
                    </button>
                </div>

                {/* Premium Plan */}
                <div className={`pricing-card glass-panel premium-card ${subscriptionPlan === 'Premium' ? 'current-plan' : ''}`}>
                    <div className="popular-badge">Most Popular</div>
                    <div className="plan-header">
                        <h2>Premium <Star size={20} className="icon-inline"/></h2>
                        <div className="price">₹399<span>/month</span></div>
                    </div>
                    <ul className="plan-features">
                        <li><Check size={18}/> Everything in Free</li>
                        <li><Check size={18}/> Ad-free experience</li>
                        <li><Check size={18}/> Up to 320kbps audio</li>
                        <li><Check size={18}/> Golden Premium Theme</li>
                        <li className="disabled-feature">Offline downloads</li>
                    </ul>
                    <button className="plan-btn primary-btn" onClick={() => handleUpgrade('Premium')} disabled={loading || subscriptionPlan === 'Premium'}>
                        {loading ? 'Processing...' : subscriptionPlan === 'Premium' ? 'Current Plan' : 'Fake Checkout ₹399'}
                    </button>
                </div>

                {/* Pro Plan */}
                <div className={`pricing-card glass-panel pro-card ${subscriptionPlan === 'Pro' ? 'current-plan' : ''}`}>
                    <div className="plan-header">
                        <h2>Pro <Zap size={20} className="icon-inline"/></h2>
                        <div className="price">₹699<span>/month</span></div>
                    </div>
                    <ul className="plan-features">
                        <li><Check size={18}/> Everything in Premium</li>
                        <li><Check size={18}/> Offline downloads</li>
                        <li><Check size={18}/> Lossless audio quality</li>
                        <li><Check size={18}/> Priority support</li>
                    </ul>
                    <button className="plan-btn cta-btn" onClick={() => handleUpgrade('Pro')} disabled={loading || subscriptionPlan === 'Pro'}>
                        {loading ? 'Processing...' : subscriptionPlan === 'Pro' ? 'Current Plan' : 'Fake Checkout ₹699'}
                    </button>
                </div>
            </div>
        </div>);
};
export default Upgrade;
