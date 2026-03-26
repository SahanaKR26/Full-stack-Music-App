import { useState, useEffect } from 'react';
import { fetchWithAuth, API_URL } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import type { Song } from '../context/PlayerContext';
import { Library, Plus, Play, Trash2 } from 'lucide-react';
import './Playlists.css';

interface Playlist {
    id: number;
    name: string;
    playlistSongs: { song: Song }[];
}

const Playlists = () => {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
    const { playSong } = usePlayer();

    const fetchPlaylists = async () => {
        try {
            const res = await fetchWithAuth('/api/playlists');
            if (res.ok) {
                const data = await res.json();
                setPlaylists(data);
            } else {
                setError(`Failed to load playlists: ${res.statusText}`);
            }
        } catch (err: any) {
            console.error("Failed to load playlists", err);
            setError(err.message || "Failed to connect to server");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlaylists();
    }, []);

    const handleCreatePlaylist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPlaylistName.trim()) return;

        try {
            const res = await fetchWithAuth('/api/playlists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newPlaylistName })
            });
            if (res.ok) {
                setNewPlaylistName('');
                setIsCreating(false);
                fetchPlaylists();
            }
        } catch (err) {
            console.error("Failed to create playlist", err);
        }
    };

    const handlePlayPlaylist = (playlist: Playlist) => {
        if (playlist.playlistSongs.length === 0) return;
        const songs = playlist.playlistSongs.map(ps => ps.song);
        playSong(songs[0], songs);
    };

    const handleRemoveSong = async (playlistId: number, songId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const res = await fetchWithAuth(`/api/playlists/${playlistId}/songs/${songId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchPlaylists();
                if (selectedPlaylist && selectedPlaylist.id === playlistId) {
                    setSelectedPlaylist(prev => prev ? {
                        ...prev,
                        playlistSongs: prev.playlistSongs.filter(ps => ps.song.id !== songId)
                    } : null);
                }
            }
        } catch (err) {
            console.error("Failed to remove song", err);
        }
    };

    if (loading) return <div className="loading">Loading playlists...</div>;
    if (error) return <div className="empty-message-small">Error: {error}</div>;

    return (
        <div className="playlists-container animate-enter">
            <header className="page-header header-with-actions">
                <h1 className="gradient-text">Your Library</h1>
                <div className="header-actions">
                    {isCreating ? (
                        <form onSubmit={handleCreatePlaylist} className="create-playlist-form">
                            <input
                                type="text"
                                value={newPlaylistName}
                                onChange={e => setNewPlaylistName(e.target.value)}
                                placeholder="Playlist name..."
                                autoFocus
                                required
                            />
                            <button type="submit" className="primary-btn small-btn">Save</button>
                            <button type="button" className="cancel-btn" onClick={() => setIsCreating(false)}>Cancel</button>
                        </form>
                    ) : (
                        <button className="create-btn" onClick={() => setIsCreating(true)}>
                            <Plus size={20} />
                            <span>Create Playlist</span>
                        </button>
                    )}
                </div>
            </header>

            <div className="playlists-layout">
                <div className="playlists-sidebar glass-panel">
                    {playlists.length === 0 ? (
                        <div className="empty-message-small">No playlists yet.</div>
                    ) : (
                        <ul className="playlists-list">
                            {playlists.map(playlist => (
                                <li
                                    key={playlist.id}
                                    className={`playlist-item ${selectedPlaylist?.id === playlist.id ? 'active' : ''}`}
                                    onClick={() => setSelectedPlaylist(playlist)}
                                >
                                    <Library size={18} />
                                    <span className="playlist-name">{playlist.name}</span>
                                    <span className="song-count">{playlist.playlistSongs.length}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="playlist-content glass-panel">
                    {selectedPlaylist ? (
                        <div className="playlist-detail animate-enter">
                            <div className="playlist-header-large">
                                <div className="playlist-art-large">
                                    {selectedPlaylist.playlistSongs.length > 0 && selectedPlaylist.playlistSongs[0].song.albumArtPath ? (
                                        <img src={`${API_URL}${selectedPlaylist.playlistSongs[0].song.albumArtPath}`} alt="cover" />
                                    ) : (
                                        <div className="placeholder-art-large"><Library size={48} /></div>
                                    )}
                                </div>
                                <div className="playlist-info-large">
                                    <h2 className="title-large">{selectedPlaylist.name}</h2>
                                    <p className="subtitle-large">{selectedPlaylist.playlistSongs.length} songs</p>
                                    <button
                                        className="primary-btn play-all-btn"
                                        onClick={() => handlePlayPlaylist(selectedPlaylist)}
                                        disabled={selectedPlaylist.playlistSongs.length === 0}
                                    >
                                        <Play fill="currentColor" size={20} />
                                        <span>Play All</span>
                                    </button>
                                </div>
                            </div>

                            <div className="playlist-songs">
                                {selectedPlaylist.playlistSongs.length === 0 ? (
                                    <div className="empty-message">This playlist is empty. Add songs from the Home or Search page!</div>
                                ) : (
                                    selectedPlaylist.playlistSongs.map((ps, index) => (
                                        <div key={ps.song.id} className="playlist-song-row" onClick={() => playSong(ps.song, selectedPlaylist.playlistSongs.map(p => p.song))}>
                                            <div className="song-number">{index + 1}</div>
                                            <div className="song-info">
                                                <div className="title">{ps.song.title}</div>
                                                <div className="artist">{ps.song.artist}</div>
                                            </div>
                                            <div className="song-actions">
                                                <button
                                                    className="remove-btn"
                                                    title="Remove from playlist"
                                                    onClick={(e) => handleRemoveSong(selectedPlaylist.id, ps.song.id, e)}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="select-prompt">
                            <Library size={48} className="prompt-icon" />
                            <p>Select a playlist to view its contents</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Playlists;
