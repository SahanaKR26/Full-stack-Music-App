import { useState, useEffect } from 'react';
import { fetchWithAuth, API_URL } from '../services/api';
import { Music2, Trash2 } from 'lucide-react';
const AdminSongs = () => {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchSongs = async () => {
        try {
            const res = await fetchWithAuth('/api/songs');
            if (res.ok) {
                const data = await res.json();
                setSongs(data);
            }
            else {
                setError('Failed to load songs.');
            }
        }
        catch (e) {
            setError('Network error loading songs.');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchSongs(); }, []);
    return (<div className="admin-container animate-enter">
            <header className="page-header">
                <h1 className="gradient-text">All Songs</h1>
                <p>{songs.length} songs on the platform</p>
            </header>

            {error && <div className="admin-error">{error}</div>}

            {loading ? (<div className="loading">Loading songs...</div>) : (<div className="admin-songs-list glass-panel">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Art</th>
                                <th>Title</th>
                                <th>Artist</th>
                                <th>Album</th>
                                <th>Uploaded</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {songs.length === 0 ? (<tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>No songs uploaded yet.</td></tr>) : songs.map(song => (<tr key={song.id}>
                                    <td>
                                        {song.albumArtPath ? (<img src={song.albumArtPath.startsWith('http') ? song.albumArtPath : `${API_URL}${song.albumArtPath}`} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }}/>) : (<div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Music2 size={18} style={{ color: 'rgba(255,255,255,0.4)' }}/>
                                            </div>)}
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{song.title}</td>
                                    <td>{song.artist || '—'}</td>
                                    <td>{song.album || '—'}</td>
                                    <td style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                                        {new Date(song.uploadDate).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <button className="danger-btn small-btn" disabled title="Delete coming soon">
                                            <Trash2 size={15}/>
                                        </button>
                                    </td>
                                </tr>))}
                        </tbody>
                    </table>
                </div>)}
        </div>);
};
export default AdminSongs;
