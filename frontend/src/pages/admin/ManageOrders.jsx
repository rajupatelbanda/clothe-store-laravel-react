import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const ManageOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchOrders();
    }, [search]);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/admin/all-orders');
            let data = response.data;
            if (search) {
                data = data.filter(o => 
                    o.id.toString().includes(search) || 
                    o.user?.name.toLowerCase().includes(search.toLowerCase()) ||
                    o.payment_id?.toLowerCase().includes(search.toLowerCase())
                );
            }
            setOrders(data);
        } catch (error) {
            toast.error("Error fetching orders");
        }
        setLoading(false);
    };

    const handleStatusUpdate = async (id, status) => {
        const loadToast = toast.loading('Updating order status & notifying user...');
        try {
            await api.patch(`/admin/orders/${id}/status`, { status });
            toast.success('Status updated! Mail & WhatsApp simulated.', { id: loadToast });
            fetchOrders();
        } catch (error) {
            toast.error('Update failed', { id: loadToast });
        }
    };

    const handleExport = () => {
        const token = localStorage.getItem('token');
        window.open(`http://localhost:8000/api/admin/export/pdf/orders?token=${token}`, '_blank');
    };

    const getStatusBadge = (status) => {
        const map = {
            'pending': 'bg-warning text-dark',
            'processing': 'bg-info text-white',
            'shipped': 'bg-primary text-white',
            'delivered': 'bg-success text-white',
            'cancelled': 'bg-danger text-white'
        };
        return `badge rounded-pill px-3 py-2 ${map[status] || 'bg-secondary'}`;
    };

    const [selectedOrder, setSelectedOrder] = useState(null);

    const handleDownloadInvoice = async (orderId) => {
        const loadToast = toast.loading('Preparing invoice...');
        try {
            const response = await api.get(`/orders/${orderId}/invoice`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice_${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            toast.success('Invoice ready!', { id: loadToast });
        } catch (error) {
            toast.error('Failed to generate invoice', { id: loadToast });
        }
    };

    return (
        <AdminLayout title="Fulfillment Center">
            <div className="card shadow-2xl border-0 rounded-5 p-5 bg-white border-bottom border-primary border-4 border-opacity-10 mb-5 d-flex flex-row justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3 flex-grow-1">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary"><i className="bi bi-search fs-4"></i></div>
                    <input type="text" className="form-control border-0 bg-transparent shadow-none fs-5 fw-bold" placeholder="Search orders by ID or customer..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <button className="btn btn-danger rounded-pill px-5 fw-black shadow-lg" onClick={handleExport}><i className="bi bi-file-earmark-pdf-fill me-2"></i>EXPORT REPORT</button>
            </div>

            {loading ? (
                <div className="text-center py-5 vh-50 d-flex align-items-center justify-content-center"><div className="spinner-border text-primary" role="status"></div></div>
            ) : (
                <div className="card shadow-2xl border-0 rounded-5 p-5 bg-white overflow-hidden">
                    <div className="table-responsive">
                        <table className="table align-middle">
                            <thead className="text-muted border-bottom text-uppercase small fw-black">
                                <tr><th>Order #</th><th>Customer</th><th>Amount</th><th>Method</th><th>Status</th><th className="text-end">Actions</th></tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id} className="border-bottom">
                                        <td className="py-4 fw-black">#{order.id}</td>
                                        <td>
                                            <div className="d-flex align-items-center gap-3">
                                                <img src={`https://ui-avatars.com/api/?name=${order.user?.name}&background=random`} className="rounded-circle shadow-sm" width="40" />
                                                <div><h6 className="fw-black mb-0 text-dark">{order.user?.name}</h6><small className="text-muted fw-bold">{order.phone}</small></div>
                                            </div>
                                        </td>
                                        <td className="fw-black text-primary fs-5">₹{order.total}</td>
                                        <td><span className="badge bg-light text-dark border px-3 py-2 fw-bold text-uppercase">{order.payment_method}</span></td>
                                        <td><span className={getStatusBadge(order.status)}>{order.status}</span></td>
                                        <td className="text-end">
                                            <div className="d-flex gap-2 justify-content-end align-items-center">
                                                <button className="btn btn-light rounded-circle p-2 shadow-sm text-primary" onClick={() => setSelectedOrder(order)} title="View Details"><i className="bi bi-eye-fill fs-5"></i></button>
                                                <button className="btn btn-light rounded-circle p-2 shadow-sm text-danger" onClick={() => handleDownloadInvoice(order.id)} title="Download Invoice"><i className="bi bi-file-earmark-pdf-fill fs-5"></i></button>
                                                <select 
                                                    className="form-select form-select-sm rounded-pill fw-bold border-0 bg-light shadow-sm py-2 px-3 w-auto d-inline-block" 
                                                    value={order.status} 
                                                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 rounded-5 shadow-2xl">
                            <div className="modal-header border-0 p-4">
                                <h5 className="modal-title fw-black">ORDER DETAILS #{selectedOrder.id}</h5>
                                <button type="button" className="btn-close" onClick={() => setSelectedOrder(null)}></button>
                            </div>
                            <div className="modal-body p-4 pt-0">
                                <div className="row g-4 mb-4">
                                    <div className="col-md-6">
                                        <div className="bg-light p-4 rounded-4 h-100">
                                            <h6 className="fw-black text-muted small uppercase mb-3">Customer Information</h6>
                                            <p className="mb-1 fw-bold text-dark">{selectedOrder.user?.name}</p>
                                            <p className="mb-1 small text-muted">{selectedOrder.user?.email}</p>
                                            <p className="mb-0 small text-muted">{selectedOrder.phone}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="bg-light p-4 rounded-4 h-100">
                                            <h6 className="fw-black text-muted small uppercase mb-3">Shipping Destination</h6>
                                            <p className="mb-0 small fw-semibold text-dark">{selectedOrder.address}</p>
                                        </div>
                                    </div>
                                </div>

                                <h6 className="fw-black mb-3">Line Items</h6>
                                <div className="table-responsive mb-4">
                                    <table className="table align-middle border-light">
                                        <thead className="bg-light">
                                            <tr className="small fw-bold"><th>Product</th><th>Spec</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr>
                                        </thead>
                                        <tbody>
                                            {!selectedOrder.order_items || selectedOrder.order_items.length === 0 ? (
                                                <tr><td colSpan="5" className="text-center py-4 fw-bold text-muted">No items found for this order</td></tr>
                                            ) : (
                                                selectedOrder.order_items.map(item => (
                                                    <tr key={item.id}>
                                                        <td className="fw-bold text-dark">{item.product?.name || 'Unknown Product'}</td>
                                                        <td className="small text-muted">{item.size} / {item.color}</td>
                                                        <td>₹{item.price}</td>
                                                        <td>x{item.quantity}</td>
                                                        <td className="fw-black text-primary">₹{(item.price * item.quantity).toFixed(2)}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="d-flex justify-content-between align-items-center bg-dark text-white p-4 rounded-4">
                                    <div>
                                        <span className="small opacity-50 fw-bold d-block">GRAND TOTAL</span>
                                        <h3 className="fw-black mb-0">₹{selectedOrder.total}</h3>
                                    </div>
                                    <div className="text-end">
                                        <span className="small opacity-50 fw-bold d-block">PAYMENT STATUS</span>
                                        <span className="badge bg-primary rounded-pill uppercase fw-black">{selectedOrder.payment_status || 'Paid'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-0 p-4 pt-0">
                                <button className="btn btn-outline-dark rounded-pill px-4 fw-bold" onClick={() => setSelectedOrder(null)}>CLOSE</button>
                                <button className="btn btn-primary rounded-pill px-4 fw-black shadow-lg" onClick={() => handleDownloadInvoice(selectedOrder.id)}><i className="bi bi-file-earmark-pdf-fill me-2"></i>GET INVOICE</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default ManageOrders;
