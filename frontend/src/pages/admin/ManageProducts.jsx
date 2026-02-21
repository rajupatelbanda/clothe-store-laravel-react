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
        price: '', discount_price: '', stock: '', is_featured: false, is_trending: false, status: true
    });
    const [images, setImages] = useState([]);
    const [video, setVideo] = useState(null);
    const [variations, setVariations] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [existingVideo, setExistingVideo] = useState(null);

    // 1. Fetch Metadata
    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const [cRes, bRes, sRes] = await Promise.all([
                    api.get('/categories'), 
                    api.get('/brands'), 
                    api.get('/subcategories?admin=1')
                ]);
                setCategories(cRes.data || []);
                setBrands(bRes.data || []);
                setSubcategories(sRes.data || []);
            } catch (error) {}
        };
        fetchMeta();
    }, []);

    // 2. Fetch Products
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
                setProducts(response.data);
                setTotalPages(1);
            }
        } catch (error) { setProducts([]); }
        setLoading(false);
    }, [currentPage, search, filterCategory]);

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
        
        // Basic fields
        Object.keys(formData).forEach(key => {
            let val = formData[key];
            if (typeof val === 'boolean') val = val ? 1 : 0;
            data.append(key, val === null ? '' : val);
        });

        // Files
        if (images.length > 0) Array.from(images).forEach(img => data.append('images[]', img));
        if (video) data.append('video', video);
        
        // Variations
        data.append('variations', JSON.stringify(variations));

        const loadToast = toast.loading('Synchronizing Inventory...');
        try {
            if (editingId) {
                await api.post(`/admin/products/${editingId}?_method=PUT`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Product Updated!', { id: loadToast });
            } else {
                await api.post('/admin/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Product Registered!', { id: loadToast });
            }
            resetForm(); fetchProducts();
        } catch (error) { toast.error(error.response?.data?.message || 'Sync failed', { id: loadToast }); }
    };

    const resetForm = () => {
        setFormData({ name: '', category_id: '', subcategory_id: '', brand_id: '', description: '', price: '', discount_price: '', stock: '', is_featured: false, is_trending: false, status: true });
        setImages([]); setVideo(null); setVariations([]); setEditingId(null);
        setExistingImages([]); setExistingVideo(null);
    };

    const handleEdit = (prod) => {
        setEditingId(prod.id);
        setFormData({
            name: prod.name, 
            category_id: prod.category_id, 
            subcategory_id: prod.subcategory_id || '',
            brand_id: prod.brand_id, 
            description: prod.description, 
            price: prod.price,
            discount_price: prod.discount_price || '', 
            stock: prod.stock, 
            is_featured: !!prod.is_featured, 
            is_trending: !!prod.is_trending, 
            status: !!prod.status
        });
        setVariations(prod.variations || []);
        setExistingImages(prod.images || []);
        setExistingVideo(prod.video || null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const discountPerc = (parseFloat(formData.price) > 0 && parseFloat(formData.discount_price) > 0) ? 
        Math.round(((parseFloat(formData.price) - parseFloat(formData.discount_price)) / parseFloat(formData.price)) * 100) : 0;

    return (
        <AdminLayout title="Apparel Repository">
            <div className="card shadow-soft border-0 rounded-5 p-5 mb-5 bg-white border-bottom border-primary border-4 border-opacity-10">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-black m-0">{editingId ? `Editing: ${formData.name}` : 'New apparel entry'}</h5>
                    {editingId && <button className="btn btn-sm btn-outline-dark rounded-pill px-3 fw-bold" onClick={resetForm}>Create New Instead</button>}
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="row g-4">
                        <div className="col-md-6">
                            <label className="form-label fw-bold small text-muted">TITLE</label>
                            <input type="text" name="name" className="form-control rounded-pill p-3 border-0 bg-light fw-bold shadow-none" value={formData.name} onChange={handleInputChange} required />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold small text-muted">MASTER CATEGORY</label>
                            <select name="category_id" className="form-select rounded-pill p-3 border-0 bg-light fw-bold shadow-none" value={formData.category_id} onChange={handleInputChange} required>
                                <option value="">Select...</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold small text-muted">SUB-TYPE</label>
                            <select name="subcategory_id" className="form-select rounded-pill p-3 border-0 bg-light fw-bold shadow-none" value={formData.subcategory_id} onChange={handleInputChange} disabled={!formData.category_id}>
                                <option value="">Select...</option>
                                {subcategories.filter(s => s.category_id?.toString() === formData.category_id?.toString()).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        
                        <div className="col-md-3">
                            <label className="form-label fw-bold small text-muted">BRAND LABEL</label>
                            <select name="brand_id" className="form-select rounded-pill p-3 border-0 bg-light fw-bold shadow-none" value={formData.brand_id} onChange={handleInputChange} required>
                                <option value="">Labels...</option>
                                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-3"><label className="form-label fw-bold small text-muted">ORIGINAL PRICE (₹)</label><input type="number" name="price" className="form-control rounded-pill p-3 border-0 bg-light fw-bold" value={formData.price} onChange={handleInputChange} required step="0.01" /></div>
                        <div className="col-md-3"><label className="form-label fw-bold small text-muted">OFFER PRICE (₹)</label><input type="number" name="discount_price" className="form-control rounded-pill p-3 border-0 bg-light fw-bold" value={formData.discount_price} onChange={handleInputChange} step="0.01" /></div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold small text-muted">SAVINGS (%)</label>
                            <input type="text" className="form-control rounded-pill p-3 border-0 bg-transparent fw-black text-primary fs-5 shadow-none" value={`${discountPerc}% OFF`} readOnly />
                        </div>

                        <div className="col-md-12"><label className="form-label fw-bold small text-muted">NARRATIVE</label><textarea name="description" className="form-control rounded-4 p-3 border-0 bg-light fw-bold shadow-none" value={formData.description} onChange={handleInputChange} required rows="3"></textarea></div>
                        
                        <div className="col-md-6">
                            <label className="form-label fw-bold small text-muted">IMAGES (NEW)</label>
                            <input type="file" className="form-control rounded-pill p-2 border-0 bg-light fw-bold" multiple onChange={(e) => setImages(e.target.files)} accept="image/*" />
                            {editingId && existingImages.length > 0 && (
                                <div className="d-flex gap-2 mt-2 overflow-auto pb-2">
                                    {existingImages.map((img, i) => (
                                        <img key={i} src={img.startsWith('http') ? img : `${import.meta.env.VITE_STORAGE_URL}/${img}`} height="50" className="rounded border" />
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-bold small text-muted">MOTION VIDEO (NEW)</label>
                            <input type="file" className="form-control rounded-pill p-2 border-0 bg-light fw-bold" onChange={(e) => setVideo(e.target.files[0])} accept="video/*" />
                            {editingId && existingVideo && <div className="mt-2 small fw-bold text-success"><i className="bi bi-check-circle-fill me-1"></i>Current video present</div>}
                        </div>

                        <div className="col-12"><hr className="opacity-10" /><h6 className="fw-black mb-4 text-uppercase">Product Variations</h6>
                            {variations.map((v, i) => (
                                <div className="row g-2 mb-3 align-items-end" key={i}>
                                    <div className="col-md-3"><label className="small fw-bold opacity-50">COLOR</label><input type="text" className="form-control form-control-sm rounded-pill px-3" value={v.color || ''} onChange={(e)=>updateVariation(i, 'color', e.target.value)} /></div>
                                    <div className="col-md-3"><label className="small fw-bold opacity-50">SIZE</label><input type="text" className="form-control form-control-sm rounded-pill px-3" value={v.size || ''} onChange={(e)=>updateVariation(i, 'size', e.target.value)} /></div>
                                    <div className="col-md-3"><label className="small fw-bold opacity-50">PRICE (₹)</label><input type="number" className="form-control form-control-sm rounded-pill px-3" value={v.price || ''} onChange={(e)=>updateVariation(i, 'price', e.target.value)} /></div>
                                    <div className="col-md-2"><label className="small fw-bold opacity-50">STOCK</label><input type="number" className="form-control form-control-sm rounded-pill px-3" value={v.stock || ''} onChange={(e)=>updateVariation(i, 'stock', e.target.value)} /></div>
                                    <div className="col-md-1"><button type="button" className="btn btn-outline-danger btn-sm rounded-circle" onClick={()=>removeVariation(i)}><i className="bi bi-x"></i></button></div>
                                </div>
                            ))}
                            <button type="button" className="btn btn-dark btn-sm rounded-pill px-4 fw-bold mt-2" onClick={addVariation}><i className="bi bi-plus-lg me-2"></i>ADD VARIATION</button>
                        </div>

                        <div className="col-md-4 mt-4">
                            <div className="form-check form-switch">
                                <input className="form-check-input shadow-none" type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleInputChange} />
                                <label className="form-check-label ms-2 fw-black text-primary uppercase">FEATURED</label>
                            </div>
                        </div>
                        <div className="col-md-4 mt-4">
                            <div className="form-check form-switch">
                                <input className="form-check-input shadow-none" type="checkbox" name="is_trending" checked={formData.is_trending} onChange={handleInputChange} />
                                <label className="form-check-label ms-2 fw-black text-warning uppercase">TRENDING</label>
                            </div>
                        </div>
                        <div className="col-md-4 mt-4">
                            <div className="form-check form-switch">
                                <input className="form-check-input shadow-none" type="checkbox" name="status" checked={formData.status} onChange={handleInputChange} />
                                <label className="form-check-label ms-2 fw-black text-success uppercase">ACTIVE</label>
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 d-flex gap-3">
                        <button type="submit" className="btn btn-primary rounded-pill px-5 py-3 fw-black shadow-lg">PERSIST INVENTORY</button>
                        {editingId && <button type="button" className="btn btn-light rounded-pill px-5 fw-bold" onClick={resetForm}>DISCARD</button>}
                    </div>
                </form>
            </div>

            <div className="card shadow-2xl border-0 rounded-5 p-5 bg-white border border-light">
                <div className="d-flex gap-4 mb-5 align-items-center">
                    <input type="text" className="form-control rounded-pill px-4 py-3 bg-light border-0 shadow-none fw-bold w-50" placeholder="Instant Search..." value={search} onChange={(e) => {setSearch(e.target.value); setCurrentPage(1);}} />
                    <select className="form-select rounded-pill px-4 py-3 bg-light border-0 shadow-none w-auto fw-bold" value={filterCategory} onChange={(e) => {setFilterCategory(e.target.value); setCurrentPage(1);}}>
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div className="table-responsive">
                    {loading ? (
                        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                    ) : (
                        <table className="table align-middle">
                            <thead className="text-muted border-bottom text-uppercase small fw-black"><tr><th>ASSET</th><th>TAXONOMY</th><th>PRICE</th><th>TRAITS</th><th>STATUS</th><th className="text-end">ACTIONS</th></tr></thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p.id} className="border-bottom">
                                        <td className="py-4">
                                            <div className="d-flex align-items-center gap-3">
                                                <img src={p.images?.[0]?.startsWith('http') ? p.images[0] : `${import.meta.env.VITE_STORAGE_URL}/${p.images?.[0]}`} className="rounded-4 shadow-sm" width="60" height="60" style={{objectFit:'cover'}} />
                                                <div><h6 className="fw-black mb-0 text-dark">{p.name}</h6><small className="text-muted fw-bold">{p.brand?.name}</small></div>
                                            </div>
                                        </td>
                                        <td><span className="badge bg-light text-dark border px-2 py-1 small fw-bold">{p.category?.name}</span></td>
                                        <td><span className="fw-black text-primary">₹{p.discount_price || p.price}</span></td>
                                        <td>
                                            <div className="d-flex gap-1">
                                                {p.is_featured && <span className="badge bg-primary rounded-pill small">F</span>}
                                                {p.is_trending && <span className="badge bg-warning text-dark rounded-pill small">T</span>}
                                            </div>
                                        </td>
                                        <td><span className={`badge rounded-pill px-3 py-2 fw-black ${p.status ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>{p.status ? 'ACTIVE' : 'DRAFT'}</span></td>
                                        <td className="text-end">
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
