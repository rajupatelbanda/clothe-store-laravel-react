import React, { useState, useEffect, useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import PageBanner from '../components/PageBanner';

const Checkout = () => {
    const { cart, cartTotal, subtotal, shipping, discount, appliedCoupon, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState(user?.phone || '');
    const [paymentMethod, setPaymentMethod] = useState('razorpay');
    const navigate = useNavigate();

    useEffect(() => {
        if (cart.length === 0) navigate('/cart');
        
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
    }, [cart, navigate]);

    const handleCheckout = async (e) => {
        e.preventDefault();
        if (paymentMethod === 'razorpay') {
            handleRazorpayPayment();
        } else {
            handleCODPayment();
        }
    };

    const handleRazorpayPayment = async () => {
        setLoading(true);
        const loadToast = toast.loading('Initiating secure payment...');

        try {
            const { data: order } = await api.post('/razorpay/order', { amount: cartTotal });

            const options = {
                key: "rzp_test_SIRA3SP2Y6SQbk", 
                amount: order.amount,
                currency: order.currency,
                name: "Gemini Cloth Store",
                description: "Apparel Purchase",
                order_id: order.id,
                handler: async (response) => {
                    const verifyRes = await api.post('/razorpay/verify', {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature
                    });

                    if (verifyRes.data.status === 'success') {
                        await placeOrder('razorpay', response.razorpay_payment_id, 'paid');
                        toast.success('Order placed successfully!', { id: loadToast });
                        clearCart();
                        navigate('/');
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: phone
                },
                theme: { color: "#FF5E78" }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
            setLoading(false);
            toast.dismiss(loadToast);
        } catch (error) {
            toast.error('Payment initialization failed', { id: loadToast });
            setLoading(false);
        }
    };

    const handleCODPayment = async () => {
        setLoading(true);
        const loadToast = toast.loading('Placing your order...');
        try {
            await placeOrder('cod', null, 'unpaid');
            toast.success('Order placed successfully! Pay on delivery.', { id: loadToast });
            clearCart();
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Order failed', { id: loadToast });
            setLoading(false);
        }
    };

    const placeOrder = async (method, paymentId, paymentStatus) => {
        return await api.post('/orders', {
            items: cart.map(item => ({
                product_id: item.id,
                quantity: item.quantity,
                price: item.price,
                color: item.color,
                size: item.size
            })),
            total: cartTotal,
            shipping: shipping,
            address: address,
            phone: phone,
            payment_method: method,
            payment_id: paymentId,
            payment_status: paymentStatus,
            coupon_id: appliedCoupon?.id || null
        });
    };

    return (
        <div className="animate-fade">
            <PageBanner page="checkout" title="Finalize Order" />
            <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-md-7">
                    <div className="card shadow-2xl border-0 rounded-5 p-5 bg-white">
                        <div className="text-center mb-5">
                            <h2 className="fw-black text-dark letter-spacing-tight">Complete Order</h2>
                            <p className="text-muted fw-bold">Select your preferred payment method</p>
                        </div>
                        <form onSubmit={handleCheckout}>
                            <div className="mb-4">
                                <label className="form-label fw-black small text-muted text-uppercase">Delivery Address</label>
                                <textarea className="form-control rounded-4 border-0 bg-light p-3 shadow-none fw-bold" rows="3" required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full street address, city, state, zip"></textarea>
                            </div>
                            <div className="mb-4">
                                <label className="form-label fw-black small text-muted text-uppercase">Mobile Number</label>
                                <input type="text" className="form-control rounded-pill border-0 bg-light p-3 shadow-none fw-bold" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 XXXXXXXXXX" />
                            </div>

                            <div className="mb-5">
                                <label className="form-label fw-black small text-muted text-uppercase mb-3">Payment Method</label>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div 
                                            className={`p-4 rounded-4 border-2 cursor-pointer transition-all ${paymentMethod === 'razorpay' ? 'border-primary bg-primary bg-opacity-10' : 'border-light bg-light'}`}
                                            onClick={() => setPaymentMethod('razorpay')}
                                        >
                                            <div className="form-check">
                                                <input className="form-check-input" type="radio" checked={paymentMethod === 'razorpay'} readOnly />
                                                <label className="form-check-label fw-black">Online Payment</label>
                                            </div>
                                            <small className="text-muted d-block mt-2">Pay securely via Razorpay (Cards, UPI, NetBanking)</small>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div 
                                            className={`p-4 rounded-4 border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary bg-primary bg-opacity-10' : 'border-light bg-light'}`}
                                            onClick={() => setPaymentMethod('cod')}
                                        >
                                            <div className="form-check">
                                                <input className="form-check-input" type="radio" checked={paymentMethod === 'cod'} readOnly />
                                                <label className="form-check-label fw-black">Cash on Delivery</label>
                                            </div>
                                            <small className="text-muted d-block mt-2">Pay with cash when your order is delivered</small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-light p-4 rounded-4 mb-5 border border-white">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="fw-bold text-muted small">Subtotal</span>
                                    <span className="fw-black">₹{subtotal.toFixed(2)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="fw-bold text-success small">Discount ({appliedCoupon?.code})</span>
                                        <span className="fw-black text-success">-₹{discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="d-flex justify-content-between">
                                    <span className="fw-bold text-muted small">Delivery</span>
                                    <span className={shipping === 0 ? "text-success fw-black" : "fw-black text-dark"}>
                                        {shipping === 0 ? 'FREE' : `₹${shipping}`}
                                    </span>
                                </div>
                                <hr className="opacity-10" />
                                <div className="d-flex justify-content-between">
                                    <span className="fw-black fs-5">GRAND TOTAL</span>
                                    <span className="fw-black fs-5 text-primary">₹{cartTotal.toFixed(2)}</span>
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-100 py-3 rounded-pill fw-black shadow-lg text-uppercase">
                                {loading ? 'Processing...' : (paymentMethod === 'cod' ? 'Place COD Order' : `Pay ₹${cartTotal.toFixed(2)} Now`)}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
};

export default Checkout;
