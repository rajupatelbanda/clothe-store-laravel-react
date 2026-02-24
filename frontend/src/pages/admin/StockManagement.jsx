import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const StockManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        fetchLowStock();
    }, []);

    const fetchLowStock = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/stock/low');
            setProducts(response.data);
        } catch (error) {
            toast.error("Failed to fetch low stock products");
        } finally {
            setLoading(false);
        }
    };

    const updateStock = async (productId, newStock) => {
        setUpdatingId(productId);
        const loadToast = toast.loading('Updating Stock...');
        try {
            await api.patch(`/admin/products/${productId}/stock`, { stock: newStock });
            toast.success('Stock Synchronized!', { id: loadToast });
            fetchLowStock();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Sync failed', { id: loadToast });
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <AdminLayout title="Stock Intelligence">
            <div className="card shadow-soft border-0 rounded-5 p-5 mb-5 bg-white border-bottom border-danger border-4 border-opacity-10">
                <div className="d-flex justify-content-between align-items-center mb-5">
                    <div>
                        <h4 className="fw-black m-0 text-dark letter-spacing-tight">Critical Stock Alerts</h4>
                        <p className="text-muted fw-bold small m-0 uppercase letter-spacing-wide mt-2">Products with 5 units or less</p>
                    </div>
                    <button className="btn btn-dark rounded-pill px-4 py-2 fw-black shadow-sm" onClick={fetchLowStock}><i className="bi bi-arrow-clockwise me-2"></i>REFRESH DATA</button>
                </div>

                <div className="table-responsive">
                    {loading ? (
                        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                    ) : (
                        <table className="table align-middle">
                            <thead className="text-muted border-bottom text-uppercase small fw-black"><tr><th>ASSET</th><th>CATEGORY</th><th>CURRENT STOCK</th><th>STATUS</th><th className="text-end">ACTIONS</th></tr></thead>
                            <tbody>
                                {products.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-5 fw-bold text-muted opacity-50 uppercase">No low stock alerts detected</td></tr>
                                ) : (
                                    products.map(p => (
                                        <tr key={p.id} className="border-bottom">
                                            <td className="py-4"><div className="d-flex align-items-center gap-3">
                                                <img src={p.images?.[0]?.startsWith('http') ? p.images[0] : (p.images?.[0] ? `/storage/${p.images[0]}` : 'https://via.placeholder.com/60')} className="rounded-4 shadow-sm border border-light" width="60" height="60" style={{objectFit:'cover'}} />
                                                <div><h6 className="fw-black mb-0 text-dark">{p.name}</h6><small className="text-muted fw-bold">{p.brand?.name}</small></div>
                                            </div></td>
                                            <td><span className="badge bg-light text-dark border px-2 py-1 small fw-bold text-uppercase">{p.category?.name}</span></td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2" style={{maxWidth: '150px'}}>
                                                    <input type="number" className="form-control form-control-sm rounded-pill px-3 py-2 bg-light border-0 fw-black shadow-none" defaultValue={p.stock} onBlur={(e) => { if(e.target.value !== p.stock.toString()) updateStock(p.id, e.target.value); }} disabled={updatingId === p.id} />
                                                    <span className="fw-bold text-muted small">Units</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge rounded-pill px-3 py-2 fw-black ${p.stock <= 0 ? 'bg-danger text-white border border-danger' : 'bg-warning bg-opacity-10 text-warning border border-warning'}`}>
                                                    {p.stock <= 0 ? 'OUT OF STOCK' : 'LOW STOCK'}
                                                </span>
                                            </td>
                                            <td className="text-end">
                                                <Link to={`/admin/product/${p.slug}`} className="btn btn-light rounded-circle p-2 me-2 shadow-sm text-info"><i className="bi bi-eye-fill fs-5"></i></Link>
                                                <button className="btn btn-light rounded-circle p-2 shadow-sm text-primary" onClick={() => {
                                                    const val = prompt('Enter new stock level:', p.stock);
                                                    if(val !== null && val !== '') updateStock(p.id, val);
                                                }}><i className="bi bi-pencil-square fs-5"></i></button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <div className="row g-4">
                <div className="col-md-6">
                    <div className="card shadow-2xl border-0 rounded-5 p-5 bg-primary text-white h-100 shadow-primary">
                        <i className="bi bi-graph-up-arrow fs-1 mb-4 opacity-50"></i>
                        <h4 className="fw-black mb-3 letter-spacing-tight">Full Inventory Audit</h4>
                        <p className="mb-5 text-white-50 fw-bold small opacity-75">Access the complete catalog to manage bulk quantities and variations.</p>
                        <Link to="/admin/products" className="btn btn-white bg-white text-primary rounded-pill w-100 py-3 fw-black text-uppercase shadow-lg transition-transform hover-scale">Inventory Repository</Link>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card shadow-2xl border-0 rounded-5 p-5 bg-dark text-white h-100 shadow-dark">
                        <i className="bi bi-file-earmark-excel-fill fs-1 mb-4 opacity-50 text-success"></i>
                        <h4 className="fw-black mb-3 letter-spacing-tight">Quick Supply Order</h4>
                        <p className="mb-5 text-white-50 fw-bold small opacity-75">Export current low stock items to a spreadsheet for supplier coordination.</p>
                        <button className="btn btn-outline-light rounded-pill w-100 py-3 fw-black text-uppercase transition-transform hover-scale" onClick={() => window.open(`${import.meta.env.VITE_API_URL}/admin/export/excel/products?token=${localStorage.getItem('token')}`, '_blank')}>Export Alerts</button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default StockManagement;
