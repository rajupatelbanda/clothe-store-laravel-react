import React, { useState, useEffect, useContext, useCallback } from 'react';
import api from '../utils/api';
import { Link, useSearchParams, useParams } from 'react-router-dom';
import { WishlistContext } from '../context/WishlistContext';
import PageBanner from '../components/PageBanner';

const Shop = () => {
    const { categorySlug } = useParams();
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const { toggleWishlist, isInWishlist } = useContext(WishlistContext);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Multi-select Filters
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState(100000); // Increased for INR
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        fetchMetadata();
    }, []);

    useEffect(() => {
        if (categorySlug && categories.length > 0) {
            const cat = categories.find(c => c.slug === categorySlug);
            if (cat) setSelectedCategories([cat.id.toString()]);
        }
    }, [categorySlug, categories]);

    const fetchMetadata = async () => {
        try {
            const [cRes, bRes] = await Promise.all([
                api.get('/categories'),
                api.get('/brands')
            ]);
            setCategories(cRes.data);
            setBrands(bRes.data);
        } catch (error) {}
    };

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/products', {
                params: {
                    page: currentPage,
                    categories: selectedCategories.join(','), // Adjusted for multi-select
                    brands: selectedBrands.join(','),         // Adjusted for multi-select
                    search: searchQuery,
                    price_max: priceRange,
                    sort: sortBy,
                    admin: 1 // To get all active products
                }
            });
            
            if (response.data.data) {
                setProducts(response.data.data);
                setTotalPages(response.data.last_page);
            } else {
                setProducts(response.data);
                setTotalPages(1);
            }
        } catch (error) {
            setProducts([]);
        }
        setLoading(false);
    }, [currentPage, selectedCategories, selectedBrands, searchQuery, priceRange, sortBy]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchProducts]);

    const handleCategoryChange = (id) => {
        const idStr = id.toString();
        setSelectedCategories(prev => 
            prev.includes(idStr) ? prev.filter(i => i !== idStr) : [...prev, idStr]
        );
        setCurrentPage(1);
    };

    const handleBrandChange = (id) => {
        const idStr = id.toString();
        setSelectedBrands(prev => 
            prev.includes(idStr) ? prev.filter(i => i !== idStr) : [...prev, idStr]
        );
        setCurrentPage(1);
    };

    const resetFilters = () => {
        setSelectedCategories([]);
        setSelectedBrands([]);
        setSearchQuery('');
        setPriceRange(100000);
        setSortBy('newest');
        setCurrentPage(1);
    };

    return (
        <div className="animate-fade">
            <PageBanner page="shop" title="Modern Collections" />
            <div className="container-fluid px-lg-5 py-4">
            <div className="row g-4">
                {/* Modern Sidebar */}
                <div className="col-lg-3 col-xl-2">
                    <div className="sticky-top" style={{ top: '6rem' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h6 className="fw-black text-uppercase mb-0">Filters</h6>
                            <button className="btn btn-link btn-sm text-muted p-0 fw-bold text-decoration-none" onClick={resetFilters}>Clear All</button>
                        </div>

                        {/* Search */}
                        <div className="mb-4">
                            <div className="input-group bg-light rounded-3 overflow-hidden border">
                                <span className="input-group-text bg-transparent border-0"><i className="bi bi-search small"></i></span>
                                <input type="text" className="form-control border-0 bg-transparent py-2 small shadow-none" placeholder="Search product..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                            </div>
                        </div>

                        {/* Categories Checkboxes */}
                        <div className="mb-4">
                            <h6 className="fw-bold small text-uppercase mb-3">Categories</h6>
                            <div className="overflow-auto" style={{ maxHeight: '200px' }}>
                                {categories.map(cat => (
                                    <div className="form-check mb-2" key={cat.id}>
                                        <input className="form-check-input shadow-none" type="checkbox" checked={selectedCategories.includes(cat.id.toString())} onChange={() => handleCategoryChange(cat.id)} id={`cat-${cat.id}`} />
                                        <label className="form-check-label small fw-semibold cursor-pointer" htmlFor={`cat-${cat.id}`}>
                                            {cat.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Brands Checkboxes */}
                        <div className="mb-4">
                            <h6 className="fw-bold small text-uppercase mb-3">Brands</h6>
                            <div className="overflow-auto" style={{ maxHeight: '200px' }}>
                                {brands.map(brand => (
                                    <div className="form-check mb-2" key={brand.id}>
                                        <input className="form-check-input shadow-none" type="checkbox" checked={selectedBrands.includes(brand.id.toString())} onChange={() => handleBrandChange(brand.id)} id={`brand-${brand.id}`} />
                                        <label className="form-check-label small fw-semibold cursor-pointer" htmlFor={`brand-${brand.id}`}>
                                            {brand.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <h6 className="fw-bold small text-uppercase mb-0">Max Price</h6>
                                <span className="small fw-black text-primary">₹{priceRange}</span>
                            </div>
                            <input type="range" className="form-range" min="0" max="100000" step="500" value={priceRange} onChange={(e) => setPriceRange(e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* Product Section */}
                <div className="col-lg-9 col-xl-10">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="fw-black mb-0">Shop <span className="text-muted opacity-50">/ All Items</span></h5>
                        <div className="d-flex align-items-center gap-3">
                            <span className="small text-muted fw-bold text-uppercase d-none d-md-inline" style={{fontSize:'0.7rem'}}>Sort:</span>
                            <select className="form-select form-select-sm border-0 bg-light shadow-none fw-bold rounded-pill px-3" style={{width: '180px'}} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="newest">Newest First</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="a-z">Name: A-Z</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5 vh-50 d-flex align-items-center justify-content-center">
                            <div className="spinner-border text-primary" role="status"></div>
                        </div>
                    ) : products.length > 0 ? (
                        <>
                            <div className="row g-3">
                                {products.map((product, idx) => (
                                    <div className="col-sm-6 col-md-4 col-xl-3 reveal-item" key={product.id} style={{ animationDelay: `${idx * 0.05}s` }}>
                                        <div className="card h-100 border-0 product-card">
                                            <div className="position-relative overflow-hidden" style={{ height: '300px', background: '#f8f8f8' }}>
                                                <button className={`wishlist-btn border-0 shadow-sm ${isInWishlist(product.id) ? 'active' : ''}`} onClick={() => toggleWishlist(product.id)} style={{position:'absolute', top:'12px', right:'12px', zIndex:5, background:'white', borderRadius:'50%', width:'35px', height:'35px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                                    <i className={`bi ${isInWishlist(product.id) ? 'bi-heart-fill text-danger' : 'bi-heart'}`}></i>
                                                </button>
                                                <Link to={`/product/${product.slug}`}>
                                                    <img 
                                                        src={product.images && product.images[0] ? (product.images[0].startsWith('http') ? product.images[0] : `${import.meta.env.VITE_STORAGE_URL}/${product.images[0]}`) : `https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1000`} 
                                                        className="w-100 h-100 object-fit-cover transition-all" 
                                                        alt={product.name} 
                                                    />
                                                </Link>
                                                {product.discount_price && <span className="position-absolute top-0 start-0 m-2 badge bg-danger rounded-pill px-2">SALE</span>}
                                            </div>
                                            <div className="card-body px-0 pt-3">
                                                <p className="text-muted text-uppercase fw-bold mb-1" style={{fontSize: '0.6rem', letterSpacing: '1.5px'}}>{product.category?.name}</p>
                                                <Link to={`/product/${product.slug}`} className="text-decoration-none"><h6 className="text-dark fw-bold mb-2 text-truncate">{product.name}</h6></Link>
                                                <div className="d-flex align-items-center gap-2">
                                                    <span className="fw-black text-primary">₹{product.discount_price || product.price}</span>
                                                    {product.discount_price && <span className="text-muted text-decoration-line-through small" style={{fontSize: '0.7rem'}}>₹{product.price}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="d-flex justify-content-center mt-5 gap-2">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button key={i} className={`btn btn-sm rounded-3 fw-bold ${currentPage === i+1 ? 'btn-primary shadow-sm' : 'btn-light'}`} style={{width: '40px', height: '40px'}} onClick={() => {setCurrentPage(i+1); window.scrollTo(0,0);}}>{i+1}</button>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-5">
                            <i className="bi bi-search fs-1 text-muted opacity-25"></i>
                            <h5 className="mt-3 fw-bold">No products match your filters</h5>
                            <button className="btn btn-primary btn-sm mt-3" onClick={resetFilters}>Reset Filters</button>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                .product-card { transition: transform 0.3s; }
                .product-card:hover { transform: translateY(-5px); }
                .cursor-pointer { cursor: pointer; }
                .form-check-input:checked { background-color: var(--primary); border-color: var(--primary); }
            `}</style>
            </div>
        </div>
    );
};

export default Shop;
