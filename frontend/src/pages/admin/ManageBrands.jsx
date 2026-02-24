import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const ManageBrands = () => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [image, setImage] = useState(null);
    const [existingImage, setExistingImage] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState('');

    const resetBrandForm = () => {
        setName(''); setImage(null); setEditingId(null); setExistingImage(null);
    };

    const handleBrandEdit = (brand) => {
        setEditingId(brand.id);
        setName(brand.name);
        setExistingImage(brand.image);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => { fetchBrands(); }, [currentPage, search]);

    const fetchBrands = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/brands', {
                params: { admin: 1, page: currentPage, search: search }
            });
            if (response.data && response.data.data) {
                setBrands(response.data.data);
                setTotalPages(response.data.last_page);
            } else {
                setBrands(response.data);
                setTotalPages(1);
            }
        } catch (error) { toast.error("Error fetching brands"); }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        if (image) formData.append('image', image);

        const loadToast = toast.loading(editingId ? 'Refining brand...' : 'Registering brand...');
        try {
            if (editingId) {
                await api.post(`/admin/brands/${editingId}?_method=PUT`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Brand refined!', { id: loadToast });
            } else {
                await api.post('/admin/brands', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Brand registered!', { id: loadToast });
            }
            setName(''); setImage(null); setEditingId(null);
            fetchBrands();
        } catch (error) { toast.error('Action failed', { id: loadToast }); }
    };

    return (
        <AdminLayout title="Global Labels Control">
            <div className="row g-5">
                <div className="col-lg-4">
                    <div className="card shadow-2xl border-0 rounded-5 p-5 bg-white border-bottom border-primary border-4 border-opacity-10">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-black m-0">{editingId ? 'Refine Label' : 'New Label Entry'}</h5>
                            {editingId && <button className="btn btn-sm btn-outline-dark rounded-pill px-2 fw-bold" onClick={resetBrandForm} style={{fontSize: '0.7rem'}}>DISCARD</button>}
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="form-label fw-bold small text-muted">BRAND NAME</label>
                                <input type="text" className="form-control rounded-pill p-3 border-0 bg-light fw-bold" value={name} onChange={(e) => setName(e.target.value)} required />
                            </div>
                            <div className="mb-5">
                                <label className="form-label fw-bold small text-muted">OFFICIAL LOGO (NEW)</label>
                                <input type="file" className="form-control rounded-pill p-2 border-0 bg-light fw-bold" onChange={(e) => setImage(e.target.files[0])} accept="image/*" />
                                {existingImage && (
                                    <div className="mt-2 text-center">
                                        <img src={existingImage.startsWith('http') ? existingImage : `/storage/${existingImage}`} height="60" className="rounded border shadow-sm" alt="current" />
                                        <p className="x-small fw-bold text-muted mt-1">Current Logo</p>
                                    </div>
                                )}
                            </div>
                            <button type="submit" className="btn btn-primary w-100 py-3 rounded-pill fw-black shadow-lg">SAVE LABEL</button>
                        </form>
                    </div>
                </div>
                <div className="col-lg-8">
                    <div className="card shadow-2xl border-0 rounded-5 p-5 bg-white border border-light">
                        <div className="d-flex justify-content-between align-items-center mb-5 gap-3">
                            <input type="text" className="form-control rounded-pill px-4 py-3 bg-light border-0 w-50 fw-bold shadow-none" placeholder="Filter labels..." value={search} onChange={(e) => {setSearch(e.target.value); setCurrentPage(1);}} />
                            <div className="btn btn-outline-success btn-sm rounded-pill px-4 position-relative overflow-hidden fw-black">
                                <i className="bi bi-file-earmark-excel me-2"></i>IMPORT
                                <input type="file" className="position-absolute top-0 start-0 opacity-0 w-100 h-100 cursor-pointer" onChange={async(e)=>{
                                    const file=e.target.files[0]; if(!file) return;
                                    const fd=new FormData(); fd.append('file', file);
                                    const lt=toast.loading('Importing...');
                                    try{ await api.post('/admin/import/brands', fd); toast.success('Imported!', {id:lt}); fetchBrands(); }catch(err){ toast.error('Failed', {id:lt}); }
                                }} />
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className="table align-middle">
                                <thead className="text-muted border-bottom small fw-black"><tr><th>VISUAL</th><th>BRAND NAME</th><th className="text-end">ACTIONS</th></tr></thead>
                                <tbody>
                                    {brands.map(brand => (
                                        <tr key={brand.id} className="border-bottom">
                                            <td className="py-3"><img src={brand.image?.startsWith('http') ? brand.image : (brand.image ? `/storage/${brand.image}` : 'https://ui-avatars.com/api/?name='+brand.name)} className="rounded-circle shadow-sm border border-light" width="50" height="50" style={{objectFit: 'cover'}} /></td>
                                            <td className="fw-black text-dark fs-5">{brand.name}</td>
                                            <td className="text-end">
                                                <button className="btn btn-light rounded-circle p-2 me-2 shadow-sm text-primary" onClick={() => handleBrandEdit(brand)}><i className="bi bi-pencil-square fs-5"></i></button>
                                                <button className="btn btn-light rounded-circle p-2 shadow-sm text-danger" onClick={async () => {if(window.confirm('Delete Brand?')) {await api.delete(`/admin/brands/${brand.id}`); fetchBrands();}}}><i className="bi bi-trash3-fill fs-5"></i></button>
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

export default ManageBrands;
