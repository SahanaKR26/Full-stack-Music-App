import { useState, useEffect } from 'react';
import { fetchWithAuth, API_URL } from '../services/api';
import { Plus, Pencil, Trash2, Mic2 } from 'lucide-react';
import './AdminArtists.css';
const AdminArtists = () => {
    const [artists, setArtists] = useState([]);
    const [form, setForm] = useState({ name: '', bio: '', image: null });
    const [editId, setEditId] = useState(null);
    const [msg, setMsg] = useState(null);
    const [loading, setLoading] = useState(false);
    const load = async () => {
        const res = await fetchWithAuth('/api/artists');
        if (res.ok)
            setArtists(await res.json());
    };
    useEffect(() => { load(); }, []);
    const notify = (text) => { setMsg(text); setTimeout(() => setMsg(null), 3000); };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const fd = new FormData();
        fd.append('name', form.name);
        fd.append('bio', form.bio);
        if (form.image)
            fd.append('image', form.image);
        const url = editId ? `/api/artists/${editId}` : '/api/artists';
        const method = editId ? 'PUT' : 'POST';
        const res = await fetchWithAuth(url, { method, body: fd });
        if (res.ok) {
            notify(editId ? 'Artist updated!' : 'Artist added!');
            setForm({ name: '', bio: '', image: null });
            setEditId(null);
            load();
        }
        setLoading(false);
    };
    const handleEdit = (a) => {
        setEditId(a.id);
        setForm({ name: a.name, bio: a.bio, image: null });
    };
    const handleDelete = async (id) => {
        if (!confirm('Delete this artist?'))
            return;
        const res = await fetchWithAuth(`/api/artists/${id}`, { method: 'DELETE' });
        if (res.ok) {
            notify('Artist deleted.');
            load();
        }
    };
    return (<div className="admin-container animate-enter">
            <header className="admin-page-header">
                <h1>Artist Management</h1>
                <p>Add, edit and remove artists</p>
            </header>

            {msg && <div className="admin-success">{msg}</div>}

            <div className="admin-split-layout">
                {/* Form */}
                <div className="glass-panel admin-form-card">
                    <h3><Plus size={18}/> {editId ? 'Edit Artist' : 'Add New Artist'}</h3>
                    <form onSubmit={handleSubmit} className="artist-form">
                        <div className="form-group">
                            <label>Artist Name *</label>
                            <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Artist name"/>
                        </div>
                        <div className="form-group">
                            <label>Bio</label>
                            <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Short biography..." rows={4}/>
                        </div>
                        <div className="form-group">
                            <label>Artist Image</label>
                            <input type="file" accept="image/*" onChange={e => setForm(p => ({ ...p, image: e.target.files?.[0] ?? null }))}/>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button type="submit" className="primary-btn" disabled={loading}>
                                {loading ? 'Saving...' : editId ? 'Update Artist' : 'Add Artist'}
                            </button>
                            {editId && (<button type="button" className="cancel-btn" onClick={() => { setEditId(null); setForm({ name: '', bio: '', image: null }); }}>
                                    Cancel
                                </button>)}
                        </div>
                    </form>
                </div>

                {/* List */}
                <div className="artists-list-admin">
                    {artists.length === 0 ? (<div className="chart-empty glass-panel">No artists yet. Add one!</div>) : artists.map(a => (<div key={a.id} className="artist-list-item glass-panel">
                            {a.imagePath ? (<img src={a.imagePath.startsWith('http') ? a.imagePath : `${API_URL}${a.imagePath}`} alt={a.name} className="artist-list-thumb"/>) : (<div className="artist-list-thumb-placeholder"><Mic2 size={22}/></div>)}
                            <div className="artist-list-info">
                                <div className="artist-list-name">{a.name}</div>
                                {a.bio && <div className="artist-list-bio">{a.bio}</div>}
                            </div>
                            <div className="artist-list-actions">
                                <button className="icon-btn" onClick={() => handleEdit(a)}><Pencil size={16}/></button>
                                <button className="icon-btn danger" onClick={() => handleDelete(a.id)}><Trash2 size={16}/></button>
                            </div>
                        </div>))}
                </div>
            </div>
        </div>);
};
export default AdminArtists;
