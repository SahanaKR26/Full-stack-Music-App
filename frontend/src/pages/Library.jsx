import { useState, useEffect } from 'react';
import { fetchWithAuth, API_URL } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import { Heart, Clock, Sparkles, Play } from 'lucide-react';
import './Library.css';
const Library = () => {
    const [tab, setTab] = useState('liked');
    const [liked, setLiked] = useState([]);
    const [recent, setRecent] = useState([]);
    const [recommended, setRecommended] = useState([]);
    const [loading, setLoading] = useState(false);
    const { playSong } = usePlayer();
    const getAlbumArt = (s) => s.albumArtPath?.startsWith('http') ? s.albumArtPath : s.albumArtPath ? `${API_URL}${s.albumArtPath}` : null;
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                if (tab === 'liked') {
                    const r = await fetchWithAuth('/api/favorites');
                    if (r.ok)
                        setLiked(await r.json());
                }
                else if (tab === 'recent') {
                    const r = await fetchWithAuth('/api/users/me/recently-played');
                    if (r.ok)
                        setRecent(await r.json());
                }
                else {
                    // Recommended: songs by liked artists
                    const likedRes = await fetchWithAuth('/api/favorites');
                    if (likedRes.ok) {
                        const likedSongs = await likedRes.json();
                        const likedArtists = [...new Set(likedSongs.map(s => s.artist))];
                        const allRes = await fetchWithAuth('/api/songs');
                        if (allRes.ok) {
                            const all = await allRes.json();
                            const recs = all
                                .filter(s => likedArtists.includes(s.artist) && !likedSongs.find(l => l.id === s.id))
                                .slice(0, 20);
                            setRecommended(recs.length > 0 ? recs : all.slice(0, 20));
                        }
                    }
                }
            }
            finally {
                setLoading(false);
            }
        };
        load();
    }, [tab]);
    const songs = tab === 'liked' ? liked : tab === 'recent' ? recent : recommended;
    const SongRow = ({ s }) => (<div className="song-row" onClick={() => playSong(s, songs)}>
            <div className="song-row-art">
                {getAlbumArt(s) ? (<img src={getAlbumArt(s)} alt=""/>) : (<div className="song-row-art-placeholder">♪</div>)}
                <div className="song-row-play-overlay"><Play size={20} fill="white"/></div>
            </div>
            <div className="song-row-info">
                <div className="song-row-title">{s.title}</div>
                <div className="song-row-artist">{s.artist}</div>
            </div>
            {s.genre && <span className="song-genre-badge">{s.genre}</span>}
        </div>);
    return (<div className="library-container animate-enter">
            <header className="page-header">
                <h1 className="gradient-text">Your Library</h1>
                <p>Your personal music collection</p>
            </header>
            <div className="lib-tabs">
                <button className={`lib-tab ${tab === 'liked' ? 'active' : ''}`} onClick={() => setTab('liked')}>
                    <Heart size={16}/> Liked Songs
                </button>
                <button className={`lib-tab ${tab === 'recent' ? 'active' : ''}`} onClick={() => setTab('recent')}>
                    <Clock size={16}/> Recently Played
                </button>
                <button className={`lib-tab ${tab === 'recommended' ? 'active' : ''}`} onClick={() => setTab('recommended')}>
                    <Sparkles size={16}/> Recommended
                </button>
            </div>
            {loading ? (<div className="loading">Loading...</div>) : songs.length === 0 ? (<div className="empty-state">
                    <p>Nothing here yet. Start listening to build your library!</p>
                </div>) : (<div className="songs-list glass-panel">
                    {songs.map(s => <SongRow key={s.id} s={s}/>)}
                </div>)}
        </div>);
};
export default Library;
