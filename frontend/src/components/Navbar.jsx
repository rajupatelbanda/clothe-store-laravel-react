import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { cart, cartTotal, removeFromCart } = useContext(CartContext);
    const { wishlist } = useContext(WishlistContext);
    const [settings, setSettings] = useState(null);
    const [pages, setPages] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sRes, pRes] = await Promise.all([
                    api.get('/settings'),
                    api.get('/pages')
                ]);
                setSettings(sRes.data);
                setPages(pRes.data);
            } catch (error) {}
        };
        fetchData();
    }, []);

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark sticky-top shadow-lg py-3 transition-all">
            <div className="container">
                <Link className="navbar-brand fw-black fs-2 d-flex align-items-center animate-left" to="/">
                    {settings?.logo ? (
                        <img src={`${import.meta.env.VITE_STORAGE_URL}/${settings.logo}`} alt="logo" height="60" className="me-3 rounded shadow-sm border border-white" />
                    ) : (
                        <div className="bg-white text-primary p-2 rounded-4 me-3 shadow-sm border border-white d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                            <i className="bi bi-bag-heart-fill fs-3"></i>
                        </div>
                    )}
                    <span className="text-white letter-spacing-tight small-caps">{settings?.site_name || 'Gemini Store'}</span>
                </Link>
                <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto ms-lg-5">
                        <li className="nav-item"><Link className="nav-link px-3 fw-bold text-white-50 hover-text-white transition-all" to="/">HOME</Link></li>
                        <li className="nav-item"><Link className="nav-link px-3 fw-bold text-white-50 hover-text-white transition-all" to="/shop">SHOP</Link></li>
                        {pages.map(page => (
                            <li className="nav-item" key={page.id}><Link className="nav-link px-3 fw-bold text-white-50 hover-text-white transition-all text-uppercase" to={`/page/${page.slug}`}>{page.title}</Link></li>
                        ))}
                    </ul>
                    <ul className="navbar-nav align-items-center gap-2">
                        <li className="nav-item">
                            <Link className="nav-link position-relative d-flex align-items-center justify-content-center bg-light rounded-circle shadow-sm hover-scale transition-all" to="/wishlist" title="Wishlist" style={{width: '45px', height: '45px'}}>
                                <i className="bi bi-heart-fill fs-5 text-dark"></i>
                                {wishlist.length > 0 && <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary text-white border border-2 border-white shadow-sm" style={{fontSize:'10px', zIndex: 5}}>{wishlist.length}</span>}
                            </Link>
                        </li>
                        <li className="nav-item cart-dropdown-wrapper">
                            <Link className="nav-link position-relative d-flex align-items-center justify-content-center bg-light rounded-circle shadow-sm hover-scale transition-all" to="/cart" title="Bag" style={{width: '45px', height: '45px'}}>
                                <i className="bi bi-bag-check-fill fs-5 text-dark"></i>
                                {cart.length > 0 && <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-dark text-white border border-2 border-white shadow-sm" style={{fontSize:'10px', zIndex: 5}}>{cart.length}</span>}
                            </Link>

                            {/* Mini Cart Dropdown */}
                            <div className="cart-dropdown shadow-xl border-0 rounded-4 p-3 bg-white">
                                <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                                    <h6 className="fw-black mb-0 small text-uppercase">Your Bag ({cart.length})</h6>
                                    <Link to="/cart" className="small fw-bold text-primary text-decoration-none">View All</Link>
                                </div>
                                <div className="cart-items-scroll overflow-auto" style={{maxHeight: '350px'}}>
                                    {cart.length === 0 ? (
                                        <div className="text-center py-4 text-muted small fw-bold">Bag is empty</div>
                                    ) : (
                                        cart.map((item, idx) => (
                                            <div key={`${item.id}-${idx}`} className="d-flex gap-3 mb-3 align-items-center border-bottom border-light pb-3 position-relative group">
                                                <img src={item.images?.[0]?.startsWith('http') ? item.images[0] : `${import.meta.env.VITE_STORAGE_URL}/${item.images?.[0]}`} alt={item.name} className="rounded-3 shadow-sm border" style={{width: '50px', height: '50px', objectFit: 'cover'}} />
                                                <div className="flex-grow-1 overflow-hidden pe-3">
                                                    <h6 className="fw-bold mb-0 text-truncate small">{item.name}</h6>
                                                    <div className="d-flex gap-2 small opacity-75 fw-bold" style={{fontSize: '0.7rem'}}>
                                                        <span>{item.size}</span>
                                                        <span>•</span>
                                                        <span>{item.color}</span>
                                                    </div>
                                                    <div className="d-flex justify-content-between align-items-center mt-1">
                                                        <span className="fw-black text-primary small">₹{item.price}</span>
                                                        <span className="badge bg-light text-dark border small fw-bold" style={{fontSize: '0.65rem'}}>x{item.quantity}</span>
                                                    </div>
                                                </div>
                                                <button 
                                                    className="btn btn-link text-danger p-0 position-absolute end-0 top-0 mt-1" 
                                                    onClick={(e) => { e.preventDefault(); removeFromCart(item.id, item.color, item.size); }}
                                                    title="Remove"
                                                >
                                                    <i className="bi bi-x-circle-fill"></i>
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                                {cart.length > 0 && (
                                    <div className="mt-3 pt-2">
                                        <div className="d-flex justify-content-between mb-3 fw-black small">
                                            <span>SUBTOTAL</span>
                                            <span className="text-primary">₹{cartTotal.toFixed(2)}</span>
                                        </div>
                                        <Link to="/checkout" className="btn btn-dark w-100 rounded-pill py-2 fw-black small">PROCEED TO CHECKOUT</Link>
                                    </div>
                                )}
                            </div>
                        </li>
                        {user ? (
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle text-white fw-bold d-flex align-items-center glass p-2 rounded-pill px-3 shadow-sm" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown">
                                    <img src={`https://ui-avatars.com/api/?name=${user.name}&background=FF5E78&color=fff`} alt="user" width="30" height="30" className="rounded-circle border border-2 border-white me-2" />
                                    {user.name.split(' ')[0]}
                                </a>
                                <ul className="dropdown-menu dropdown-menu-end shadow-xl border-0 rounded-4 p-2 mt-3 animate-up" aria-labelledby="navbarDropdown">
                                    {user.role === 'admin' && <li><Link className="dropdown-item rounded-3 py-2 fw-bold text-primary" to="/admin"><i className="bi bi-speedometer2 me-2"></i>DASHBOARD</Link></li>}
                                    <li><Link className="dropdown-item rounded-3 py-2 fw-semibold" to="/profile"><i className="bi bi-person-circle me-2"></i>PROFILE</Link></li>
                                    <li><Link className="dropdown-item rounded-3 py-2 fw-semibold" to="/orders"><i className="bi bi-bag-check me-2"></i>ORDERS</Link></li>
                                    <li><hr className="dropdown-divider opacity-10" /></li>
                                    <li><button className="dropdown-item rounded-3 py-2 fw-bold text-danger" onClick={handleLogout}><i className="bi bi-box-arrow-right me-2"></i>SIGN OUT</button></li>
                                </ul>
                            </li>
                        ) : (
                            <div className="d-flex align-items-center gap-2">
                                <li className="nav-item"><Link className="nav-link text-white-50 fw-bold px-3 transition-all hover-text-white" to="/login">LOGIN</Link></li>
                                <li className="nav-item"><Link className="btn btn-white bg-white text-primary rounded-pill px-4 fw-black shadow-lg transition-all hover-scale" to="/register">JOIN US</Link></li>
                            </div>
                        )}
                    </ul>
                </div>
            </div>
            <style>{`
                .small-caps { font-variant: small-caps; }
                .cart-dropdown-wrapper { position: relative; }
                .cart-dropdown {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    width: 320px;
                    z-index: 1000;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(10px);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    pointer-events: none;
                }
                .cart-dropdown-wrapper:hover .cart-dropdown {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                    pointer-events: auto;
                }
                .cart-items-scroll::-webkit-scrollbar { width: 4px; }
                .cart-items-scroll::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
            `}</style>
        </nav>
    );
};

export default Navbar;
