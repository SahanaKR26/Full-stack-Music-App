import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { API_URL, fetchWithAuth } from '../services/api';

export interface Song {
    id: number;
    title: string;
    artist: string;
    album: string;
    genre?: string;
    filePath: string;
    albumArtPath: string;
    duration: number;
    playCount?: number;
}

type RepeatMode = 'off' | 'one' | 'all';

interface PlayerContextType {
    currentSong: Song | null;
    isPlaying: boolean;
    playSong: (song: Song, playlist?: Song[]) => void;
    togglePlayPause: () => void;
    nextSong: () => void;
    prevSong: () => void;
    queue: Song[];
    setQueue: (songs: Song[]) => void;
    volume: number;
    setVolume: (value: number) => void;
    currentTime: number;
    duration: number;
    seek: (time: number) => void;
    audioRef: React.RefObject<HTMLAudioElement | null>;
    // New
    isShuffle: boolean;
    toggleShuffle: () => void;
    repeatMode: RepeatMode;
    cycleRepeat: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [queue, setQueue] = useState<Song[]>([]);
    const [originalQueue, setOriginalQueue] = useState<Song[]>([]);
    const [isShuffle, setIsShuffle] = useState(false);
    const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
    const [volume, setVolume] = useState(() => {
        const saved = localStorage.getItem('player_volume');
        return saved ? parseFloat(saved) : 1.0;
    });
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume;
        localStorage.setItem('player_volume', volume.toString());
    }, [volume]);

    const nextSong = useCallback(() => {
        if (!currentSong) return;
        if (repeatMode === 'one' && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
            return;
        }
        if (queue.length === 0) return;
        const idx = queue.findIndex(s => s.id === currentSong.id);
        if (idx !== -1 && idx < queue.length - 1) {
            playSong(queue[idx + 1]);
        } else if (repeatMode === 'all') {
            playSong(queue[0]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queue, currentSong, repeatMode]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const handleEnded = () => nextSong();
        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnded);
        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [nextSong]);

    const playSong = (song: Song, newQueue?: Song[]) => {
        setCurrentSong(song);
        if (newQueue) {
            setOriginalQueue(newQueue);
            if (isShuffle) {
                const shuffled = [...newQueue].sort(() => Math.random() - 0.5);
                setQueue(shuffled);
            } else {
                setQueue(newQueue);
            }
        }
        setIsPlaying(true);
        // Track play in backend (fire and forget)
        if (song.id) {
            fetchWithAuth(`/api/songs/${song.id}/play`, { method: 'POST' }).catch(() => { });
        }
        setTimeout(() => {
            if (audioRef.current) {
                audioRef.current.play().catch(e => console.error("Playback failed:", e));
            }
        }, 50);
    };

    const togglePlayPause = () => {
        if (!currentSong || !audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().catch(e => console.error(e));
            setIsPlaying(true);
        }
    };

    const prevSong = () => {
        if (queue.length === 0 || !currentSong) return;
        const idx = queue.findIndex(s => s.id === currentSong.id);
        if (currentTime > 3 && audioRef.current) {
            audioRef.current.currentTime = 0;
        } else if (idx > 0) {
            playSong(queue[idx - 1]);
        } else if (repeatMode === 'all') {
            playSong(queue[queue.length - 1]);
        }
    };

    const seek = (time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const toggleShuffle = () => {
        if (!isShuffle) {
            const shuffled = [...queue].sort(() => Math.random() - 0.5);
            setQueue(shuffled);
        } else {
            setQueue(originalQueue);
        }
        setIsShuffle(prev => !prev);
    };

    const cycleRepeat = () => {
        setRepeatMode(prev => prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off');
    };

    const getAudioSrc = () => {
        if (!currentSong) return undefined;
        if (currentSong.filePath.startsWith('http://') || currentSong.filePath.startsWith('https://')) {
            return currentSong.filePath;
        }
        return `${API_URL}${currentSong.filePath}`;
    };

    return (
        <PlayerContext.Provider value={{
            currentSong, isPlaying, playSong, togglePlayPause,
            nextSong, prevSong, queue, setQueue,
            volume, setVolume, currentTime, duration, seek, audioRef,
            isShuffle, toggleShuffle, repeatMode, cycleRepeat
        }}>
            {children}
            <audio ref={audioRef} src={getAudioSrc()} />
        </PlayerContext.Provider>
    );
};

export const usePlayer = () => {
    const context = useContext(PlayerContext);
    if (!context) throw new Error("usePlayer must be used within PlayerProvider");
    return context;
};
