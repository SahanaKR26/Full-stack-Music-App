import { useState, useEffect } from 'react';
import { fetchWithAuth, API_URL } from '../services/api';
import { Mic2, Play } from 'lucide-react';
import './Artists.css';

interface Artist {
    id: number;
    name: string;
    bio: string;
    imagePath: string | null;
}

const Artists = () => {
    const [artists, setArtists] = useState<Artist[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetchWithAuth('/api/artists');
                if (res.ok) setArtists(await res.json());
                else setError('Failed to load artists.');
            } catch {
                setError('Network error loading artists.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <div className="artists-container animate-enter">
            <header className="page-header">
                <h1 className="gradient-text">Artists</h1>
                <p>Browse all artists on the platform</p>
            </header>

            {error && <div className="error-msg">{error}</div>}

            {loading ? (
                <div className="loading">Loading artists...</div>
            ) : artists.length === 0 ? (
                <div className="empty-state">
                    <Mic2 size={64} style={{ opacity: 0.2, marginBottom: 16 }} />
                    <p>No artists yet. Admins can add artists from the Admin Panel.</p>
                </div>
            ) : (
                <div className="artists-grid">
                    {artists.map(artist => (
                        <div key={artist.id} className="artist-card glass-panel">
                            <div className="artist-avatar-wrap">
                                {artist.imagePath ? (
                                    <img
                                        src={artist.imagePath.startsWith('http') ? artist.imagePath : `${API_URL}${artist.imagePath}`}
                                        alt={artist.name}
                                        className="artist-avatar"
                                    />
                                ) : (
                                    <div className="artist-avatar-placeholder">
                                        <Mic2 size={40} />
                                    </div>
                                )}
                                <div className="artist-play-overlay"><Play size={24} fill="white" /></div>
                            </div>
                            <div className="artist-info">
                                <h3>{artist.name}</h3>
                                {artist.bio && <p className="artist-bio">{artist.bio}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Artists;
