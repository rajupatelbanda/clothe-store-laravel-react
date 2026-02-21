import React, { useContext } from 'react';
import { WishlistContext } from '../context/WishlistContext';
import { Link } from 'react-router-dom';
import PageBanner from '../components/PageBanner';

const Wishlist = () => {
    const { wishlist, toggleWishlist, loading } = useContext(WishlistContext);

    if (loading) return (
        <div className="vh-100 d-flex align-items-center justify-content-center">
            <div className="spinner-border text-primary" role="status"></div>
        </div>
    );

    return (
        <div className="animate-fade">
            <PageBanner page="wishlist" title="Saved Favorites" />
            <div className="container py-4">
                <h1 className="display-5 fw-black text-dark mb-5 border-bottom pb-3 text-primary">Your Wishlist</h1>
                {wishlist.length === 0 ? (
                    <div className="text-center py-5 bg-white rounded-5 shadow-sm mt-5">
                        <i className="bi bi-heart-break fs-1 text-muted mb-3 d-block"></i>
                        <h3 className="fw-bold">Your wishlist is empty</h3>
                        <p className="text-muted">Save items you love here and they'll be waiting for you!</p>
                        <Link to="/shop" className="btn btn-primary rounded-pill px-5 mt-4 fw-bold shadow-lg">Start Shopping</Link>
                    </div>
                ) : (
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
                        {wishlist.map(item => {
                            const product = item.product;
                            return (
                                <div className="col" key={item.id}>
                                    <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden hover-scale p-2 position-relative bg-white">
                                        <button className="wishlist-btn active text-white" onClick={() => toggleWishlist(product.id)}>
                                            <i className="bi bi-heart-fill"></i>
                                        </button>
                                        <div className="position-relative overflow-hidden rounded-3" style={{ height: '240px' }}>
                                            <img 
                                                src={product.images && product.images.length > 0 ? (product.images[0].startsWith('http') ? product.images[0] : `${import.meta.env.VITE_STORAGE_URL}/${product.images[0]}`) : `https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000`} 
                                                className="card-img-top w-100 h-100 object-fit-cover transition-all" 
                                                alt={product.name} 
                                            />
                                        </div>
                                        <div className="card-body d-flex flex-column p-3">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <span className="fw-bold text-primary fs-5">₹{product.price}</span>
                                            </div>
                                            <h6 className="card-title fw-bold mb-3 text-dark">{product.name}</h6>
                                            <Link to={`/product/${product.slug}`} className="btn btn-outline-dark w-100 rounded-pill py-2 fw-bold mt-auto transition-all">View Details</Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
