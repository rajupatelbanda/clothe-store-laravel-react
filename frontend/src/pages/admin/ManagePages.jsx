import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const ManagePages = () => {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({ title: '', content: '', status: true });

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        setLoading(true);
        try {
            // Using admin=1 to get all pages including drafts
            const response = await api.get('/admin/pages?admin=1');
            setPages(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Pages Load Error:", error);
            setPages([]);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const loadToast = toast.loading('Syncing page content...');
        try {
            if (editingId) {
                await api.post(`/admin/pages/${editingId}?_method=PUT`, formData);
                toast.success('Page updated!', { id: loadToast });
            } else {
                await api.post('/admin/pages', formData);
                toast.success('Page created!', { id: loadToast });
            }
            resetForm(); fetchPages();
        } catch (error) { toast.error('Action failed', { id: loadToast }); }
    };

    const resetForm = () => {
        setFormData({ title: '', content: '', status: true });
        setEditingId(null);
    };

    const handleEdit = (p) => {
        setEditingId(p.id);
        setFormData({ title: p.title, content: p.content, status: !!p.status });
        window.scrollTo(0, 0);
    };

    return (
        <AdminLayout title="Narrative Content Control">
            <div className="card shadow-sm border-0 rounded-5 p-5 mb-5 bg-white border-bottom border-primary border-4 border-opacity-10">
                <h5 className="fw-black mb-4">{editingId ? 'Refine Page Narrative' : 'Establish New Page'}</h5>
                <form onSubmit={handleSubmit}>
                    <div className="row g-4">
                        <div className="col-md-12">
                            <label className="form-label fw-bold small text-muted">PAGE IDENTITY</label>
                            <input type="text" className="form-control rounded-pill p-3 border-0 bg-light fw-bold shadow-none" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                        </div>
                        <div className="col-md-12">
                            <label className="form-label fw-bold small text-muted">RICH TEXT / HTML COMPOSITION</label>
                            <textarea className="form-control rounded-4 p-4 border-0 bg-light fw-bold shadow-none" rows="12" value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} required placeholder="Enter HTML content..."></textarea>
                        </div>
                        <div className="col-md-12">
                            <div className="form-check form-switch"><input className="form-check-input shadow-none" type="checkbox" checked={formData.status} onChange={(e) => setFormData({...formData, status: e.target.checked})} /><label className="form-check-label ms-2 fw-black text-primary">PUBLISH FOR PUBLIC ACCESS</label></div>
                        </div>
                    </div>
                    <div className="mt-5 d-flex gap-3">
                        <button type="submit" className="btn btn-primary rounded-pill px-5 fw-black shadow-lg">SYNC NARRATIVE</button>
                        {editingId && <button type="button" className="btn btn-light rounded-pill px-5 fw-bold" onClick={resetForm}>DISCARD</button>}
                    </div>
                </form>
            </div>

            <div className="card shadow-2xl border-0 rounded-5 p-5 bg-white border border-light">
                <div className="table-responsive">
                    <table className="table align-middle">
                        <thead className="text-muted border-bottom text-uppercase small fw-black">
                            <tr><th>TITLE</th><th>PUBLIC URL</th><th>VISIBILITY</th><th className="text-end">ACTIONS</th></tr>
                        </thead>
                        <tbody>
                            {(pages || []).length > 0 ? pages.map(p => (
                                <tr key={p.id} className="border-bottom">
                                    <td className="py-4 fw-black text-dark fs-5">{p.title}</td>
                                    <td className="small text-muted fw-bold">/page/{p.slug}</td>
                                    <td><span className={`badge rounded-pill px-3 py-2 fw-black ${p.status ? 'bg-success bg-opacity-10 text-success border border-success' : 'bg-danger bg-opacity-10 text-danger border border-danger'}`}>{p.status ? 'LIVE' : 'DRAFT'}</span></td>
                                    <td className="text-end">
                                        <button className="btn btn-light rounded-circle p-2 me-2 shadow-sm text-primary" onClick={() => handleEdit(p)}><i className="bi bi-pencil-square fs-5"></i></button>
                                        <button className="btn btn-light rounded-circle p-2 shadow-sm text-danger" onClick={async () => { if(window.confirm('Wipe page?')) { await api.delete(`/admin/pages/${p.id}`); fetchPages(); } }}><i className="bi bi-trash3-fill fs-5"></i></button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4" className="text-center py-5 fw-bold text-muted opacity-50">NO PAGES FOUND</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ManagePages;
