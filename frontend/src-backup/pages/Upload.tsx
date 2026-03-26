import React, { useState } from 'react';
import { fetchWithAuth } from '../services/api';
import './Upload.css';
import { UploadCloud } from 'lucide-react';

const Upload = () => {
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [album, setAlbum] = useState('');
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [artFile, setArtFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!audioFile) {
            setError('Please select an audio file.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('audioFile', audioFile);
        if (artFile) formData.append('artFile', artFile);
        formData.append('title', title);
        formData.append('artist', artist);
        formData.append('album', album);

        try {
            const res = await fetchWithAuth('/api/songs/upload', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error("Upload failed. Please try again.");

            setSuccess("Song uploaded successfully!");
            setTitle(''); setArtist(''); setAlbum('');
            setAudioFile(null); setArtFile(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="upload-container animate-enter">
            <header className="page-header">
                <h1 className="gradient-text">Upload Music</h1>
                <p>Add new tracks to the Streamify library</p>
            </header>

            <div className="upload-card glass-panel">
                {error && <div className="alert-error">{error}</div>}
                {success && <div className="alert-success">{success}</div>}

                <form onSubmit={handleUpload} className="upload-form">
                    <div className="form-grid">
                        <div className="input-group">
                            <label>Song Title</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Leave blank to use filename" />
                        </div>
                        <div className="input-group">
                            <label>Artist</label>
                            <input type="text" value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Unknown Artist" />
                        </div>
                        <div className="input-group">
                            <label>Album</label>
                            <input type="text" value={album} onChange={(e) => setAlbum(e.target.value)} placeholder="Unknown Album" />
                        </div>
                    </div>

                    <div className="file-inputs">
                        <div className="file-upload-box">
                            <UploadCloud size={32} />
                            <span>Select Audio File (MP3, WAV)</span>
                            <input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} required />
                            {audioFile && <span className="file-name">{audioFile.name}</span>}
                        </div>

                        <div className="file-upload-box">
                            <UploadCloud size={32} />
                            <span>Select Album Art (Optional)</span>
                            <input type="file" accept="image/*" onChange={(e) => setArtFile(e.target.files?.[0] || null)} />
                            {artFile && <span className="file-name">{artFile.name}</span>}
                        </div>
                    </div>

                    <button type="submit" className="primary-btn submit-btn" disabled={loading}>
                        {loading ? "Uploading..." : "Upload Track"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Upload;
