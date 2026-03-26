import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { API_URL, fetchWithAuth } from '../services/api';
const PlayerContext = createContext(undefined);
export const PlayerProvider = ({ children }) => {
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [queue, setQueue] = useState([]);
    const [originalQueue, setOriginalQueue] = useState([]);
    const [isShuffle, setIsShuffle] = useState(false);
    const [repeatMode, setRepeatMode] = useState('off');
    const [volume, setVolume] = useState(() => {
        const saved = localStorage.getItem('player_volume');
        return saved ? parseFloat(saved) : 1.0;
    });
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef(null);
    useEffect(() => {
        if (audioRef.current)
            audioRef.current.volume = volume;
        localStorage.setItem('player_volume', volume.toString());
    }, [volume]);
    const nextSong = useCallback(() => {
        if (!currentSong)
            return;
        if (repeatMode === 'one' && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
            return;
        }
        if (queue.length === 0)
            return;
        const idx = queue.findIndex(s => s.id === currentSong.id);
        if (idx !== -1 && idx < queue.length - 1) {
            playSong(queue[idx + 1]);
        }
        else if (repeatMode === 'all') {
            playSong(queue[0]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queue, currentSong, repeatMode]);
    const playSong = (song, newQueue) => {
        setCurrentSong(song);
        if (newQueue) {
            setOriginalQueue(newQueue);
            if (isShuffle) {
                const shuffled = [...newQueue].sort(() => Math.random() - 0.5);
                setQueue(shuffled);
            }
            else {
                setQueue(newQueue);
            }
        }
        setIsPlaying(true);
        // Track play in backend only for local (numeric) songs
        if (typeof song.id === 'number') {
            fetchWithAuth(`/api/songs/${song.id}/play`, { method: 'POST' }).catch(() => { });
        }
        // Playback is triggered by the useEffect when currentSong/isPlaying update
    };
    const togglePlayPause = () => {
        if (!currentSong || !audioRef.current)
            return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
        else {
            audioRef.current.play().catch(e => console.error(e));
            setIsPlaying(true);
        }
    };
    const prevSong = () => {
        if (queue.length === 0 || !currentSong)
            return;
        const idx = queue.findIndex(s => s.id === currentSong.id);
        if (currentTime > 3 && audioRef.current) {
            audioRef.current.currentTime = 0;
        }
        else if (idx > 0) {
            playSong(queue[idx - 1]);
        }
        else if (repeatMode === 'all') {
            playSong(queue[queue.length - 1]);
        }
    };
    const seek = (time) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };
    const toggleShuffle = () => {
        if (!isShuffle) {
            const shuffled = [...queue].sort(() => Math.random() - 0.5);
            setQueue(shuffled);
        }
        else {
            setQueue(originalQueue);
        }
        setIsShuffle(prev => !prev);
    };
    const cycleRepeat = () => {
        setRepeatMode(prev => prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off');
    };
    const getAudioSrc = () => {
        if (!currentSong || !currentSong.filePath)
            return undefined;
        const path = currentSong.filePath;
        if (path.startsWith('http://') || path.startsWith('https://'))
            return path;
        return `${API_URL}${path}`;
    };

    // Reset time display when song changes
    useEffect(() => {
        if (currentSong) {
            setCurrentTime(0);
            setDuration(0);
        }
    }, [currentSong?.id]);

    // When song or play state changes: attach to audio element, set volume, and play when ready
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentSong) return;
        audio.volume = volume;
        const onTimeUpdate = () => setCurrentTime(audio.currentTime);
        const onLoadedMetadata = () => setDuration(audio.duration);
        const onCanPlay = () => {
            if (isPlaying) audio.play().catch((e) => console.error("Playback failed:", e));
        };
        const onEnded = () => nextSong();
        const onError = () => console.error("Audio load error");
        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('loadedmetadata', onLoadedMetadata);
        audio.addEventListener('canplay', onCanPlay);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('error', onError);
        if (isPlaying) audio.play().catch(() => {});
        return () => {
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('loadedmetadata', onLoadedMetadata);
            audio.removeEventListener('canplay', onCanPlay);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('error', onError);
        };
    }, [currentSong?.id, currentSong?.filePath, isPlaying, volume, nextSong]);

    return (<PlayerContext.Provider value={{
            currentSong, isPlaying, playSong, togglePlayPause,
            nextSong, prevSong, queue, setQueue,
            volume, setVolume, currentTime, duration, seek, audioRef,
            isShuffle, toggleShuffle, repeatMode, cycleRepeat
        }}>
            {children}
            <audio key={currentSong?.id ?? 'none'} ref={audioRef} src={getAudioSrc()} preload="auto" playsInline/>
        </PlayerContext.Provider>);
};
export const usePlayer = () => {
    const context = useContext(PlayerContext);
    if (!context)
        throw new Error("usePlayer must be used within PlayerProvider");
    return context;
};
