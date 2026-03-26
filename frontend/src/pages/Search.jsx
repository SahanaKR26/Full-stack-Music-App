import { useState, useEffect } from 'react';
import { fetchWithAuth, API_URL } from '../services/api';
import { searchItunesTracks } from '../services/itunes';
import { usePlayer } from '../context/PlayerContext';
import { Search as SearchIcon, Play, HardDrive, Music } from 'lucide-react';
import './Search.css';
const Search = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchType, setSearchType] = useState('library');
    const { playSong } = usePlayer();
    useEffect(() => {
        const t = setTimeout(() => {
            if (!query.trim()) {
                setResults([]);
                return;
            }
            if (searchType === 'library') searchLocalSongs(query);
            else searchOnline(query);
        }, 500);
        return () => clearTimeout(t);
    }, [query, searchType]);
    const searchLocalSongs = async (q) => {
        setLoading(true);
        setResults([]);
        try {
            const res = await fetchWithAuth(`/api/songs/search?query=${encodeURIComponent(q)}`);
            if (res.ok) {
                const data = await res.json();
                setResults(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error("Search failed", err);
        } finally {
            setLoading(false);
        }
    };
    const searchOnline = async (q) => {
        setLoading(true);
        setResults([]);
        try {
            const data = await searchItunesTracks(q, 25);
            setResults(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Online search failed", err);
        } finally {
            setLoading(false);
        }
    };
    const getImageUrl = (song) => {
        if (!song.albumArtPath) return null;
        return song.albumArtPath.startsWith('http') ? song.albumArtPath : `${API_URL}${song.albumArtPath}`;
    };
    const getPlayUrl = (song) =>
        song.filePath && song.filePath.startsWith('http') ? song.filePath : `${API_URL}${song.filePath || ''}`;
    const list = results.map((s) => ({ ...s, filePath: getPlayUrl(s) || s.filePath || '' }));
    return (<div className="search-container animate-enter">
            <header className="page-header search-header">
                <h1 className="gradient-text">Search</h1>
                <div className="search-input-wrapper">
                    <SearchIcon size={20} className="search-icon"/>
                    <input type="text" placeholder={searchType === 'online' ? "Search Online Music (songs, artists)..." : "Search your library (songs, artists, albums)..."} value={query} onChange={e => setQuery(e.target.value)} autoFocus/>
                </div>
                <div className="search-toggle">
                    <button className={`toggle-btn ${searchType === 'library' ? 'active' : ''}`} onClick={() => setSearchType('library')}>
                        <HardDrive size={18}/> Your Library
                    </button>
                    <button className={`toggle-btn ${searchType === 'online' ? 'active' : ''}`} onClick={() => setSearchType('online')}>
                        <Music size={18}/> Online Music
                    </button>
                </div>
            </header>

            {loading ? (<div className="search-status">Searching...</div>) : (<div className="search-results">
                    {query && results.length === 0 && (<div className="search-status">No results found for "{query}"</div>)}
                    <div className="songs-list">
                        {results.map((song) => (<div key={song.id} className="search-song-row" onClick={() => playSong({ ...song, filePath: getPlayUrl(song) || "" }, list)}>
                                <div className="search-song-art">
                                    {getImageUrl(song) ? (<img src={getImageUrl(song)} alt="art"/>) : (<div className="placeholder">🎵</div>)}
                                    <div className="play-overlay-small"><Play size={16} fill="currentColor"/></div>
                                </div>
                                <div className="search-song-info">
                                    <div className="title">{song.title}</div>
                                    <div className="artist">{song.artist} • {song.album}</div>
                                </div>
                            </div>))}
                    </div>
                </div>)}
        </div>);
};
export default Search;
