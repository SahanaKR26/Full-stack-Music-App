import { useState, useEffect } from 'react';
import { fetchWithAuth, API_URL } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import type { Song } from '../context/PlayerContext';
import { Search as SearchIcon, Play, Globe, HardDrive } from 'lucide-react';
import './Search.css';

const Search = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Song[]>([]);
    const [onlineResults, setOnlineResults] = useState<Song[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchType, setSearchType] = useState<'local' | 'online'>('online');
    const { playSong } = usePlayer();

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.trim()) {
                if (searchType === 'local') {
                    searchLocalSongs(query);
                } else {
                    searchOnlineSongs(query);
                }
            } else {
                setResults([]);
                setOnlineResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    // Effect to trigger search when searchType changes
    useEffect(() => {
        if (query.trim()) {
            if (searchType === 'local') {
                searchLocalSongs(query);
            } else {
                searchOnlineSongs(query);
            }
        }
    }, [searchType]);

    const searchLocalSongs = async (q: string) => {
        setLoading(true);
        try {
            const res = await fetchWithAuth(`/api/songs/search?query=${encodeURIComponent(q)}`);
            if (res.ok) {
                const data = await res.json();
                setResults(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const searchOnlineSongs = async (q: string) => {
        setLoading(true);
        try {
            // Using Jamendo API for free open source music
            const clientId = 'b5b2cb20'; // Public client ID for testing
            const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=jsonpretty&limit=15&search=${encodeURIComponent(q)}`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                if (data.results) {
                    const mappedSongs: Song[] = data.results.map((track: any) => ({
                        id: track.id, // Keeping string IDs to avoid collision with our db, we'll cast to any for PlayerContext
                        title: track.name,
                        artist: track.artist_name,
                        album: track.album_name,
                        filePath: track.audio, // Audio stream URL
                        albumArtPath: track.image, // Album art URL
                        duration: track.duration,
                    }));
                    setOnlineResults(mappedSongs);
                }
            }
        } catch (err) {
            console.error("Online search failed", err);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (song: Song, type: 'local' | 'online') => {
        if (!song.albumArtPath) return null;
        if (type === 'local') return `${API_URL}${song.albumArtPath}`;
        return song.albumArtPath; // Online URLs are absolute
    };

    const getPlayUrl = (song: Song, type: 'local' | 'online') => {
        if (type === 'local') return `${API_URL}${song.filePath}`;
        return song.filePath; // Online stream URLs are absolute
    };

    const activeResults = searchType === 'local' ? results : onlineResults;

    return (
        <div className="search-container animate-enter">
            <header className="page-header search-header">
                <h1 className="gradient-text">Search</h1>
                <div className="search-input-wrapper">
                    <SearchIcon size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search for songs, artists, or albums..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        autoFocus
                    />
                </div>
                <div className="search-toggle">
                    <button
                        className={`toggle-btn ${searchType === 'local' ? 'active' : ''}`}
                        onClick={() => setSearchType('local')}
                    >
                        <HardDrive size={18} />
                        Local Library
                    </button>
                    <button
                        className={`toggle-btn ${searchType === 'online' ? 'active' : ''}`}
                        onClick={() => setSearchType('online')}
                    >
                        <Globe size={18} />
                        Online Search
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="search-status">Searching...</div>
            ) : (
                <div className="search-results">
                    {query && activeResults.length === 0 && (
                        <div className="search-status">No results found for "{query}"</div>
                    )}

                    <div className="songs-list">
                        {activeResults.map((song) => (
                            <div key={song.id} className="search-song-row" onClick={() => playSong({ ...song, filePath: getPlayUrl(song, searchType) || "" }, activeResults.map(s => ({ ...s, filePath: getPlayUrl(s, searchType) || "" })))}>
                                <div className="search-song-art">
                                    {getImageUrl(song, searchType) ? (
                                        <img src={getImageUrl(song, searchType) as string} alt="art" />
                                    ) : (
                                        <div className="placeholder">🎵</div>
                                    )}
                                    <div className="play-overlay-small"><Play size={16} fill="currentColor" /></div>
                                </div>
                                <div className="search-song-info">
                                    <div className="title">{song.title}</div>
                                    <div className="artist">{song.artist} • {song.album}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Search;
