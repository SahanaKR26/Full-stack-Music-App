import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Shuffle, Repeat, MonitorSpeaker, ListMusic, Mic } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { fetchWithAuth, API_URL } from '../services/api';

const PlayerBar = () => {
    const {
        currentSong, isPlaying, togglePlayPause,
        nextSong, prevSong, volume, setVolume,
        currentTime, duration, seek,
        isShuffle, toggleShuffle, repeatMode, cycleRepeat
    } = usePlayer();

    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const checkFavorite = async () => {
            if (!currentSong) return;
            try {
                const res = await fetchWithAuth('/api/favorites');
                if (res.ok) {
                    const favorites = await res.json();
                    setIsFavorite(favorites.some((f: any) => f.id === currentSong.id));
                }
            } catch (e) {
                console.error("Failed to check favorites", e);
            }
        };
        checkFavorite();
    }, [currentSong]);

    const toggleFavorite = async () => {
        if (!currentSong) return;
        try {
            if (isFavorite) {
                await fetchWithAuth(`/api/favorites/${currentSong.id}`, { method: 'DELETE' });
                setIsFavorite(false);
            } else {
                await fetchWithAuth(`/api/favorites/${currentSong.id}`, { method: 'POST' });
                setIsFavorite(true);
            }
        } catch (e) {
            console.error("Failed to toggle favorite", e);
        }
    };

    if (!currentSong) return null;

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        seek(Number(e.target.value));
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVolume(Number(e.target.value));
    };

    const toggleMute = () => {
        if (volume > 0) {
            setVolume(0);
        } else {
            setVolume(1);
        }
    };

    // Calculate percentage for progress bars
    const progressPercent = duration ? (currentTime / duration) * 100 : 0;
    const volumePercent = volume * 100;

    return (
        <aside className="w-80 bg-background-dark border-l border-primary/10 flex flex-col p-6 overflow-y-auto custom-scrollbar shrink-0">
            <div className="flex-1 flex flex-col gap-6">

                {/* Current Playing Info */}
                <div className="space-y-4">
                    <div className="aspect-square w-full rounded-2xl bg-cover bg-center shadow-2xl shadow-primary/20 relative group overflow-hidden">
                        {currentSong.albumArtPath ? (
                            <img
                                src={currentSong.albumArtPath.startsWith('http') ? currentSong.albumArtPath : `${API_URL}${currentSong.albumArtPath}`}
                                alt="Album Art"
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-card-dark text-6xl shadow-inner">
                                🎵
                            </div>
                        )}
                        <button
                            className={`absolute top-4 right-4 size-10 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm transition-all text-white`}
                            onClick={toggleFavorite}
                        >
                            <Heart size={20} fill={isFavorite ? "#ef4444" : "none"} className={isFavorite ? "text-red-500" : ""} />
                        </button>
                    </div>
                    <div className="text-center">
                        <h4 className="text-xl font-bold text-slate-100 mb-1 truncate">{currentSong.title}</h4>
                        <p className="text-sm font-medium text-slate-400 truncate">{currentSong.artist}</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2 pt-4">
                    <div className="relative h-1 w-full bg-slate-800 rounded-full group cursor-pointer">
                        <div
                            className="absolute h-full bg-primary rounded-full transition-all duration-100"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                        <input
                            type="range"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            min={0}
                            max={duration || 100}
                            value={currentTime}
                            onChange={handleProgressChange}
                        />
                        <div
                            className="absolute h-3 w-3 bg-white border-2 border-primary rounded-full top-1/2 -translate-y-1/2 -ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                            style={{ left: `${progressPercent}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Playback Controls */}
                <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-6">
                        <button
                            className={`text-slate-500 hover:text-primary transition-colors ${isShuffle ? 'text-primary' : ''}`}
                            onClick={toggleShuffle}
                        >
                            <Shuffle size={18} />
                        </button>
                        <button className="text-slate-200 hover:text-slate-100 transition-colors" onClick={prevSong}>
                            <SkipBack size={24} fill="currentColor" />
                        </button>
                        <button
                            className="size-14 bg-primary text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-primary/30"
                            onClick={togglePlayPause}
                        >
                            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                        </button>
                        <button className="text-slate-200 hover:text-slate-100 transition-colors" onClick={nextSong}>
                            <SkipForward size={24} fill="currentColor" />
                        </button>
                        <button
                            className={`text-slate-500 hover:text-primary transition-colors ${repeatMode !== 'off' ? 'text-primary' : ''}`}
                            onClick={cycleRepeat}
                        >
                            <Repeat size={18} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between w-full px-4 pt-4 border-t border-primary/10">
                        <button className="text-slate-500 hover:text-slate-200 flex flex-col items-center gap-1 transition-colors">
                            <Mic size={20} />
                            <span className="text-[9px] font-bold uppercase tracking-widest">Lyrics</span>
                        </button>
                        <button className="text-slate-500 hover:text-slate-200 flex flex-col items-center gap-1 transition-colors">
                            <MonitorSpeaker size={20} />
                            <span className="text-[9px] font-bold uppercase tracking-widest">Devices</span>
                        </button>
                        <button className="text-slate-500 hover:text-slate-200 flex flex-col items-center gap-1 transition-colors">
                            <ListMusic size={20} />
                            <span className="text-[9px] font-bold uppercase tracking-widest">Queue</span>
                        </button>
                    </div>
                </div>

            </div>

            {/* Volume Control */}
            <div
                className="flex items-center gap-3 mt-6 pt-4 border-t border-primary/10"
            >
                <button onClick={toggleMute} className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
                    {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <div className="relative flex-1 h-1 bg-slate-800 rounded-full group">
                    <div
                        className="absolute h-full bg-slate-400 group-hover:bg-primary transition-colors rounded-full pointer-events-none"
                        style={{ width: `${volumePercent}%` }}
                    ></div>
                    <input
                        type="range"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        min={0}
                        max={1}
                        step={0.01}
                        value={volume}
                        onChange={handleVolumeChange}
                    />
                </div>
            </div>
        </aside>
    );
};

export default PlayerBar;
