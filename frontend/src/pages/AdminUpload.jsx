import React, { useState, useRef } from 'react';
import { fetchWithAuth } from '../services/api';
const AdminUpload = () => {
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [genre, setGenre] = useState('Electronic');
    const [releaseDate, setReleaseDate] = useState('');
    const [lyrics, setLyrics] = useState('');
    const [audioFile, setAudioFile] = useState(null);
    const [albumArt, setAlbumArt] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [message, setMessage] = useState(null);
    const fileInputRef = useRef(null);
    const artInputRef = useRef(null);
    const handleUpload = async (e) => {
        e.preventDefault();
        setMessage(null);
        if (!audioFile) {
            setMessage({ type: 'error', text: 'Audio file is required.' });
            return;
        }
        const formData = new FormData();
        formData.append('title', title);
        formData.append('artist', artist);
        formData.append('album', 'Single'); // required by backend
        formData.append('genre', genre);
        formData.append('releaseDate', releaseDate);
        formData.append('lyrics', lyrics);
        formData.append('audioFile', audioFile);
        if (albumArt) {
            formData.append('artFile', albumArt);
        }
        setIsUploading(true);
        setUploadProgress(20);
        try {
            // Simulated progress for UX
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 10, 90));
            }, 500);
            const res = await fetchWithAuth('/api/songs/upload', {
                method: 'POST',
                body: formData,
            });
            clearInterval(progressInterval);
            if (res.ok) {
                setUploadProgress(100);
                setMessage({ type: 'success', text: 'Track uploaded successfully!' });
                // Form reset
                setTitle('');
                setArtist('');
                setGenre('Electronic');
                setReleaseDate('');
                setLyrics('');
                setAudioFile(null);
                setAlbumArt(null);
                if (fileInputRef.current)
                    fileInputRef.current.value = '';
                if (artInputRef.current)
                    artInputRef.current.value = '';
                setTimeout(() => {
                    setUploadProgress(0);
                    setIsUploading(false);
                    setMessage(null);
                }, 3000);
            }
            else {
                const text = await res.text();
                throw new Error(text || 'Upload failed');
            }
        }
        catch (err) {
            setUploadProgress(0);
            setIsUploading(false);
            setMessage({ type: 'error', text: err.message });
        }
    };
    return (<div className="p-8 max-w-[1200px] mx-auto w-full animate-enter">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Form and Upload */}
            <div className="lg:col-span-2 space-y-8">
                <div>
                    <h1 className="text-slate-900 dark:text-white text-3xl font-black leading-tight tracking-tight">Upload New Music</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-base">Drag and drop your high-fidelity audio files and album artwork below.</p>
                </div>

                {message && (<div className={`p-4 rounded-xl border ${message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                    {message.text}
                </div>)}

                <form onSubmit={handleUpload} className="space-y-8">
                    {/* Drag & Drop Area */}
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-primary/30 bg-white/50 dark:bg-primary/5 px-6 py-14 hover:border-primary transition-colors cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                            <input type="file" ref={fileInputRef} className="hidden" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} />
                            <div className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-primary/20">
                                <span className="material-symbols-outlined text-4xl">cloud_upload</span>
                            </div>
                            <div className="flex max-w-[480px] flex-col items-center gap-2">
                                <p className="text-slate-900 dark:text-white text-lg font-bold text-center">
                                    {audioFile ? audioFile.name : 'Select Music File'}
                                </p>
                                <p className="text-slate-500 dark:text-slate-400 text-sm text-center">Supports MP3, FLAC, and WAV. Max 50MB per file.</p>
                            </div>
                            <button type="button" className="flex min-w-[140px] pointer-events-none items-center justify-center rounded-xl h-12 px-6 bg-primary text-white text-sm font-bold tracking-wide shadow-lg shadow-primary/20">
                                Browse Files
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            <input type="file" ref={artInputRef} className="hidden" accept="image/*" onChange={(e) => setAlbumArt(e.target.files?.[0] || null)} />
                            <button type="button" onClick={() => artInputRef.current?.click()} className="px-4 py-2 border border-slate-200 dark:border-primary/20 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-primary/10 transition-colors">
                                {albumArt ? 'Change Cover Art' : 'Upload Cover Art (Optional)'}
                            </button>
                            {albumArt && <span className="text-sm font-medium text-primary">{albumArt.name}</span>}
                        </div>
                    </div>

                    {/* Track Metadata Form */}
                    <div className="bg-white/80 dark:bg-primary/5 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-primary/10 shadow-xl">
                        <h3 className="text-slate-900 dark:text-white text-xl font-bold mb-6 flex items-center gap-2">
                            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-sm">description</span>
                            </div>
                            Track Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <label className="flex flex-col gap-2 relative">
                                <span className="text-slate-700 dark:text-slate-300 text-sm font-bold">Song Title <span className="text-red-500">*</span></span>
                                <input className="form-input rounded-xl border border-slate-200 dark:border-primary/20 bg-slate-50 dark:bg-background-dark/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent h-12 px-4 transition-all" placeholder="e.g. Midnight City" type="text" required value={title} onChange={e => setTitle(e.target.value)} />
                            </label>
                            <label className="flex flex-col gap-2">
                                <span className="text-slate-700 dark:text-slate-300 text-sm font-bold">Artist Name <span className="text-red-500">*</span></span>
                                <input className="form-input rounded-xl border border-slate-200 dark:border-primary/20 bg-slate-50 dark:bg-background-dark/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent h-12 px-4 transition-all" placeholder="e.g. M83" type="text" required value={artist} onChange={e => setArtist(e.target.value)} />
                            </label>
                            <label className="flex flex-col gap-2">
                                <span className="text-slate-700 dark:text-slate-300 text-sm font-bold">Genre <span className="text-red-500">*</span></span>
                                <select className="form-select rounded-xl border border-slate-200 dark:border-primary/20 bg-slate-50 dark:bg-background-dark/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent h-12 px-4 transition-all" value={genre} onChange={e => setGenre(e.target.value)}>
                                    <option>Electronic</option>
                                    <option>Pop</option>
                                    <option>Hip Hop</option>
                                    <option>Rock</option>
                                    <option>Classical</option>
                                    <option>Jazz</option>
                                </select>
                            </label>
                            <label className="flex flex-col gap-2">
                                <span className="text-slate-700 dark:text-slate-300 text-sm font-bold">Release Date</span>
                                <input className="form-input rounded-xl border border-slate-200 dark:border-primary/20 bg-slate-50 dark:bg-background-dark/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent h-12 px-4 transition-all" type="date" value={releaseDate} onChange={e => setReleaseDate(e.target.value)} />
                            </label>
                            <label className="flex flex-col gap-2 md:col-span-2">
                                <span className="text-slate-700 dark:text-slate-300 text-sm font-bold">Lyrics</span>
                                <textarea className="form-textarea rounded-xl border border-slate-200 dark:border-primary/20 bg-slate-50 dark:bg-background-dark/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent min-h-[120px] p-4 transition-all" placeholder="Paste your lyrics here..." value={lyrics} onChange={e => setLyrics(e.target.value)}></textarea>
                            </label>
                        </div>
                        <div className="mt-8 flex justify-end gap-4">
                            <button type="button" className="px-6 py-3 rounded-xl border border-slate-200 dark:border-primary/20 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-primary/10 transition-colors">Discard</button>
                            <button type="submit" disabled={isUploading} className={`px-8 py-3 rounded-xl bg-primary text-white font-bold transition-all shadow-lg shadow-primary/20 flex items-center gap-2 ${isUploading ? 'opacity-70 cursor-not-allowed' : 'hover:brightness-110 hover:scale-105 active:scale-95'}`}>
                                {isUploading ? (<><span className="material-symbols-outlined animate-spin text-[18px]">sync</span> Uploading...</>) : ('Save Track Details')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Right Column: Upload Progress and History */}
            <div className="space-y-8">
                {/* Active Uploads */}
                {(isUploading || uploadProgress > 0) && (<div className="bg-white/80 dark:bg-primary/5 rounded-2xl border border-slate-200 dark:border-primary/10 overflow-hidden shadow-xl">
                    <div className="p-5 border-b border-slate-200 dark:border-primary/10 flex justify-between items-center bg-slate-50/50 dark:bg-transparent">
                        <h3 className="text-slate-900 dark:text-white font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[20px] animate-spin">sync</span>
                            Active Uploads
                        </h3>
                    </div>
                    <div className="p-5 space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-700 dark:text-slate-200 font-medium truncate w-3/4">{audioFile?.name || 'Uploading...'}</span>
                                <span className="text-primary font-bold">{uploadProgress}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>)}

                {/* Recent History Placeholder */}
                <div className="bg-white/80 dark:bg-primary/5 rounded-2xl border border-slate-200 dark:border-primary/10 overflow-hidden shadow-xl">
                    <div className="p-5 border-b border-slate-200 dark:border-primary/10 flex justify-between items-center bg-slate-50/50 dark:bg-transparent">
                        <h3 className="text-slate-900 dark:text-white font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-emerald-500 text-[20px]">check_circle</span>
                            Recent History
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-primary/10">
                        {[
                            { title: "Starry Nights", time: "2h ago", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA081u0h5kEBgZuXAwtu6Mwy6RKhcDBgsJiAiPAbmWrl6-eU719OBCxN8vd0LSXfUhysMa9C5jRMVX9gqFRzX8NoH5apaQBt14EYO4tBpWeOPuxJnJUiTBE4D0qsuzrVa3fjHYabXpuspO_krpnCD2tvpxRtXtv8VUVgtEptPh0C8mFpuHIHw0YOYTaZn4S4luQJHYc25awwy2ozeuYN1Ie0D6MS8Cq7_PGByHD_AWbbBvAV-hjRDh_xi7JgJrwVyiswzjLaE7j6Xw" },
                            { title: "Ocean Waves", time: "5h ago", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCuGDiIb_7gSY3WKauGma1tIqEuEw7MzufFfpd8H41EO70xEPD3yveUGZzk9QU50RaplqMMMBJzaxLngrgO70wkJtV88d1jqhOqMXgIjNJkZicgTIQzwNVYkPTp2t2yShf3eIP6C11bt5fmUr6IDM-vcIu3qjsWH5a1Re1hm72zpFSzlpUBIWwLxPiVFqTZfc1aIaAPtPPeiYJFpSDGFu2KkOx_hc_Fi3xq2plk-cEKuMylQs2Ou4WgOgyVJfnLRIA5Jd76zoruBkg" }
                        ].map((item, idx) => (<div key={idx} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-primary/5 transition-colors group cursor-pointer">
                            <div className="size-12 rounded-lg bg-slate-200 dark:bg-slate-800 overflow-hidden flex-shrink-0 shadow-md">
                                <img className="h-full w-full object-cover" src={item.img} alt="art" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-slate-900 dark:text-white text-sm font-bold truncate group-hover:text-primary transition-colors">{item.title}</p>
                                <p className="text-slate-500 dark:text-slate-400 text-xs">Uploaded {item.time}</p>
                            </div>
                            <span className="material-symbols-outlined text-slate-400 text-lg group-hover:text-primary transition-colors">more_vert</span>
                        </div>))}
                    </div>
                    <button className="w-full py-4 text-center text-primary text-sm font-bold hover:bg-slate-50 dark:hover:bg-primary/5 transition-colors border-t border-slate-100 dark:border-primary/10">
                        View All Uploads
                    </button>
                </div>

                {/* Storage Info */}
                <div className="bg-primary/10 rounded-2xl p-5 border border-primary/20 shadow-md">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="material-symbols-outlined text-primary text-[20px]">cloud_done</span>
                        <h4 className="text-slate-900 dark:text-white font-bold text-sm">Storage Capacity</h4>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full mb-3 overflow-hidden shadow-inner">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: '65%' }}></div>
                    </div>
                    <p className="text-primary/70 dark:text-primary/50 text-xs font-medium font-mono">13.2 GB of 20 GB used (65%)</p>
                </div>
            </div>
        </div>
    </div>);
};
export default AdminUpload;
