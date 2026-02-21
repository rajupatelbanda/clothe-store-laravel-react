import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const ManageCoupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        code: '', type: 'percentage', value: '', usage_limit: '',
        valid_from: '', valid_until: '', category_id: '', product_id: '', status: true
    });

    useEffect(() => {
        fetchCoupons();
        fetchMeta();
    }, []);

    const fetchMeta = async () => {
        try {
            const results = await Promise.allSettled([api.get('/categories'), api.get('/products')]);
            const cRes = results[0].status === 'fulfilled' ? results[0].value : { data: [] };
            const pRes = results[1].status === 'fulfilled' ? results[1].value : { data: { data: [] } };
            
            setCategories(cRes.data || []);
            setProducts(pRes.data.data || pRes.data || []);
        } catch (e) {}
    };

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/coupons?admin=1');
            setCoupons(Array.isArray(response.data) ? response.data : (response.data.data || []));
        } catch (error) { 
            console.error("Coupon Fetch Error:", error);
            toast.error("Error fetching coupons"); 
        }
        setLoading(false);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const loadToast = toast.loading('Saving coupon...');
        try {
            if (editingId) {
                // Use POST with _method=PUT for consistency
                await api.post(`/admin/coupons/${editingId}?_method=PUT`, formData);
                toast.success('Coupon updated!', { id: loadToast });
            } else {
                await api.post('/admin/coupons', formData);
                toast.success('Coupon created!', { id: loadToast });
            }
            resetForm(); fetchCoupons();
        } catch (error) { 
            console.error("Coupon Sync Error:", error);
            toast.error(error.response?.data?.message || 'Sync failed', { id: loadToast }); 
        }
    };

    const resetForm = () => {
        setFormData({ code: '', type: 'percentage', value: '', usage_limit: '', valid_from: '', valid_until: '', category_id: '', product_id: '', status: true });
        setEditingId(null);
    };

    const handleEdit = (c) => {
        setEditingId(c.id);
        setFormData({
            code: c.code, type: c.type, value: c.value, usage_limit: c.usage_limit || '',
            valid_from: c.valid_from || '', valid_until: c.valid_until || '',
            category_id: c.category_id || '', product_id: c.product_id || '', status: !!c.status
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <AdminLayout title="Coupon & Promo Control">
            <div className="card shadow-soft border-0 rounded-5 p-5 mb-5 bg-white border-bottom border-primary border-4 border-opacity-10">
                <h5 className="fw-black mb-4">{editingId ? 'Modify Coupon' : 'Create New Promo'}</h5>
                <form onSubmit={handleSubmit}>
                    <div className="row g-4">
                        <div className="col-md-4"><label className="form-label fw-bold small text-muted text-uppercase">Coupon Code</label><input type="text" name="code" className="form-control rounded-pill p-3 border-0 bg-light fw-bold" value={formData.code} onChange={handleInputChange} required placeholder="SAVE20" /></div>
                        <div className="col-md-4"><label className="form-label fw-bold small text-muted text-uppercase">Type</label><select name="type" className="form-select rounded-pill p-3 border-0 bg-light fw-bold" value={formData.type} onChange={handleInputChange}><option value="percentage">Percentage (%)</option><option value="fixed">Fixed Amount (₹)</option></select></div>
                        <div className="col-md-4"><label className="form-label fw-bold small text-muted text-uppercase">Value</label><input type="number" name="value" className="form-control rounded-pill p-3 border-0 bg-light fw-bold" value={formData.value} onChange={handleInputChange} required /></div>
                        
                        <div className="col-md-3"><label className="form-label fw-bold small text-muted text-uppercase">Usage Limit</label><input type="number" name="usage_limit" className="form-control rounded-pill p-3 border-0 bg-light fw-bold" value={formData.usage_limit} onChange={handleInputChange} /></div>
                        <div className="col-md-3"><label className="form-label fw-bold small text-muted text-uppercase">Valid From</label><input type="date" name="valid_from" className="form-control rounded-pill p-3 border-0 bg-light fw-bold" value={formData.valid_from} onChange={handleInputChange} /></div>
                        <div className="col-md-3"><label className="form-label fw-bold small text-muted text-uppercase">Valid Until</label><input type="date" name="valid_until" className="form-control rounded-pill p-3 border-0 bg-light fw-bold" value={formData.valid_until} onChange={handleInputChange} /></div>
                        
                        <div className="col-md-6"><label className="form-label fw-bold small text-muted text-uppercase">Restrict to Category</label><select name="category_id" className="form-select rounded-pill p-3 border-0 bg-light fw-bold" value={formData.category_id} onChange={handleInputChange}><option value="">None (Global)</option>{(categories || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                        <div className="col-md-6"><label className="form-label fw-bold small text-muted text-uppercase">Restrict to Product</label><select name="product_id" className="form-select rounded-pill p-3 border-0 bg-light fw-bold" value={formData.product_id} onChange={handleInputChange}><option value="">None (Global)</option>{(products || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                        
                        <div className="col-md-12"><div className="form-check form-switch"><input className="form-check-input shadow-none" type="checkbox" name="status" checked={formData.status} onChange={handleInputChange} /><label className="form-check-label ms-2 fw-black text-primary">COUPON IS ACTIVE</label></div></div>
                    </div>
                    <div className="mt-5 d-flex gap-3">
                        <button type="submit" className="btn btn-primary rounded-pill px-5 fw-black shadow-lg">PERSIST COUPON</button>
                        {editingId && <button type="button" className="btn btn-light rounded-pill px-5 fw-bold" onClick={resetForm}>DISCARD</button>}
                    </div>
                </form>
            </div>

            <div className="card shadow-2xl border-0 rounded-5 p-5 bg-white border border-light">
                <div className="table-responsive">
                    <table className="table align-middle">
                        <thead className="text-muted border-bottom text-uppercase small fw-black">
                            <tr><th>CODE</th><th>BENEFIT</th><th>VALIDITY</th><th>USAGE</th><th>STATUS</th><th className="text-end">ACTIONS</th></tr>
                        </thead>
                        <tbody>
                            {(coupons || []).length > 0 ? coupons.map(c => (
                                <tr key={c.id} className="border-bottom">
                                    <td className="py-4 fw-black text-primary fs-5">{c.code}</td>
                                    <td><span className="fw-bold">{c.type === 'percentage' ? `${c.value}% OFF` : `₹${c.value} OFF`}</span></td>
                                    <td className="small fw-bold text-muted">{c.valid_from || '∞'} to {c.valid_until || '∞'}</td>
                                    <td><span className="badge bg-light text-dark border px-2 py-1 small fw-bold">{c.used_count} / {c.usage_limit || '∞'}</span></td>
                                    <td><span className={`badge rounded-pill px-3 py-2 fw-black ${c.status ? 'bg-success bg-opacity-10 text-success border border-success' : 'bg-danger bg-opacity-10 text-danger border border-danger'}`}>{c.status ? 'LIVE' : 'OFF'}</span></td>
                                    <td className="text-end">
                                        <button className="btn btn-light rounded-circle p-2 me-2 shadow-sm text-primary" onClick={() => handleEdit(c)}><i className="bi bi-pencil-square fs-5"></i></button>
                                        <button className="btn btn-light rounded-circle p-2 shadow-sm text-danger" onClick={async () => { if(window.confirm('Wipe promo?')) { await api.delete(`/admin/coupons/${c.id}`); fetchCoupons(); } }}><i className="bi bi-trash3-fill fs-5"></i></button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6" className="text-center py-5 fw-bold text-muted">No coupons found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ManageCoupons;
