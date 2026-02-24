import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const ManageBanners = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [formData, setFormData] = useState({ page: 'home', title: '', link: '', status: true });
    const [image, setImage] = useState(null);

    const pages = [
        { id: 'home', name: 'Home Carousel' },
        { id: 'shop', name: 'Shop Page' },
        { id: 'cart', name: 'Cart Page' },
        { id: 'checkout', name: 'Checkout Page' },
        { id: 'profile', name: 'User Profile' },
        { id: 'orders', name: 'Order History' },
        { id: 'wishlist', name: 'Wishlist' }
    ];

    useEffect(() => {
        fetchBanners();
    }, [currentPage]);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/admin/banners?admin=1&page_num=${currentPage}`);
            setBanners(response.data.data);
            setTotalPages(response.data.last_page);
        } catch (error) { toast.error("Error fetching banners"); }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('page', formData.page);
        data.append('title', formData.title);
        data.append('link', formData.link);
        data.append('status', formData.status ? 1 : 0);
        if (image) data.append('image', image);

        const loadToast = toast.loading('Syncing Banner...');
        try {
            if (editingId) {
                await api.post(`/admin/banners/${editingId}?_method=PUT`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Banner Refined!', { id: loadToast });
            } else {
                await api.post('/admin/banners', data, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Banner Deployed!', { id: loadToast });
            }
            resetForm(); fetchBanners();
        } catch (error) { toast.error('Action failed', { id: loadToast }); }
    };

    const resetForm = () => {
        setFormData({ page: 'home', title: '', link: '', status: true });
        setImage(null); setEditingId(null);
    };

    const handleEdit = (b) => {
        setEditingId(b.id);
        setFormData({ page: b.page || 'home', title: b.title || '', link: b.link || '', status: !!b.status });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <AdminLayout title="Visual Storytelling">
            <div className="card shadow-sm border-0 rounded-5 p-5 mb-5 bg-white border-bottom border-primary border-4 border-opacity-10">
                <h5 className="fw-black mb-4">{editingId ? 'Refine Visual' : 'Deploy New Banner'}</h5>
                <form onSubmit={handleSubmit}>
                    <div className="row g-4">
                        <div className="col-md-3">
                            <label className="form-label fw-bold small text-muted">TARGET PAGE</label>
                            <select className="form-select rounded-pill p-3 bg-light border-0 fw-bold shadow-none" value={formData.page} onChange={(e) => setFormData({...formData, page: e.target.value})}>
                                {pages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-3"><label className="form-label fw-bold small text-muted">TITLE (OPTIONAL)</label><input type="text" className="form-control rounded-pill p-3 bg-light border-0 fw-bold shadow-none" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} /></div>
                        <div className="col-md-3"><label className="form-label fw-bold small text-muted">DESTINATION URL</label><input type="text" className="form-control rounded-pill p-3 bg-light border-0 fw-bold shadow-none" value={formData.link} onChange={(e) => setFormData({...formData, link: e.target.value})} /></div>
                        <div className="col-md-3"><label className="form-label fw-bold small text-muted">HIGH-RES IMAGE</label><input type="file" className="form-control rounded-pill p-2 bg-light border-0 fw-bold shadow-none" onChange={(e) => setImage(e.target.files[0])} accept="image/*" /></div>
                        <div className="col-md-12"><div className="form-check form-switch"><input className="form-check-input shadow-none" type="checkbox" checked={formData.status} onChange={(e) => setFormData({...formData, status: e.target.checked})} /><label className="form-check-label ms-2 fw-black text-primary">LIVE IN STOREFRONT</label></div></div>
                    </div>
                    <div className="mt-4 d-flex gap-3">
                        <button type="submit" className="btn btn-primary rounded-pill px-5 fw-black shadow-lg">PERSIST BANNER</button>
                        {editingId && <button type="button" className="btn btn-light rounded-pill px-5 fw-bold" onClick={resetForm}>DISCARD</button>}
                    </div>
                </form>
            </div>

            <div className="card shadow-2xl border-0 rounded-5 p-5 bg-white">
                <div className="table-responsive">
                    <table className="table align-middle">
                        <thead className="text-muted border-bottom text-uppercase small fw-black"><tr><th>PREVIEW</th><th>PAGE</th><th>TITLE</th><th>LINK</th><th>STATUS</th><th className="text-end">ACTIONS</th></tr></thead>
                        <tbody>
                            {banners.map(b => (
                                <tr key={b.id} className="border-bottom">
                                    <td className="py-4"><img src={b.image?.startsWith('http') ? b.image : `/storage/${b.image}`} className="rounded-4 shadow-sm border border-light" width="120" style={{height: '60px', objectFit: 'cover'}} /></td>
                                    <td><span className="badge bg-light text-dark fw-bold border text-uppercase">{b.page}</span></td>
                                    <td className="fw-black text-dark">{b.title || 'Untitled'}</td>
                                    <td className="small text-muted fw-bold">{b.link || 'Internal'}</td>
                                    <td><span className={`badge rounded-pill px-3 py-2 fw-black ${b.status ? 'bg-success bg-opacity-10 text-success border border-success' : 'bg-danger bg-opacity-10 text-danger border border-danger'}`}>{b.status ? 'ACTIVE' : 'OFF'}</span></td>
                                    <td className="text-end">
                                        <button className="btn btn-light rounded-circle p-2 me-2 shadow-sm text-primary" onClick={() => handleEdit(b)}><i className="bi bi-pencil-square fs-5"></i></button>
                                        <button className="btn btn-light rounded-circle p-2 shadow-sm text-danger" onClick={async () => { if(window.confirm('Delete?')) { await api.delete(`/admin/banners/${b.id}`); fetchBanners(); } }}><i className="bi bi-trash3-fill fs-5"></i></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-5 gap-2">
                        {[...Array(totalPages)].map((_, i) => (
                            <button key={i} className={`btn rounded-circle fw-black transition-all ${currentPage === i+1 ? 'btn-primary shadow-primary text-white' : 'bg-light text-dark'}`} style={{width: '45px', height: '45px'}} onClick={() => setCurrentPage(i+1)}>{i+1}</button>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default ManageBanners;
