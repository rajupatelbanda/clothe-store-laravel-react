import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { WishlistContext } from '../context/WishlistContext';

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade'; // Example effect

// import required modules
import { Pagination, Navigation, Autoplay, EffectFade } from 'swiper/modules';

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [trendingProducts, setTrendingProducts] = useState([]);
    const [bestSales, setBestSales] = useState([]);
    const [categories, setCategories] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const { toggleWishlist, isInWishlist } = useContext(WishlistContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const results = await Promise.allSettled([
                    api.get('/products/featured'),
                    api.get('/categories'),
                    api.get('/banners', { params: { page: 'home' } }),
                    api.get('/products/trending'),
                    api.get('/coupons'),
                    api.get('/products', { params: { sort: 'price-low', limit: 10 } })
                ]);

                setFeaturedProducts(results[0].status === 'fulfilled' ? results[0].value.data : []);
                setCategories(results[1].status === 'fulfilled' ? results[1].value.data.slice(0, 6) : []);
                setBanners(results[2].status === 'fulfilled' ? results[2].value.data : []);
                setTrendingProducts(results[3].status === 'fulfilled' ? results[3].value.data : []);
                setCoupons(results[4].status === 'fulfilled' ? results[4].value.data : []);
                
                if (results[0].status === 'fulfilled') {
                    const allProds = results[0].value.data;
                    const sales = allProds.filter(p => p.discount_price).sort((a, b) => b.discount_percentage - a.discount_percentage);
                    setBestSales(sales.slice(0, 4));
                }
            } catch (error) {
                console.error("Failed to fetch home page data:", error);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    // Intersection Observer for scroll animations
    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, observerOptions);

        const revealElements = document.querySelectorAll('.reveal');
        revealElements.forEach(el => observer.observe(el));

        return () => revealElements.forEach(el => observer.unobserve(el));
    }, [loading, featuredProducts, banners]);

    const ProductCard = ({ product, idx, badge = null }) => (
        <div className={`col-md-6 col-lg-3 reveal delay-${(idx % 4) * 100}`} key={product.id}>
            <div className="card h-100 product-card border-0 position-relative bg-white shadow-hover">
                <button 
                    className={`wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`} 
                    onClick={() => toggleWishlist(product.id)} 
                    style={{
                        position:'absolute', 
                        top:'15px', 
                        right:'15px', 
                        zIndex:10, 
                        background:'rgba(255,255,255,0.9)', 
                        backdropFilter: 'blur(5px)',
                        border:'none', 
                        borderRadius:'50%', 
                        width:'40px', 
                        height:'40px', 
                        display:'flex', 
                        alignItems:'center', 
                        justifyContent:'center', 
                        boxShadow:'0 4px 15px rgba(0,0,0,0.1)', 
                        transition:'all 0.3s'
                    }}
                >
                    <i className={`bi ${isInWishlist(product.id) ? 'bi-heart-fill text-danger' : 'bi-heart text-dark'}`} style={{fontSize:'1.1rem'}}></i>
                </button>
                <div className="img-zoom-container position-relative" style={{ height: '320px', background: '#f8f8f8' }}>
                    <img
                        src={(product.images && product.images.length > 0) 
                            ? product.images[0] 
                            : `https://via.placeholder.com/320?text=${encodeURIComponent(product.name)}`}
                        className="w-100 h-100 object-fit-cover"
                        alt={product.name}
                    />
                    {badge && <span className="position-absolute top-0 start-0 m-3 badge bg-dark rounded-pill px-3 py-2 fw-black shadow-lg" style={{zIndex: 2}}>{badge}</span>}
                    {product.discount_price && <span className="position-absolute bottom-0 end-0 m-3 badge bg-danger rounded-pill px-3 py-2 fw-black shadow-lg" style={{zIndex: 2}}>{product.discount_percentage}% OFF</span>}
                </div>
                <div className="card-body p-4">
                    <span className="text-muted text-uppercase fw-black" style={{fontSize: '0.65rem', letterSpacing:'2px', opacity: 0.6}}>{product.brand?.name || 'GENERIC'}</span>
                    <h6 className="my-2 text-dark text-truncate fw-bold" style={{fontSize: '1rem'}}>{product.name}</h6>
                    <div className="d-flex align-items-center gap-2 mb-4">
                        <span className="fw-black text-primary fs-5">₹{product.discount_price || product.price}</span>
                        {product.discount_price && <span className="text-muted text-decoration-line-through small fw-bold">₹{product.price}</span>}
                    </div>
                    <Link to={`/product/${product.slug}`} className="btn btn-dark w-100 py-3 rounded-pill fw-black letter-spacing-wide shadow-sm" style={{fontSize:'0.75rem'}}>VIEW DETAILS</Link>
                </div>
            </div>
        </div>
    );

    return (
        <div className="home-wrapper">
            {/* Optimized Hero Section */}
            <section className="p-0 border-bottom overflow-hidden">
                {banners.length > 0 ? (
                    <Swiper
                        spaceBetween={30}
                        effect={'fade'}
                        centeredSlides={true}
                        autoplay={{
                            delay: 5000,
                            disableOnInteraction: false,
                        }}
                        pagination={{
                            clickable: true,
                        }}
                        navigation={true}
                        modules={[EffectFade, Autoplay, Pagination, Navigation]}
                        className="mySwiper"
                    >
                        {banners.map((banner, index) => (
                            <SwiperSlide key={banner.id}>
                                <div className="position-relative" style={{ height: '80vh' }}>
                                    <div className="img-zoom-container w-100 h-100">
                                        <img src={banner.image.startsWith('http') ? banner.image : `/storage/${banner.image}`} className="d-block w-100 h-100 object-fit-cover" alt={banner.title} style={{animation: 'zoomOut 10s infinite alternate'}} />
                                    </div>
                                    <div className="container h-100 d-flex align-items-center position-absolute top-0 start-0 end-0">
                                        <div className="col-lg-6 text-white p-5 reveal active" style={{background:'rgba(0,0,0,0.2)', backdropFilter:'blur(10px)', borderRadius:'30px', border:'1px solid rgba(255,255,255,0.1)'}}>
                                            <span className="badge bg-primary px-3 py-2 rounded-pill mb-3 fw-black tracking-widest animate-pulse-soft">NEW COLLECTION</span>
                                            <h1 className="display-3 fw-black mb-4 ls-tight text-white">{banner.title}</h1>
                                            <Link className="btn btn-primary btn-lg px-5 py-3 rounded-pill fw-black shadow-lg" to={banner.link || '/shop'}>EXPLORE SHOP <i className="bi bi-arrow-right ms-2"></i></Link>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                ) : (
                    <div className="bg-light py-5 text-center position-relative overflow-hidden" style={{minHeight: '70vh', display: 'flex', alignItems: 'center'}}>
                        <div className="container py-5 z-index-1">
                            <div className="reveal active">
                                <h1 className="display-2 fw-black text-dark mb-3 ls-tight">Redefining Modern <span className="text-primary animate-pulse-soft d-inline-block">Apparel</span></h1>
                                <p className="lead text-muted mb-5 fw-semibold opacity-75 mx-auto" style={{maxWidth: '700px'}}>Discover curated collections that blend high-fashion architecture with ultimate comfort.</p>
                                <Link className="btn btn-dark btn-lg px-5 py-3 rounded-pill fw-black shadow-lg" to="/shop">SHOP THE COLLECTION</Link>
                            </div>
                        </div>
                        <div className="position-absolute top-0 start-0 w-100 h-100 opacity-5" style={{zIndex: 0, backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")'}}></div>
                    </div>
                )}
            </section>

            {/* NEW: Coupon Showcase Section */}
            {coupons.length > 0 && (
                <section className="bg-dark py-4 overflow-hidden">
                    <div className="container">
                        <div className="d-flex align-items-center gap-4 overflow-auto pb-2 scrollbar-hidden reveal">
                            <h5 className="text-white fw-black mb-0 text-nowrap border-end pe-4 border-secondary">EXCLUSIVE OFFERS</h5>
                            {coupons.map(c => (
                                <div key={c.id} className="bg-primary text-white px-4 py-2 rounded-pill d-flex align-items-center gap-3 animate-float shadow-primary flex-shrink-0">
                                    <i className="bi bi-ticket-perforated-fill fs-5"></i>
                                    <div>
                                        <span className="fw-black d-block" style={{fontSize: '0.8rem'}}>{c.code}</span>
                                        <small className="fw-bold opacity-75" style={{fontSize: '0.65rem'}}>{c.type === 'percentage' ? `${c.value}% OFF` : `₹${c.value} OFF`}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Featured Selection */}
            <section className="container">
                <div className="d-flex justify-content-between align-items-end mb-5 reveal">
                    <div>
                        <h2 className="mb-1 fw-black">Featured Masterpieces</h2>
                        <p className="text-muted small fw-bold text-uppercase tracking-widest mb-0">Hand-picked by our stylists</p>
                    </div>
                    <Link to="/shop" className="btn btn-outline-dark rounded-pill px-4 fw-black small">VIEW ALL</Link>
                </div>
                <div className="row g-4">
                    {loading ? <div className="col-12 text-center py-5"><div className="spinner-border text-primary"></div></div> :
                    featuredProducts.slice(0, 4).map((p, i) => <ProductCard product={p} idx={i} key={p.id} />)}
                </div>
            </section>

            {/* NEW: Best Sales Section */}
            {bestSales.length > 0 && (
                <section className="bg-light border-top border-bottom">
                    <div className="container">
                        <div className="text-center mb-5 reveal">
                            <span className="badge bg-danger px-3 py-2 rounded-pill mb-3 fw-black shadow-sm">HOT DEALS</span>
                            <h2 className="fw-black mb-1">Best Sales of the Week</h2>
                            <p className="text-muted small fw-semibold">Premium quality at unbeatable prices</p>
                        </div>
                        <div className="row g-4">
                            {bestSales.map((p, i) => <ProductCard product={p} idx={i} key={p.id} badge="BEST PRICE" />)}
                        </div>
                    </div>
                </section>
            )}

            {/* Category Grid */}
            <section className="container">
                <div className="text-center mb-5 reveal">
                    <h2 className="fw-black mb-1 ls-tight">Explore by Taxonomy</h2>
                    <div className="bg-primary mx-auto rounded-pill mt-2" style={{width: '60px', height: '4px'}}></div>
                </div>
                <div className="row g-3">
                    {categories.map((cat, idx) => (
                        <div className="col-6 col-md-4 col-lg-2 reveal" style={{transitionDelay: `${idx * 100}ms`}} key={cat.id}>
                            <Link to={`/shop/${cat.slug}`} className="text-decoration-none">
                                <div className="card h-100 border-0 p-4 text-center bg-white shadow-soft hover-bg-primary group transition-all">
                                    <div className="icon-box mb-3 mx-auto rounded-circle d-flex align-items-center justify-content-center bg-light overflow-hidden animate-float" style={{width: '70px', height: '70px', animationDelay: `${idx * 0.2}s`}}>
                                        <img 
                                            src={cat.image || `https://via.placeholder.com/70?text=${encodeURIComponent(cat.name)}`} 
                                            alt={cat.name}
                                            className="w-100 h-100 object-fit-cover transition-all"
                                        />
                                    </div>
                                    <h6 className="mb-0 text-dark fw-black small text-uppercase tracking-widest">{cat.name}</h6>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* Trending Section */}
            <section className="bg-white border-top">
                <div className="container">
                    <div className="d-flex justify-content-between align-items-end mb-5 reveal">
                        <div>
                            <h2 className="mb-1 fw-black">Trending Now</h2>
                            <p className="text-muted small fw-bold text-uppercase tracking-widest mb-0">What everyone is buying</p>
                        </div>
                        <i className="bi bi-graph-up-arrow text-primary fs-3 opacity-25"></i>
                    </div>
                    <div className="row g-4">
                        {loading ? <div className="col-12 text-center py-5"><div className="spinner-border text-primary"></div></div> :
                        trendingProducts.slice(0, 4).map((p, i) => <ProductCard product={p} idx={i} key={p.id} badge="TRENDING" />)}
                    </div>
                </div>
            </section>

            {/* Services Minimal */}
            <section className="bg-light py-5">
                <div className="container">
                    <div className="row g-4 text-center">
                        {[
                            { title: 'Free Delivery', icon: 'truck', desc: 'Orders over ₹999' },
                            { title: 'Secure Payment', icon: 'shield-lock', desc: 'Razorpay Verified' },
                            { title: '24/7 Support', icon: 'headset', desc: 'Live Expert Chat' },
                            { title: 'Easy Returns', icon: 'arrow-repeat', desc: '7 Day Policy' }
                        ].map((s, idx) => (
                            <div className="col-6 col-md-3 reveal" key={idx} style={{transitionDelay: `${idx * 150}ms`}}>
                                <div className="p-4 bg-white rounded-4 shadow-sm border border-white border-opacity-50 h-100 transition-all hover-translate-up">
                                    <i className={`bi bi-${s.icon} text-primary fs-2 mb-3 d-block animate-float`} style={{animationDelay: `${idx * 0.3}s`}}></i>
                                    <h6 className="mb-1 fw-black small text-uppercase">{s.title}</h6>
                                    <small className="text-muted fw-bold">{s.desc}</small>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <style>{`
                @keyframes zoomOut {
                    from { transform: scale(1.1); }
                    to { transform: scale(1); }
                }
                .scrollbar-hidden::-webkit-scrollbar { display: none; }
                .scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }
                .shadow-soft { box-shadow: 0 10px 30px rgba(0,0,0,0.02) !important; }
                .shadow-hover:hover { box-shadow: 0 20px 40px rgba(0,0,0,0.08) !important; transform: translateY(-10px); }
                .hover-bg-primary:hover { background: var(--primary) !important; }
                .hover-bg-primary:hover h6 { color: white !important; }
                .hover-bg-primary:hover .icon-box { background: rgba(255,255,255,0.2) !important; }
                .tracking-widest { letter-spacing: 2px; }
                .z-index-1 { z-index: 1; position: relative; }
                .hover-translate-up:hover { transform: translateY(-10px); }
            `}</style>
        </div>
    );
};

export default Home;
