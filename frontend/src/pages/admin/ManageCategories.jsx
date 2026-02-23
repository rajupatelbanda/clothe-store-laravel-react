import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const ManageCategories = () => {
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [image, setImage] = useState(null);
    const [existingImage, setExistingImage] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState('');

    // ... inside component
    const resetCategoryForm = () => {
        setName(''); setImage(null); setEditingId(null); setExistingImage(null);
    };

    const handleCategoryEdit = (cat) => {
        setEditingId(cat.id);
        setName(cat.name);
        setExistingImage(cat.image);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    // Subcategory Form State
    const [subName, setSubName] = useState('');
    const [subCatId, setSubCatId] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchCategories();
    }, [currentPage, search]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const [cRes, sRes] = await Promise.all([
                api.get(`/admin/categories`, { params: { admin: 1, page: currentPage, search: search } }),
                api.get('/admin/subcategories')
            ]);
            setCategories(cRes.data.data || cRes.data || []);
            setTotalPages(cRes.data.last_page || 1);
            setSubcategories(sRes.data || []);
        } catch (error) {
            toast.error("Error fetching data");
        }
        setLoading(false);
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        if (image) formData.append('image', image);

        const loadToast = toast.loading(editingId ? 'Updating...' : 'Creating...');
        try {
            if (editingId) {
                await api.post(`/admin/categories/${editingId}?_method=PUT`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Category updated!', { id: loadToast });
            } else {
                await api.post('/admin/categories', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Category created!', { id: loadToast });
            }
            setName(''); setImage(null); setEditingId(null);
            fetchCategories();
        } catch (error) { toast.error('Action failed', { id: loadToast }); }
    };

    const handleSubcategorySubmit = async (e) => {
        e.preventDefault();
        const loadToast = toast.loading('Adding subcategory...');
        try {
            await api.post('/admin/subcategories', { name: subName, category_id: subCatId });
            toast.success('Subcategory added!', { id: loadToast });
            setSubName(''); setSubCatId('');
            fetchCategories();
        } catch (error) { toast.error('Failed to add subcategory', { id: loadToast }); }
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const fd = new FormData();
        fd.append('file', file);
        const lt = toast.loading('Importing collections...');
        try {
            await api.post('/admin/import/categories', fd);
            toast.success('Import Successful!', { id: lt });
            fetchCategories();
        } catch (err) { toast.error('Import failed', { id: lt }); }
    };

    const handleExport = (format) => {
        const token = localStorage.getItem('token');
        window.location.href = `http://localhost:8000/api/admin/export/${format}/categories?token=${token}`;
    };

    return (
        <AdminLayout title="Taxonomy Control">
            <div className="row g-5">
                <div className="col-lg-4">
                    <div className="card shadow-2xl border-0 rounded-5 p-5 bg-white mb-5 border-bottom border-primary border-4 border-opacity-10">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-black m-0">{editingId ? 'Refine Category' : 'New Master Category'}</h5>
                            {editingId && <button className="btn btn-sm btn-outline-dark rounded-pill px-2 fw-bold" onClick={resetCategoryForm} style={{fontSize: '0.7rem'}}>DISCARD</button>}
                        </div>
                        <form onSubmit={handleCategorySubmit}>
                            <div className="mb-4">
                                <label className="form-label fw-bold small text-muted">NAME</label>
                                <input type="text" className="form-control rounded-pill p-3 border-0 bg-light fw-bold" value={name} onChange={(e) => setName(e.target.value)} required />
                            </div>
                            <div className="mb-5">
                                <label className="form-label fw-bold small text-muted">COVER IMAGE (NEW)</label>
                                <input type="file" className="form-control rounded-pill p-2 border-0 bg-light" onChange={(e) => setImage(e.target.files[0])} accept="image/*" />
                                {editingId && existingImage && (
                                    <div className="mt-2 text-center">
                                        <img src={existingImage.startsWith('http') ? existingImage : `${import.meta.env.VITE_STORAGE_URL}/${existingImage}`} height="60" className="rounded border shadow-sm" alt="current" />
                                        <p className="x-small fw-bold text-muted mt-1">Current Image</p>
                                    </div>
                                )}
                            </div>
                            <button type="submit" className="btn btn-primary w-100 py-3 rounded-pill fw-black shadow-lg">SAVE CATEGORY</button>
                        </form>
                    </div>

                    <div className="card shadow-2xl border-0 rounded-5 p-5 bg-white border-bottom border-dark border-4 border-opacity-10">
                        <h5 className="fw-black mb-4">Create Subcategory</h5>
                        <form onSubmit={handleSubcategorySubmit}>
                            <div className="mb-4">
                                <label className="form-label fw-bold small text-muted">PARENT CATEGORY</label>
                                <select className="form-select rounded-pill p-3 border-0 bg-light fw-bold" value={subCatId} onChange={(e) => setSubCatId(e.target.value)} required>
                                    <option value="">Select Parent...</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="form-label fw-bold small text-muted">SUBCATEGORY NAME</label>
                                <input type="text" className="form-control rounded-pill p-3 border-0 bg-light fw-bold" value={subName} onChange={(e) => setSubName(e.target.value)} required placeholder="e.g. Shirts, Tops" />
                            </div>
                            <button type="submit" className="btn btn-dark w-100 py-3 rounded-pill fw-black shadow-lg">LINK SUBCATEGORY</button>
                        </form>
                    </div>
                </div>

                <div className="col-lg-8">
                    <div className="card shadow-2xl border-0 rounded-5 p-5 bg-white border border-light h-100">
                        <div className="d-flex justify-content-between align-items-center mb-5 gap-3">
                            <input type="text" className="form-control rounded-pill px-4 py-3 bg-light border-0 w-50 fw-bold" placeholder="Search taxonomies..." value={search} onChange={(e) => {setSearch(e.target.value); setCurrentPage(1);}} />
                            <div className="d-flex gap-2">
                                <div className="btn btn-outline-success btn-sm rounded-pill px-4 position-relative overflow-hidden fw-black d-flex align-items-center">
                                    <i className="bi bi-file-earmark-excel me-2"></i>IMPORT
                                    <input type="file" className="position-absolute top-0 start-0 opacity-0 w-100 h-100 cursor-pointer" onChange={handleImport} accept=".xlsx,.xls,.csv" />
                                </div>
                                <button className="btn btn-success rounded-pill px-4 fw-black shadow-sm" onClick={() => handleExport('excel')}>EXCEL</button>
                                <button className="btn btn-danger rounded-pill px-4 fw-black shadow-sm" onClick={() => handleExport('pdf')}>PDF</button>
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className="table align-middle">
                                <thead className="text-muted border-bottom text-uppercase small fw-black"><tr><th>ICON</th><th>CATEGORY</th><th>SUBCATEGORIES</th><th className="text-end">ACTIONS</th></tr></thead>
                                <tbody>
                                    {categories.map(cat => (
                                        <tr key={cat.id} className="border-bottom">
                                            <td className="py-4">
                                                <img src={cat.image?.startsWith('http') ? cat.image : (cat.image ? `http://localhost:8000/storage/${cat.image}` : 'https://via.placeholder.com/50')} className="rounded-circle shadow-sm border border-light" width="50" height="50" style={{objectFit: 'cover'}} />
                                            </td>
                                            <td className="fw-black text-dark fs-5">{cat.name}</td>
                                            <td>
                                                {(subcategories || []).filter(s => s.category_id === cat.id).map(s => (
                                                    <span key={s.id} className="badge bg-light text-dark border rounded-pill me-1 mb-1 px-2 py-1 small fw-bold">
                                                        {s.name} <i className="bi bi-x text-danger cursor-pointer ms-1" onClick={async () => { if(window.confirm('Delete sub?')) { await api.delete(`/admin/subcategories/${s.id}`); fetchCategories(); } }}></i>
                                                    </span>
                                                ))}
                                            </td>
                                            <td className="text-end">
                                                <button className="btn btn-light rounded-circle p-2 me-2 shadow-sm text-primary" onClick={() => handleCategoryEdit(cat)}><i className="bi bi-pencil-square fs-5"></i></button>
                                                <button className="btn btn-light rounded-circle p-2 shadow-sm text-danger" onClick={async () => {if(window.confirm('Delete Category?')) {await api.delete(`/admin/categories/${cat.id}`); fetchCategories();}}}><i className="bi bi-trash3-fill fs-5"></i></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {totalPages > 1 && (
                            <div className="d-flex justify-content-center mt-5 gap-2">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button key={i} className={`btn rounded-circle fw-black transition-all ${currentPage === i+1 ? 'btn-primary shadow-primary text-white scale-110' : 'bg-light text-dark'}`} style={{width: '50px', height: '50px'}} onClick={() => setCurrentPage(i+1)}>{i+1}</button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ManageCategories;
