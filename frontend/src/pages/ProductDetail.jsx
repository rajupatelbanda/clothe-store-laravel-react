import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const ProductDetail = () => {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
        const [displayPrice, setDisplayPrice] = useState(0);
        const [originalPrice, setOriginalPrice] = useState(0);
        const [activeStock, setActiveStock] = useState(0);
        const [mainImage, setMainImage] = useState('');
    
        const { user } = useContext(AuthContext);
        const [reviewRating, setReviewRating] = useState(5);
        const [reviewComment, setReviewComment] = useState('');
    
        const { addToCart } = useContext(CartContext);
        const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
        const navigate = useNavigate();
    
        useEffect(() => {
            const fetchProduct = async () => {
                setLoading(true);
                try {
                    const response = await api.get(`/products/${slug}`);
                    const data = response.data;
                    setProduct(data);
                    
                    // Initial prices
                    setOriginalPrice(parseFloat(data.price));
                    setDisplayPrice(parseFloat(data.discount_price || data.price));
                    setActiveStock(data.stock);
    
                                    const firstImg = data.images?.[0]?.startsWith('http') ? data.images[0] : `${import.meta.env.VITE_STORAGE_URL}/${data.images?.[0]}`;  
                                    setMainImage(firstImg || 'https://via.placeholder.com/800x1000');    
                    // Auto-select first available variation if applicable
                    if (data.variations?.length > 0) {
                        setSelectedColor(data.variations[0].color || '');
                        setSelectedSize(data.variations[0].size || '');
                    }
    
                    const similarRes = await api.get('/products', { params: { category: data.category_id, limit: 10 } });
                    setSimilarProducts(similarRes.data.data ? similarRes.data.data.filter(p => p.id !== data.id) : []);
                } catch (error) {
                    toast.error("Product not found");
                    navigate('/shop');
                }
                setLoading(false);
            };
            fetchProduct();
        }, [slug, navigate]);
    
        useEffect(() => {
            if (!product) return;
            const variation = product.variations?.find(v =>
                (!v.color || v.color === selectedColor) &&
                (!v.size || v.size === selectedSize)
            );
    
            if (variation) {
                const vPrice = parseFloat(variation.price);
                setOriginalPrice(vPrice);
                if (product.discount_percentage) {
                    const discounted = vPrice - (vPrice * product.discount_percentage / 100);
                    setDisplayPrice(discounted.toFixed(2));
                } else {
                    setDisplayPrice(vPrice.toFixed(2));
                }
                setActiveStock(variation.stock);
            } else {
                setOriginalPrice(parseFloat(product.price));
                setDisplayPrice(parseFloat(product.discount_price || product.price).toFixed(2));
                setActiveStock(product.stock);
            }
        }, [selectedSize, selectedColor, product]);
    const handleAddToCart = () => {
        if (activeStock <= 0) return toast.error('Out of stock');
        addToCart(product, selectedColor, selectedSize, quantity);
        toast.success('Added to your bag');
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) return toast.error('Login to post a review');
        try {
            await api.post('/reviews', { product_id: product.id, rating: reviewRating, comment: reviewComment });
            toast.success('Review submitted for approval!');
            setReviewComment('');
        } catch (error) { toast.error('Failed to post review'); }
    };

    if (loading) return (
        <div className="vh-100 d-flex align-items-center justify-content-center">
            <div className="spinner-border text-primary border-4" style={{width: '3rem', height: '3rem'}}></div>
        </div>
    );

    return (
        <div className="container-fluid px-lg-5 py-4 mt-5 animate-fade">
            <div className="row g-5 justify-content-center">
                {/* Visuals Column */}
                <div className="col-lg-5 col-xl-4">
                    <div className="sticky-top" style={{ top: '6rem' }}>
                        <div className="card border-0 bg-light rounded-4 overflow-hidden mb-3">
                            <img src={mainImage} className="w-100 object-fit-cover" alt={product.name} style={{ height: '550px' }} />
                        </div>
                        <div className="row g-2">
                            {product.images?.map((img, i) => {
                                const url = img.startsWith('http') ? img : `${import.meta.env.VITE_STORAGE_URL}/${img}`;
                                return (
                                    <div className="col-3" key={i}>
                                        <div 
                                            className={`card border-2 rounded-3 overflow-hidden cursor-pointer transition-all ${mainImage === url ? 'border-primary' : 'border-transparent'}`}
                                            onClick={() => setMainImage(url)}
                                        >
                                            <img src={url} className="w-100" style={{ height: '80px', objectFit: 'cover' }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {product.video && (
                            <div className="mt-4">
                                <h6 className="fw-black text-uppercase small opacity-50 mb-3">Experience the Fabric</h6>
                                <div className="rounded-4 overflow-hidden border">
                                    <video controls className="w-100 bg-dark" style={{maxHeight: '250px'}}>
                                        <source src={product.video.startsWith('http') ? product.video : `${import.meta.env.VITE_STORAGE_URL}/${product.video}`} type="video/mp4" />
                                    </video>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Details Column */}
                <div className="col-lg-6 col-xl-5">
                    <div className="mb-2">
                        <span className="text-muted text-uppercase fw-bold" style={{fontSize: '0.7rem', letterSpacing: '2px'}}>{product.brand?.name}</span>
                        <h1 className="fw-black text-dark mb-3 mt-1" style={{fontSize: '2.5rem'}}>{product.name}</h1>
                        <div className="d-flex align-items-center gap-3 mb-4">
                            <h2 className="fw-black text-primary mb-0">₹{displayPrice}</h2>
                            {product.discount_percentage > 0 && <span className="text-muted text-decoration-line-through fw-bold">₹{originalPrice}</span>}
                            <span className="badge bg-light text-dark border ms-2 rounded-pill px-3 py-2 small fw-bold">
                                {activeStock > 0 ? `${activeStock} in stock` : 'Out of Stock'}
                            </span>
                        </div>
                    </div>

                    <p className="text-muted mb-5 fw-semibold" style={{lineHeight: '1.8', opacity: '0.8'}}>{product.description}</p>

                    <div className="row g-4 mb-5">
                        {/* Variations could be dynamically generated here based on product.variations */}
                        <div className="col-12">
                            <h6 className="fw-black text-uppercase small mb-3">Select Variation</h6>
                            <div className="d-flex flex-wrap gap-2">
                                {/* Example logic: simplify to unique colors and sizes if variations exist */}
                                {[...new Set(product.variations?.map(v => v.color))].filter(c => c).map(color => (
                                    <button key={color} onClick={() => setSelectedColor(color)} className={`btn btn-sm rounded-pill px-4 border-2 ${selectedColor === color ? 'btn-primary' : 'btn-outline-dark'}`}>{color}</button>
                                ))}
                            </div>
                            <div className="d-flex flex-wrap gap-2 mt-3">
                                {[...new Set(product.variations?.map(v => v.size))].filter(s => s).map(size => (
                                    <button key={size} onClick={() => setSelectedSize(size)} className={`btn btn-sm rounded-pill px-4 border-2 ${selectedSize === size ? 'btn-primary' : 'btn-outline-dark'}`}>{size}</button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="d-flex gap-3 align-items-center mb-5 border-top border-bottom py-4">
                        <div className="d-flex align-items-center bg-light rounded-pill p-1">
                            <button className="btn btn-link text-dark p-0 px-3" onClick={() => setQuantity(Math.max(1, quantity - 1))}><i className="bi bi-dash-lg"></i></button>
                            <span className="fw-black px-2">{quantity}</span>
                            <button className="btn btn-link text-dark p-0 px-3" onClick={() => setQuantity(quantity + 1)}><i className="bi bi-plus-lg"></i></button>
                        </div>
                        <button className="btn btn-primary btn-lg flex-grow-1 rounded-pill py-3 fw-black shadow-primary" onClick={handleAddToCart} disabled={activeStock <= 0}>
                            {activeStock > 0 ? 'ADD TO BAG' : 'OUT OF STOCK'}
                        </button>
                        <button className={`btn rounded-circle p-3 shadow-sm border ${isInWishlist(product.id) ? 'bg-danger text-white' : 'bg-white'}`} onClick={() => toggleWishlist(product.id)}>
                            <i className={`bi bi-heart${isInWishlist(product.id) ? '-fill' : ''}`}></i>
                        </button>
                    </div>

                    {/* Social Share */}
                    <div className="mb-5">
                        <h6 className="fw-black text-uppercase small mb-3 opacity-50">Share with Friends</h6>
                        <div className="d-flex gap-2">
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-dark rounded-circle share-btn"><i className="bi bi-facebook"></i></a>
                            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(product.name)}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-dark rounded-circle share-btn"><i className="bi bi-twitter-x"></i></a>
                            <a href={`https://wa.me/?text=${encodeURIComponent(product.name + ' ' + window.location.href)}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-dark rounded-circle share-btn"><i className="bi bi-whatsapp"></i></a>
                            <button onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                toast.success('Link copied to clipboard!');
                            }} className="btn btn-outline-dark rounded-circle share-btn"><i className="bi bi-link-45deg"></i></button>
                        </div>
                    </div>

                    {/* Features Summary */}
                    <div className="row g-3 small fw-bold text-muted text-uppercase mb-5">
                        <div className="col-6"><i className="bi bi-truck text-primary me-2"></i>Express Delivery</div>
                        <div className="col-6"><i className="bi bi-shield-check text-primary me-2"></i>Secure Checkout</div>
                        <div className="col-6"><i className="bi bi-arrow-repeat text-primary me-2"></i>7 Day Returns</div>
                        <div className="col-6"><i className="bi bi-patch-check text-primary me-2"></i>Certified Quality</div>
                    </div>

                    {/* Reviews Mini Section */}
                    <div className="mt-5 pt-5 border-top">
                        <h5 className="fw-black mb-4">Customer Opinions ({product.reviews?.length || 0})</h5>
                        {product.reviews?.slice(0, 3).map(r => (
                            <div className="mb-4 bg-light p-4 rounded-4" key={r.id}>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="fw-black small">{r.user?.name}</span>
                                    <div className="text-warning x-small">
                                        {[...Array(5)].map((_, i) => <i key={i} className={`bi bi-star${i < r.rating ? '-fill' : ''}`}></i>)}
                                    </div>
                                </div>
                                <p className="small mb-0 opacity-75">{r.comment}</p>
                            </div>
                        ))}
                        
                        <div className="card border-0 bg-dark text-white p-5 rounded-5 mt-5">
                            <h5 className="fw-black mb-4">Post Feedback</h5>
                            <form onSubmit={handleReviewSubmit}>
                                <div className="mb-4">
                                    <div className="d-flex gap-2 text-warning fs-5 cursor-pointer mb-3">
                                        {[1,2,3,4,5].map(star => (<i key={star} className={`bi bi-star${reviewRating >= star ? '-fill' : ''}`} onClick={() => setReviewRating(star)}></i>))}
                                    </div>
                                    <textarea className="form-control bg-transparent border-secondary text-white rounded-4 p-3 shadow-none" rows="3" placeholder="Share your experience..." value={reviewComment} onChange={e => setReviewComment(e.target.value)} required></textarea>
                                </div>
                                <button className="btn btn-primary w-100 py-3 rounded-pill fw-black" type="submit">SUBMIT REVIEW</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Similar Items */}
            {similarProducts.length > 0 && (
                <div className="mt-5 pt-5 px-lg-5">
                    <h4 className="fw-black mb-4">You May Also Like</h4>
                    <div className="row g-3">
                        {similarProducts.slice(0, 4).map(p => (
                            <div className="col-md-3" key={p.id}>
                                <Link to={`/product/${p.slug}`} className="text-decoration-none group">
                                    <div className="card border-0 bg-white product-card">
                                        <div className="rounded-4 overflow-hidden mb-2" style={{ height: '250px' }}>
                                            <img src={p.images?.[0]?.startsWith('http') ? p.images[0] : `${import.meta.env.VITE_STORAGE_URL}/${p.images?.[0]}`} className="w-100 h-100 object-fit-cover transition-all" />
                                        </div>
                                        <h6 className="text-dark fw-bold mb-1 text-truncate">{p.name}</h6>
                                        <span className="text-primary fw-black small">₹{p.discount_price || p.price}</span>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <style>{`
                .cursor-pointer { cursor: pointer; }
                .x-small { font-size: 0.7rem; }
                .shadow-primary { box-shadow: 0 10px 20px -5px rgba(255, 94, 120, 0.4); }
                .share-btn {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }
                .share-btn:hover {
                    background-color: #ff5e78;
                    border-color: #ff5e78;
                    color: white;
                    transform: translateY(-3px);
                }
            `}</style>
        </div>
    );
};

export default ProductDetail;
