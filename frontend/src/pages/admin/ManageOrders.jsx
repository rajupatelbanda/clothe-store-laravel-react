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
                                <tr><th>Order #</th><th>Customer</th><th>Amount</th><th>Method</th><th>Status</th><th className="text-end">Update</th></tr>
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
                                        <td className="fw-black text-primary fs-5">${order.total}</td>
                                        <td><span className="badge bg-light text-dark border px-3 py-2 fw-bold text-uppercase">{order.payment_method}</span></td>
                                        <td><span className={getStatusBadge(order.status)}>{order.status}</span></td>
                                        <td className="text-end">
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
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default ManageOrders;
