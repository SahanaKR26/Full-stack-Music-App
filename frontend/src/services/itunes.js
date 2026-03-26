export const searchItunesTracks = async (query, limit = 20) => {
    if (!query || !query.trim()) return [];
    try {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=${limit}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('iTunes API failed');
        const data = await res.json();
        
        return data.results
            .filter(item => item.previewUrl) // only tracks with playable preview
            .map(item => ({
                id: 'itunes_' + item.trackId,
                title: item.trackName || '',
                artist: item.artistName || 'Unknown',
                album: item.collectionName || '',
                filePath: item.previewUrl,
                albumArtPath: item.artworkUrl100 ? item.artworkUrl100.replace('100x100', '300x300') : '',
                duration: (item.trackTimeMillis || 0) / 1000,
            }));
    } catch (err) {
        console.error("iTunes fetch error", err);
        return [];
    }
};

export const getItunesTopTracks = async (limit = 8) => {
    // iTunes doesn't have a raw search for "top", so we simulate with a popular keyword or simply fetch a list.
    // "hits" usually brings back generally popular music.
    return await searchItunesTracks('hits', limit);
};
