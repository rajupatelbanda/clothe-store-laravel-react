import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import PageBanner from '../components/PageBanner';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, subtotal, shipping, discount, appliedCoupon, cartTotal, applyCoupon, removeCoupon } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const [couponCode, setCouponCode] = useState('');
    const navigate = useNavigate();

    const handleCheckout = () => {
        if (!user) {
            toast.error('Please login to continue checkout');
            navigate('/login');
        } else if (cart.length === 0) {
            toast.error('Your cart is empty');
        } else {
            navigate('/checkout');
        }
    };

    const handleApplyCoupon = async (e) => {
        e.preventDefault();
        if (!couponCode) return;
        await applyCoupon(couponCode);
        setCouponCode('');
    };

    return (
        <div className="animate-fade">
            <PageBanner page="cart" title="Shopping Bag" />
            <div className="container py-4">
            <h2 className="mb-5 fw-black text-dark letter-spacing-tight">Your Shopping <span className="text-primary">Bag</span></h2>
            {!cart || cart.length === 0 ? (
                <div className="card shadow-2xl border-0 rounded-5 p-5 text-center bg-white">
                    <i className="bi bi-bag-x fs-1 text-muted mb-3 d-block opacity-25"></i>
                    <h3 className="fw-black text-dark">Your bag is empty</h3>
                    <p className="text-muted">Looks like you haven't added any items yet.</p>
                    <Link to="/shop" className="btn btn-primary rounded-pill px-5 mt-4 fw-black shadow-lg">START SHOPPING</Link>
                </div>
            ) : (
                <div className="row g-5">
                    <div className="col-lg-8">
                        <div className="card shadow-soft border-0 rounded-5 p-4 bg-white border border-light">
                            <div className="table-responsive">
                                <table className="table align-middle">
                                    <thead>
                                        <tr className="text-muted small fw-black border-bottom">
                                            <th className="py-3">PRODUCT</th>
                                            <th className="py-3">PRICE</th>
                                            <th className="py-3">QTY</th>
                                            <th className="py-3">TOTAL</th>
                                            <th className="py-3 text-end">REMOVE</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cart.map(item => (
                                            <tr key={`${item.id}-${item.color}-${item.size}`} className="border-bottom">
                                                <td className="py-4">
                                                    <div className="d-flex align-items-center">
                                                        <img 
                                                            src={item.images && item.images[0] ? (item.images[0].startsWith('http') ? item.images[0] : `${import.meta.env.VITE_STORAGE_URL}/${item.images[0]}`) : 'https://via.placeholder.com/100'} 
                                                            className="img-fluid rounded-4 shadow-sm me-3 object-fit-cover" 
                                                            style={{ width: '80px', height: '80px' }}
                                                            alt={item.name}
                                                        />
                                                        <div>
                                                            <h6 className="fw-bold mb-1 text-dark">{item.name}</h6>
                                                            <small className="text-muted fw-bold">{item.size} / {item.color}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 fw-black text-primary">₹{item.price}</td>
                                                <td className="py-4">
                                                    <div className="d-flex align-items-center bg-light rounded-pill p-1" style={{ width: '100px' }}>
                                                        <button className="btn btn-link text-dark p-0 px-2 text-decoration-none shadow-none" onClick={() => updateQuantity(item.id, item.color, item.size, Math.max(1, item.quantity - 1))}><i className="bi bi-dash-lg" style={{fontSize: '0.8rem'}}></i></button>
                                                        <span className="fw-black flex-grow-1 text-center small">{item.quantity}</span>
                                                        <button className="btn btn-link text-dark p-0 px-2 text-decoration-none shadow-none" onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity + 1)}><i className="bi bi-plus-lg" style={{fontSize: '0.8rem'}}></i></button>
                                                    </div>
                                                </td>
                                                <td className="py-4 fw-black text-dark">₹{(item.price * item.quantity).toFixed(2)}</td>
                                                <td className="py-4 text-end">
                                                    <button className="btn btn-sm btn-light text-danger rounded-circle p-2 shadow-sm" onClick={() => removeFromCart(item.id, item.color, item.size)}>
                                                        <i className="bi bi-trash3-fill"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="card shadow-2xl border-0 rounded-5 bg-white p-5 sticky-top border border-light" style={{ top: '6rem' }}>
                            <h4 className="fw-black mb-4">Summary</h4>
                            
                            {/* Coupon Section */}
                            <div className="mb-4">
                                <label className="form-label fw-bold small text-muted text-uppercase mb-2">Have a coupon?</label>
                                {appliedCoupon ? (
                                    <div className="bg-success bg-opacity-10 p-3 rounded-4 border border-success border-opacity-25 d-flex justify-content-between align-items-center">
                                        <div>
                                            <span className="fw-black text-success d-block small">{appliedCoupon.code}</span>
                                            <small className="text-success fw-bold">Coupon Applied</small>
                                        </div>
                                        <button className="btn btn-link text-danger p-0" onClick={removeCoupon}><i className="bi bi-x-circle-fill"></i></button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleApplyCoupon} className="input-group">
                                        <input type="text" className="form-control rounded-start-pill border-0 bg-light px-3 fw-bold shadow-none" placeholder="SAVE20" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                                        <button className="btn btn-dark rounded-end-pill px-3 fw-black" type="submit">APPLY</button>
                                    </form>
                                )}
                            </div>

                            <div className="d-flex justify-content-between mb-3 fw-bold text-muted">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="d-flex justify-content-between mb-3 fw-bold text-success">
                                    <span>Discount</span>
                                    <span>-₹{discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="d-flex justify-content-between mb-3 fw-bold text-muted">
                                <span>Shipping</span>
                                <span className={shipping === 0 ? "text-success" : "text-dark"}>
                                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                                </span>
                            </div>
                            {shipping > 0 && (
                                <p className="x-small fw-bold text-primary mb-3">Add ₹{999 - subtotal} more for FREE delivery!</p>
                            )}
                            <hr className="my-4 opacity-10" />
                            <div className="d-flex justify-content-between mb-5">
                                <span className="fw-black fs-4">Total</span>
                                <span className="fw-black fs-4 text-primary">₹{cartTotal.toFixed(2)}</span>
                            </div>
                            <button className="btn btn-primary btn-lg w-100 py-3 rounded-pill fw-black shadow-lg" onClick={handleCheckout}>GO TO CHECKOUT <i className="bi bi-arrow-right-short fs-3"></i></button>
                            <Link to="/shop" className="btn btn-link w-100 mt-3 text-decoration-none text-muted fw-bold small">Continue Shopping</Link>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default Cart;
