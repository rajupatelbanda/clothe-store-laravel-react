import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

const OrderTracking = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await api.get(`/orders/${id}/track`);
                setOrder(response.data);
            } catch (error) {
                console.error("Tracking Error:", error);
            }
            setLoading(false);
        };
        fetchOrder();
    }, [id]);

    const handleDownloadInvoice = async () => {
        const loadToast = toast.loading('Downloading invoice...');
        try {
            const response = await api.get(`/orders/${id}/invoice`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            toast.success('Downloaded!', { id: loadToast });
        } catch (error) { toast.error('Download failed', { id: loadToast }); }
    };

    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    const currentStep = order ? steps.indexOf(order.status) : -1;

    if (loading) return <div className="container py-5 mt-5 text-center"><div className="spinner-border text-primary"></div></div>;
    if (!order) return <div className="container py-5 mt-5 text-center"><h3>Order Not Found</h3><Link to="/orders" className="btn btn-primary rounded-pill mt-3">Back to Orders</Link></div>;

    return (
        <div className="container py-5 mt-5 animate-up">
            <div className="d-flex justify-content-between align-items-center mb-5 border-bottom pb-3">
                <h1 className="fw-black text-dark mb-0 text-primary letter-spacing-tight">Track Order #{order.id}</h1>
                <button onClick={handleDownloadInvoice} className="btn btn-dark rounded-pill px-4 fw-black shadow-sm"><i className="bi bi-file-earmark-pdf-fill me-2"></i>DOWNLOAD INVOICE</button>
            </div>
            
            <div className="card shadow-2xl border-0 rounded-5 p-5 bg-white mb-5">
                <div className="row justify-content-between align-items-center mb-5 position-relative">
                    {steps.map((step, index) => (
                        <div key={step} className="col text-center position-relative">
                            {index < steps.length - 1 && (
                                <div className={`tracking-line ${index < currentStep ? 'active' : ''}`}></div>
                            )}
                            <div className={`mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center shadow-sm ${index <= currentStep ? 'bg-primary text-white' : 'bg-light text-muted'}`} style={{ width: '60px', height: '60px', zIndex: 2, position: 'relative' }}>
                                <i className={`bi ${index === 0 ? 'bi-clock' : index === 1 ? 'bi-gear' : index === 2 ? 'bi-truck' : 'bi-check2-circle'} fs-4`}></i>
                            </div>
                            <h6 className={`fw-black text-uppercase small ${index <= currentStep ? 'text-dark' : 'text-muted opacity-50'}`}>{step}</h6>
                        </div>
                    ))}
                </div>

                <div className="row g-4 mt-5">
                    <div className="col-md-6 border-end border-light">
                        <h5 className="fw-black mb-4">Delivery Information</h5>
                        <p className="mb-2"><strong>Address:</strong> {order.address || 'N/A'}</p>
                        <p className="mb-2"><strong>Phone:</strong> {order.phone || 'N/A'}</p>
                        <p className="mb-0"><strong>Payment Method:</strong> {order.payment_method?.toUpperCase() || 'N/A'}</p>
                    </div>
                    <div className="col-md-6 ps-md-5">
                        <h5 className="fw-black mb-4">Order Summary</h5>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted fw-bold">Current Status</span>
                            <span className="badge bg-primary rounded-pill px-3 py-2 fw-black text-uppercase">{order.status}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted fw-bold">Total Amount</span>
                            <span className="fw-black text-primary fs-4">₹{order.total}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow-lg border-0 rounded-5 p-5 bg-white">
                <h5 className="fw-black mb-4">Ordered Items</h5>
                <div className="table-responsive">
                    <table className="table align-middle">
                        <thead>
                            <tr className="text-muted small fw-bold"><th>PRODUCT</th><th>SPEC</th><th>PRICE</th><th>QTY</th><th>SUBTOTAL</th></tr>
                        </thead>
                        <tbody>
                            {order.order_items?.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <div className="d-flex align-items-center gap-3">
                                                                                         <img src={item.product?.images?.[0]?.startsWith('http') ? item.product.images[0] : `${import.meta.env.VITE_STORAGE_URL}/${item.product?.images?.[0]}`} className="rounded-3 shadow-sm" width="50" height="50" style={{objectFit: 'cover'}} />                                            <span className="fw-bold">{item.product?.name}</span>
                                        </div>
                                    </td>
                                    <td className="small fw-bold text-muted">{item.size} / {item.color}</td>
                                    <td className="fw-bold">₹{item.price}</td>
                                    <td className="fw-bold">x {item.quantity}</td>
                                    <td className="fw-black text-primary">₹{(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;
