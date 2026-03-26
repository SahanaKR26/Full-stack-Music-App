import { useEffect, useState } from 'react';
import { fetchWithAuth, API_URL } from '../services/api';
import { getItunesTopTracks, searchItunesTracks } from '../services/itunes';
import { usePlayer } from '../context/PlayerContext';
import { Play } from 'lucide-react';
import './Home.css';
const Home = () => {
    const [songs, setSongs] = useState([]);
    const [spotifyTracks, setSpotifyTracks] = useState([]);
    const [topArtists, setTopArtists] = useState([]);
    const [loading, setLoading] = useState(true);
    const { playSong } = usePlayer();
    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetchWithAuth('/api/songs');
                if (res.ok) setSongs(await res.json());
            } catch (err) {
                console.error("Failed to load songs", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);
    useEffect(() => {
        getItunesTopTracks(8).then(setSpotifyTracks).catch(() => setSpotifyTracks([]));
        searchItunesTracks('hits', 30).then(tracks => {
            const artistsMap = new Map();
            tracks.forEach(t => {
                const artistName = t.artist.split(',')[0].trim();
                // Filter out 'Unknown' and prevent duplicates
                if (artistName !== 'Unknown' && t.albumArtPath && !artistsMap.has(artistName)) {
                    artistsMap.set(artistName, t.albumArtPath);
                }
            });
            const unique = Array.from(artistsMap, ([name, img]) => ({ name, img })).slice(0, 6);
            if (unique.length > 0) setTopArtists(unique);
        });
    }, []);
    const heroSong = songs[0];
    const topCharts = songs.slice(0, 4);
    const getArtUrl = (s) => (s.albumArtPath && s.albumArtPath.startsWith('http') ? s.albumArtPath : s.albumArtPath ? `${API_URL}${s.albumArtPath}` : null);
    return (<div className="p-8 pt-4 space-y-10 animate-enter">
            {/* Hero Section */}
            <section className="relative h-64 rounded-xl overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-background-dark via-background-dark/40 to-transparent z-10"></div>
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDuQ_S_ilRcEj_xOAoYCcBxjt6Co7zAhqeWH3WeVlhj9FSv0_DRh4sMIQ48uQAnqMuNOtaTSw9XWx2Vso65vhUAhKOzVC5ntkbohrFv9hcMBx1pDERxtGpB7-xwxT9q-KNhiguAZgfcOwSBm4Cjn_-4Ebhzr-f0F2SxqCcSp7z2jCUXBc8zvxVB3aZXVDmqfsuqzSFrtyxNEV8-dL7xVGPgWTOmPY6o1e27LoxJ44OT-SpjKumX7Be9fDXR7auDLSx0naYmj_uCz3M")' }}></div>
                <div className="relative z-20 h-full flex flex-col justify-center p-8 max-w-lg">
                    <span className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-2">New Release</span>
                    <h1 className="text-4xl font-bold text-white mb-2 leading-tight">In My Feelings</h1>
                    <p className="text-slate-300 font-medium mb-6">Camila Cabello <span className="mx-2">•</span> 63 Million Plays</p>
                    <div className="flex items-center gap-4">
                        <button className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-3 rounded-xl transition-all flex items-center gap-2" onClick={() => heroSong && playSong(heroSong, songs)}>
                            <Play size={20} fill="currentColor"/> Listen Now
                        </button>
                    </div>
                </div>
            </section>

            {/* Top Artists (Static based on design for now) */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-100">Top Artists</h3>
                    <button className="text-xs font-bold text-primary uppercase tracking-widest hover:underline">View All</button>
                </div>
                <div className="grid grid-cols-6 gap-6">
                    {(topArtists.length > 0 ? topArtists : [
                        { name: "Travis Scott", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCkOV8VH5JgZUpv03ZdkEbtcsJabYY5Y-SaDZYTGbeGM6NzoIhgi9hA0qiJIHMDBN5Co_rJJcwk4cRGVY8PUREsA0lmb5vyh1fLIYltnrXsRggfqluPt4I3I9bgwb0P5Gp1IJxC4gPb16o4cl_JjxjCE1fgqqdkeDPd5Z58sHfq9cSzCKRhw21_-_A5U-LC2ItQO4GYfO1mETS6XZphcijwJ9rcIFdR9sMkUB9qEMS7mfl3_5f9op060FUHRZla3hVr5A4ieW6C5fI" },
                        { name: "Billie Eilish", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDG72yQ4405jjdZywtWRGmN2bqZEeayc6WBtEDNoh9EWeldABRUPBH3JSeCB2PEmTjfbyDEF4x8w9CBSrz6VQNhmtX7161ucw1r27Rh3ktc6FLhUQ6RkDV9mfXcUcm_dEHSj8jJhF2zq435J1zJCBtt3NXy2X3ecEkAFzramrqECedYP_sm0u8MFJvAHzbem3LrpOPhNhvjIyrhkBRf7gYcd0QThhodiTt3RFsb8JY_QGvZbp4r4SuA8mXNWcXYzpcQOciRKPClu-4" },
                        { name: "The Kid LAROI", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuADjOvUEkBY5uIlhRJeVCkReUPpecMNcI72bZZNwQmBizy2Mw1meOIjymC8w2h1BR7k6S-iMPezCwAU1Yq8jr9DkuhpVzLCcT8chJUtzagzCbrUEG7vH0THxNZjKSdU1gnNlxv0A1Og6aGXkQx78GsTn5nRcEoCv8XVr6sLhYueOftxQEVj94x8Uq6HJp97ZTGBC7kZnS2OQ5lsEia8ptlmqKKVxZ9Y2hUXv3fTsAbrPGWZm6so1K5d9axue-qloGUGUPBzGZs5or0" },
                        { name: "Kanye West", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAUl1uZXs1IlUDPVbc14G9mq-Ea0AEvxrof0LLqAiuMePQOwNcIElkK1mGcNUJG8VEsyVqc25GBuSi5MYKcCMmtgfmjLnzb1oOQom7aLuDJ44gzldZRp5gKQzywE4BLvcsafTWh5EamtTl-MNzJetzPG7EvSTnM_VIT9eWXwYAMswNdrbIBeXzCOjgrjCElFXaWOAhc6AXx3dJPmmftSsApNp2PJPqJ0UfRtJ_ZJq9US4GwpUOm4nszassqW0kr_6OAzWOdwakD6Kk" },
                        { name: "Nicki Minaj", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB9-xQ3C9iSKJRUHnibYda7xYkI4K1IINUCom0_RjzJr3Fh2D4q1e_d-G3LZqsuZWppgGim3aimHDlZXLBJ070iZAoCjwZHtdZZuiP6F0Btmq9cAGqq-tC4WRT5S2G9YDOMQOdE5fZCrZX5G4IRu5Qfn9kSZDaTz0tr4g0x-BddsxOaRBQyYJofpDtX3S98joOjKrCqr20NYqsKElbbw2YiHSRhrnEHQVxdnERP_04mMiuoYh35eQ45RKvmUWmjcqjHw-MQGsqTYPI" },
                        { name: "The Weeknd", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiJCQ0FpJIhqcCzAVU-XFH_1z0tMwIjSh8fgeLuWX3SnPOKjzP9cZGgRSgCUDEIoBveB0OWWSTE0jqvsY8LrPjf7hqH61y3_EoxgpVaYV6_hPBCwh0OFk9i_VDYbLklaNCHYC0PQ9w_BRMJbBKz8p_Vde9sGFJUSqChHbd-Olckqq92Q2RZckOWwJeRMXcpsqms_pUzTO13tQm6XRQR9Su-BJLe6KQgvDk1a_LKxZeYsxxg9Jia5n4iBSsLFvgWhB3ceEtS57b0oQ" }
                    ]).map((artist, idx) => (<div key={idx} className="flex flex-col items-center gap-3">
                            <div className="size-32 rounded-full bg-cover bg-center ring-4 ring-transparent hover:ring-primary/40 transition-all cursor-pointer shadow-lg" style={{ backgroundImage: `url("${artist.img}")` }}></div>
                            <p className="text-sm font-semibold text-slate-200">{artist.name}</p>
                        </div>))}
                </div>
            </section>

            {/* Genres Grid */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-100">Popular Genres</h3>
                </div>
                <div className="grid grid-cols-6 gap-4">
                    <div className="h-24 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-800 p-4 relative overflow-hidden cursor-pointer group shadow-lg">
                        <span className="text-sm font-bold text-white relative z-10">Dance Beat</span>
                    </div>
                    <div className="h-24 rounded-xl bg-gradient-to-br from-pink-500 to-rose-700 p-4 relative overflow-hidden cursor-pointer group shadow-lg">
                        <span className="text-sm font-bold text-white relative z-10">Electro Pop</span>
                    </div>
                    <div className="h-24 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-800 p-4 relative overflow-hidden cursor-pointer group shadow-lg">
                        <span className="text-sm font-bold text-white relative z-10">Alternative Indie</span>
                    </div>
                    <div className="h-24 rounded-xl bg-gradient-to-br from-orange-500 to-red-700 p-4 relative overflow-hidden cursor-pointer group shadow-lg">
                        <span className="text-sm font-bold text-white relative z-10">Hip Hop</span>
                    </div>
                    <div className="h-24 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-700 p-4 relative overflow-hidden cursor-pointer group shadow-lg">
                        <span className="text-sm font-bold text-white relative z-10">Classical</span>
                    </div>
                    <div className="h-24 rounded-xl bg-gradient-to-br from-slate-600 to-slate-900 p-4 relative overflow-hidden cursor-pointer group shadow-lg">
                        <span className="text-sm font-bold text-white relative z-10">Rap</span>
                    </div>
                </div>
            </section>

            {/* Trending Online Tracks (30s previews) */}
            {spotifyTracks.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-100">Trending Online Tracks</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {spotifyTracks.slice(0, 8).map((song) => (
                            <div
                                key={song.id}
                                className="bg-card-dark/50 rounded-xl p-3 border border-primary/5 overflow-hidden cursor-pointer hover:bg-primary/10 transition-colors group"
                                onClick={() => playSong(song, spotifyTracks)}
                            >
                                <div className="aspect-square rounded-lg bg-white/10 mb-2 overflow-hidden relative">
                                    {getArtUrl(song) ? (
                                        <img src={getArtUrl(song)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform"/>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl">🎵</div>
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Play size={32} fill="white" className="text-white"/>
                                    </div>
                                </div>
                                <p className="text-sm font-semibold text-slate-100 truncate">{song.title}</p>
                                <p className="text-xs text-slate-400 truncate">{song.artist}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Top Charts (your uploads) */}
            <section className="pb-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-100">Top Charts</h3>
                </div>
                {loading ? (<div className="text-center text-slate-500 py-8">Loading...</div>) : topCharts.length > 0 ? (<div className="bg-card-dark/50 rounded-xl border border-primary/5 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-primary/5">
                                <tr className="text-[10px] text-slate-500 uppercase font-bold tracking-widest border-b border-primary/5">
                                    <th className="px-6 py-4"># Rank</th>
                                    <th className="px-6 py-4">Song</th>
                                    <th className="px-6 py-4">Artist</th>
                                    <th className="px-6 py-4 text-right pr-12">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/5">
                                {topCharts.map((song, idx) => (<tr key={song.id} className="group hover:bg-primary/5 transition-colors cursor-pointer" onClick={() => playSong(song, songs)}>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-500 group-hover:text-primary">
                                            {(idx + 1).toString().padStart(2, '0')}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-slate-100 flex items-center gap-3">
                                            {song.albumArtPath ? (<img src={`${API_URL}${song.albumArtPath}`} alt="art" className="size-10 rounded-md object-cover"/>) : (<div className="size-10 rounded-md bg-white/10 flex items-center justify-center">🎵</div>)}
                                            {song.title}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400">{song.artist}</td>
                                        <td className="px-6 py-4 text-right pr-12 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Play size={20} fill="currentColor" className="inline-block"/>
                                        </td>
                                    </tr>))}
                            </tbody>
                        </table>
                    </div>) : (<div className="text-center text-slate-500 py-8 border border-primary/5 rounded-xl border-dashed">
                        No songs uploaded yet.
                    </div>)}
            </section>
        </div>);
};
export default Home;
