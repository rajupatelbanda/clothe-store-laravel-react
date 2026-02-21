import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const ManageProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    
    // Filtering/Searching
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [formData, setFormData] = useState({
        name: '', category_id: '', subcategory_id: '', brand_id: '', description: '',
        price: '', discount_price: '', stock: '', video_url: '', is_featured: false, status: true
    });
    const [images, setImages] = useState([]);
    const [video, setVideo] = useState(null);
    const [variations, setVariations] = useState([]);

    // 1. Fetch Metadata ONCE on mount
    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const results = await Promise.allSettled([
                    api.get('/categories'), 
                    api.get('/brands'), 
                    api.get('/admin/subcategories?admin=1')
                ]);
                const cRes = results[0].status === 'fulfilled' ? results[0].value : { data: [] };
                const bRes = results[1].status === 'fulfilled' ? results[1].value : { data: [] };
                const sRes = results[2].status === 'fulfilled' ? results[2].value : { data: [] };

                setCategories(cRes.data || []);
                setBrands(bRes.data || []);
                setSubcategories(sRes.data || []);
            } catch (error) {}
        };
        fetchMeta();
    }, []);

    // 2. Optimized Fetch Products
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/products', {
                params: { admin: 1, page: currentPage, search: search, category: filterCategory }
            });
            if (response.data && response.data.data) {
                setProducts(response.data.data);
                setTotalPages(response.data.last_page);
            } else {
                setProducts([]);
                setTotalPages(1);
            }
        } catch (error) { setProducts([]); }
        setLoading(false);
    }, [currentPage, search, filterCategory]);

    // 3. Debounced Search Effect
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchProducts();
        }, 400);
        return () => clearTimeout(delayDebounceFn);
    }, [search, filterCategory, currentPage, fetchProducts]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const addVariation = () => setVariations([...variations, { color: '', size: '', price: formData.price || 0, stock: 0 }]);
    const removeVariation = (index) => setVariations(variations.filter((_, i) => i !== index));
    const updateVariation = (index, field, value) => {
        const newVars = [...variations];
        newVars[index][field] = value;
        setVariations(newVars);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key] === null ? '' : formData[key]));
        if (images.length > 0) Array.from(images).forEach(img => data.append('images[]', img));
        if (video) data.append('video', video);
        data.append('variations', JSON.stringify(variations));

        const loadToast = toast.loading('Synchronizing Inventory...');
        try {
            if (editingId) {
                await api.post(`/admin/products/${editingId}?_method=PUT`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Inventory Updated!', { id: loadToast });
            } else {
                await api.post('/admin/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Apparel Registered!', { id: loadToast });
            }
            resetForm(); fetchProducts();
        } catch (error) { toast.error(error.response?.data?.message || 'Sync failed', { id: loadToast }); }
    };

    const resetForm = () => {
        setFormData({ name: '', category_id: '', subcategory_id: '', brand_id: '', description: '', price: '', discount_price: '', stock: '', video_url: '', is_featured: false, status: true });
        setImages([]); setVideo(null); setVariations([]); setEditingId(null);
    };

    const handleEdit = (prod) => {
        setEditingId(prod.id);
        setFormData({
            name: prod.name, category_id: prod.category_id, subcategory_id: prod.subcategory_id || '',
            brand_id: prod.brand_id, description: prod.description, price: prod.price,
            discount_price: prod.discount_price || '', stock: prod.stock, 
            is_featured: !!prod.is_featured, status: !!prod.status
        });
        setVariations(prod.variations || []);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const fd = new FormData();
        fd.append('file', file);
        const loadToast = toast.loading('Importing data...');
        try {
            await api.post('/admin/import/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success('Import Successful!', { id: loadToast });
            fetchProducts();
        } catch (error) { toast.error('Import failed', { id: loadToast }); }
    };

    const discountPerc = (parseFloat(formData.price) > 0 && parseFloat(formData.discount_price) > 0) ? 
        Math.round(((parseFloat(formData.price) - parseFloat(formData.discount_price)) / parseFloat(formData.price)) * 100) : 0;

    return (
        <AdminLayout title="Apparel Repository">
            <div className="card shadow-soft border-0 rounded-5 p-5 mb-5 bg-white border-bottom border-primary border-4 border-opacity-10">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-black m-0">{editingId ? 'Modify apparel' : 'New apparel entry'}</h5>
                    <div className="btn btn-outline-success btn-sm rounded-pill px-3 position-relative overflow-hidden fw-black">
                        <i className="bi bi-file-earmark-excel me-2"></i>IMPORT EXCEL
                        <input type="file" className="position-absolute top-0 start-0 opacity-0 w-100 h-100 cursor-pointer" onChange={handleImport} accept=".xlsx,.xls,.csv" />
                    </div>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="row g-4">
                        <div className="col-md-6"><label className="form-label fw-bold small text-muted">TITLE</label><input type="text" name="name" className="form-control rounded-pill p-3 border-0 bg-light fw-bold shadow-none" value={formData.name} onChange={handleInputChange} required /></div>
                        <div className="col-md-3"><label className="form-label fw-bold small text-muted">MASTER CATEGORY</label><select name="category_id" className="form-select rounded-pill p-3 border-0 bg-light fw-bold" value={formData.category_id} onChange={handleInputChange} required><option value="">Select...</option>{(categories || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                        <div className="col-md-3"><label className="form-label fw-bold small text-muted">SUB-TYPE</label><select name="subcategory_id" className="form-select rounded-pill p-3 border-0 bg-light fw-bold" value={formData.subcategory_id} onChange={handleInputChange} disabled={!formData.category_id}><option value="">Select...</option>{(subcategories || []).filter(s => s.category_id && formData.category_id && s.category_id.toString() === formData.category_id.toString()).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                        
                        <div className="col-md-3"><label className="form-label fw-bold small text-muted">BRAND LABEL</label><select name="brand_id" className="form-select rounded-pill p-3 border-0 bg-light fw-bold" value={formData.brand_id} onChange={handleInputChange} required><option value="">Labels...</option>{(brands || []).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
                        <div className="col-md-3"><label className="form-label fw-bold small text-muted">ORIGINAL PRICE (₹)</label><input type="number" name="price" className="form-control rounded-pill p-3 border-0 bg-light fw-bold" value={formData.price} onChange={handleInputChange} required step="0.01" /></div>
                        <div className="col-md-3"><label className="form-label fw-bold small text-muted">OFFER PRICE (₹)</label><input type="number" name="discount_price" className="form-control rounded-pill p-3 border-0 bg-light fw-bold" value={formData.discount_price} onChange={handleInputChange} step="0.01" /></div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold small text-muted">SAVINGS (%)</label>
                            <input type="text" className="form-control rounded-pill p-3 border-0 bg-transparent fw-black text-primary fs-5 shadow-none" value={`${discountPerc}% OFF`} readOnly />
                        </div>

                        <div className="col-md-12"><label className="form-label fw-bold small text-muted">NARRATIVE</label><textarea name="description" className="form-control rounded-4 p-3 border-0 bg-light fw-bold shadow-none" value={formData.description} onChange={handleInputChange} required rows="3"></textarea></div>
                        
                        <div className="col-md-6"><label className="form-label fw-bold small text-muted">PRODUCT IMAGES (MULTIPLE)</label><input type="file" className="form-control rounded-pill p-2 border-0 bg-light fw-bold" multiple onChange={(e) => setImages(e.target.files)} accept="image/*" /></div>
                        <div className="col-md-6"><label className="form-label fw-bold small text-muted">MOTION VIDEO (FILE)</label><input type="file" className="form-control rounded-pill p-2 border-0 bg-light fw-bold" onChange={(e) => setVideo(e.target.files[0])} accept="video/*" /></div>

                        <div className="col-12"><hr className="opacity-10" /><h6 className="fw-black mb-4 uppercase">Product Variations</h6>
                            {(variations || []).map((v, i) => (
                                <div className="row g-2 mb-3 align-items-end" key={i}>
                                    <div className="col-md-3"><label className="small fw-bold opacity-50">COLOR</label><input type="text" className="form-control form-control-sm rounded-pill" value={v.color || ''} onChange={(e)=>updateVariation(i, 'color', e.target.value)} /></div>
                                    <div className="col-md-3"><label className="small fw-bold opacity-50">SIZE</label><input type="text" className="form-control form-control-sm rounded-pill" value={v.size || ''} onChange={(e)=>updateVariation(i, 'size', e.target.value)} /></div>
                                    <div className="col-md-3"><label className="small fw-bold opacity-50">PRICE</label><input type="number" className="form-control form-control-sm rounded-pill" value={v.price || ''} onChange={(e)=>updateVariation(i, 'price', e.target.value)} /></div>
                                    <div className="col-md-2"><label className="small fw-bold opacity-50">STOCK</label><input type="number" className="form-control form-control-sm rounded-pill" value={v.stock || ''} onChange={(e)=>updateVariation(i, 'stock', e.target.value)} /></div>
                                    <div className="col-md-1"><button type="button" className="btn btn-outline-danger btn-sm rounded-circle" onClick={()=>removeVariation(i)}><i className="bi bi-x"></i></button></div>
                                </div>
                            ))}
                            <button type="button" className="btn btn-dark btn-sm rounded-pill px-4 fw-bold mt-2" onClick={addVariation}><i className="bi bi-plus-lg me-2"></i>ADD VARIATION</button>
                        </div>

                        <div className="col-md-6 mt-4">
                            <div className="form-check form-switch">
                                <input className="form-check-input shadow-none" type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleInputChange} />
                                <label className="form-check-label ms-2 fw-black text-primary uppercase">Feature in Gallery</label>
                            </div>
                        </div>
                        <div className="col-md-6 mt-4">
                            <div className="form-check form-switch">
                                <input className="form-check-input shadow-none" type="checkbox" name="status" checked={formData.status} onChange={handleInputChange} />
                                <label className="form-check-label ms-2 fw-black text-success uppercase">Show Product (Active)</label>
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 d-flex gap-3">
                        <button type="submit" className="btn btn-primary rounded-pill px-5 fw-black shadow-lg">PERSIST INVENTORY</button>
                        {editingId && <button type="button" className="btn btn-light rounded-pill px-5 fw-bold" onClick={resetForm}>DISCARD</button>}
                    </div>
                </form>
            </div>

            <div className="card shadow-2xl border-0 rounded-5 p-5 bg-white border border-light">
                <div className="d-flex gap-4 mb-5 align-items-center">
                    <input type="text" className="form-control rounded-pill px-4 py-3 bg-light border-0 shadow-none fw-bold w-50" placeholder="Instant Search..." value={search} onChange={(e) => {setSearch(e.target.value); setCurrentPage(1);}} />
                    <select className="form-select rounded-pill px-4 py-3 bg-light border-0 shadow-none w-auto fw-bold" value={filterCategory} onChange={(e) => {setFilterCategory(e.target.value); setCurrentPage(1);}}><option value="">All Categories</option>{(categories || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                    
                    <div className="d-flex gap-2 ms-auto">
                        <button className="btn btn-success rounded-pill px-4 fw-bold shadow-sm" onClick={() => window.open(`${import.meta.env.VITE_API_URL}/admin/export/excel/products?token=${localStorage.getItem('token')}`, '_blank')}><i className="bi bi-file-earmark-excel me-2"></i>EXCEL</button>
                        <button className="btn btn-danger rounded-pill px-4 fw-bold shadow-sm" onClick={() => window.open(`${import.meta.env.VITE_API_URL}/admin/export/pdf/products?token=${localStorage.getItem('token')}`, '_blank')}><i className="bi bi-file-earmark-pdf me-2"></i>PDF</button>
                    </div>
                </div>

                <div className="table-responsive">
                    {loading ? (
                        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                    ) : (
                        <table className="table align-middle">
                            <thead className="text-muted border-bottom text-uppercase small fw-black"><tr><th>ASSET</th><th>TAXONOMY</th><th>PRICE/OFFER</th><th>STATUS</th><th className="text-end">ACTIONS</th></tr></thead>
                            <tbody>
                                {(products || []).map(p => (
                                    <tr key={p.id} className="border-bottom">
                                        <td className="py-4"><div className="d-flex align-items-center gap-3">
                                            <img src={p.images?.[0]?.startsWith('http') ? p.images[0] : (p.images?.[0] ? `${import.meta.env.VITE_STORAGE_URL}/${p.images[0]}` : 'https://via.placeholder.com/60')} className="rounded-4 shadow-sm border border-light" width="60" height="60" style={{objectFit:'cover'}} />
                                            <div><h6 className="fw-black mb-0 text-dark">{p.name}</h6><small className="text-muted fw-bold">{p.brand?.name}</small></div>
                                        </div></td>
                                        <td><span className="badge bg-light text-dark border px-2 py-1 small fw-bold text-uppercase">{p.category?.name}</span><br/><small className="text-muted fw-bold">{p.subcategory?.name || 'Standard'}</small></td>
                                        <td><span className="fw-black text-primary fs-5">${p.discount_price || p.price}</span>{p.discount_price && <><br/><small className="text-muted text-decoration-line-through fw-bold">${p.price}</small></>}</td>
                                        <td><span className={`badge rounded-pill px-3 py-2 fw-black ${p.status ? 'bg-success bg-opacity-10 text-success border border-success' : 'bg-danger bg-opacity-10 text-danger border border-danger'}`}>{p.status ? 'ACTIVE' : 'DRAFT'}</span></td>
                                        <td className="text-end">
                                            <Link to={`/admin/product/${p.slug}`} className="btn btn-light rounded-circle p-2 me-2 shadow-sm text-info"><i className="bi bi-eye-fill fs-5"></i></Link>
                                            <button className="btn btn-light rounded-circle p-2 me-2 shadow-sm text-primary" onClick={() => handleEdit(p)}><i className="bi bi-pencil-square fs-5"></i></button>
                                            <button className="btn btn-light rounded-circle p-2 shadow-sm text-danger" onClick={async () => { if(window.confirm('Delete?')) { await api.delete(`/admin/products/${p.id}`); fetchProducts(); } }}><i className="bi bi-trash3-fill fs-5"></i></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-5 gap-2">
                        {[...Array(totalPages)].map((_, i) => (
                            <button key={i} className={`btn rounded-circle fw-black transition-all ${currentPage === i+1 ? 'btn-primary shadow-primary text-white scale-110' : 'bg-light text-dark'}`} style={{width: '50px', height: '50px'}} onClick={() => setCurrentPage(i+1)}>{i+1}</button>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default ManageProducts;
