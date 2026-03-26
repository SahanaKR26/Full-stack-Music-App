/**
 * Spotify Web API integration.
 * Set VITE_SPOTIFY_TOKEN in .env (token expires ~1 hour; get a new one from Spotify dev console).
 * @see https://developer.spotify.com/documentation/web-api/concepts/authorization
 */

const SPOTIFY_BASE = 'https://api.spotify.com/v1';

function getToken() {
    return import.meta.env.VITE_SPOTIFY_TOKEN || '';
}

async function fetchWebApi(endpoint, method = 'GET', body = null) {
    const token = getToken();
    if (!token) return null;
    const res = await fetch(`${SPOTIFY_BASE}/${endpoint}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            ...(body && { 'Content-Type': 'application/json' }),
        },
        method,
        ...(body && { body: JSON.stringify(body) }),
    });
    if (!res.ok) return null;
    return res.json();
}

/** Map Spotify track to app song shape (id, title, artist, album, filePath = preview_url, albumArtPath, duration) */
function mapTrack(track) {
    if (!track || !track.id) return null;
    const previewUrl = track.preview_url || '';
    return {
        id: 'spotify_' + track.id,
        title: track.name || '',
        artist: (track.artists || []).map((a) => a.name).join(', ') || 'Unknown',
        album: (track.album && track.album.name) || '',
        filePath: previewUrl,
        albumArtPath: (track.album && track.album.images && track.album.images[0] && track.album.images[0].url) || '',
        duration: (track.duration_ms || 0) / 1000,
    };
}

/**
 * Get current user's top tracks (requires user-authorized token).
 * @param {number} limit - Max 50
 * @returns {Promise<Array>} Songs in app shape (only tracks with preview_url)
 */
export async function getSpotifyTopTracks(limit = 10) {
    const data = await fetchWebApi(`me/top/tracks?time_range=long_term&limit=${limit}`);
    if (!data || !data.items) return [];
    return data.items.map(mapTrack).filter((s) => s && s.filePath);
}

/**
 * Search Spotify for tracks.
 * @param {string} query - Search query
 * @param {number} limit - Max 50
 * @returns {Promise<Array>} Songs in app shape
 */
export async function searchSpotifyTracks(query, limit = 20) {
    if (!query || !query.trim()) return [];
    const q = encodeURIComponent(query.trim());
    const data = await fetchWebApi(`search?q=${q}&type=track&limit=${limit}`);
    if (!data || !data.tracks || !data.tracks.items) return [];
    return data.tracks.items.map(mapTrack).filter((s) => s);
}

export function isSpotifyConfigured() {
    return !!getToken();
}
