import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import PageBanner from '../components/PageBanner';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get('/orders');
                setOrders(response.data);
            } catch (error) {
                console.error("Error fetching orders", error);
            }
            setLoading(false);
        };
        fetchOrders();
    }, []);

    const handleDownloadInvoice = async (orderId) => {
        const loadToast = toast.loading('Preparing your invoice...');
        try {
            const response = await api.get(`/orders/${orderId}/invoice`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Gemini_Invoice_${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            toast.success('Invoice downloaded!', { id: loadToast });
        } catch (error) {
            toast.error('Failed to download invoice', { id: loadToast });
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            'pending': 'bg-warning text-dark',
            'processing': 'bg-info text-white',
            'shipped': 'bg-primary text-white',
            'delivered': 'bg-success text-white',
            'cancelled': 'bg-danger text-white'
        };
        return `badge rounded-pill px-3 py-2 fw-bold text-uppercase ${map[status] || 'bg-secondary'}`;
    };

    if (loading) return <div className="container py-5 mt-5 text-center"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="animate-fade">
            <PageBanner page="orders" title="My History" />
            <div className="container py-4">
            <h1 className="fw-black text-dark mb-5 border-bottom pb-3 text-primary letter-spacing-tight">My Orders</h1>
            {orders.length === 0 ? (
                <div className="card shadow-2xl border-0 rounded-5 p-5 text-center bg-white">
                    <i className="bi bi-bag-x fs-1 text-muted mb-3 d-block opacity-25"></i>
                    <h3 className="fw-black text-dark">No orders yet</h3>
                    <p className="text-muted">Once you place an order, it will appear here.</p>
                    <Link to="/shop" className="btn btn-primary rounded-pill px-5 mt-4 fw-black shadow-lg">START SHOPPING</Link>
                </div>
            ) : (
                <div className="row g-4">
                    {orders.map(order => (
                        <div className="col-12" key={order.id}>
                            <div className="card shadow-soft border-0 rounded-5 p-4 bg-white border border-light">
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                                    <div>
                                        <h5 className="fw-black text-dark mb-1">Order #{order.id}</h5>
                                        <p className="small text-muted mb-0 fw-bold">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-md-end">
                                        <span className="fw-black text-primary fs-4 d-block mb-1">₹{order.total}</span>
                                        <div className="d-flex gap-2 justify-content-md-end">
                                            <button onClick={() => handleDownloadInvoice(order.id)} className="btn btn-light btn-sm rounded-pill px-3 fw-bold border"><i className="bi bi-file-earmark-pdf me-1"></i>Invoice</button>
                                            <span className={getStatusBadge(order.status)}>{order.status}</span>
                                            <Link to={`/orders/${order.id}/track`} className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-bold">Track</Link>
                                        </div>
                                    </div>
                                </div>
                                <hr className="my-4 opacity-10" />
                                <div className="row g-3">
                                    {order.order_items?.map(item => (
                                        <div className="col-md-4" key={item.id}>
                                            <div className="d-flex align-items-center gap-3">
                                                <img src={item.product?.images?.[0] ? (item.product.images[0].startsWith('http') ? item.product.images[0] : `/storage/${item.product.images[0]}`) : 'https://via.placeholder.com/60'} className="rounded-3 shadow-sm" width="60" height="60" style={{objectFit: 'cover'}} />
                                                <div>
                                                    <h6 className="fw-bold mb-0 text-dark small">{item.product?.name}</h6>
                                                    <small className="text-muted fw-bold">Qty: {item.quantity} • {item.size} / {item.color}</small>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            </div>
        </div>
    );
};

export default Orders;
