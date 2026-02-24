import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const ShowProduct = () => {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`/products/${slug}`);
                setProduct(response.data);
            } catch (error) {
                toast.error("Product not found");
            }
            setLoading(false);
        };
        fetchProduct();
    }, [slug]);

    if (loading) return <AdminLayout title="Product Details"><div className="text-center py-5"><div className="spinner-border text-primary"></div></div></AdminLayout>;
    if (!product) return <AdminLayout title="Product Details"><div className="text-center py-5"><h3>Product not found</h3><Link to="/admin/products" className="btn btn-primary rounded-pill mt-3">Back to List</Link></div></AdminLayout>;

    return (
        <AdminLayout title={`Viewing: ${product.name}`}>
            <div className="row g-5">
                <div className="col-lg-4">
                    <div className="card shadow-soft border-0 rounded-5 overflow-hidden mb-4">
                        <img 
                            src={product.images && product.images[0] ? (product.images[0].startsWith('http') ? product.images[0] : `${import.meta.env.VITE_STORAGE_URL}/${product.images[0]}`) : 'https://via.placeholder.com/400'} 
                            className="img-fluid" 
                            alt={product.name}
                        />
                    </div>
                    {product.images?.length > 1 && (
                        <div className="row g-2">
                            {product.images.slice(1).map((img, i) => (
                                <div className="col-4" key={i}>
                                    <img src={img.startsWith('http') ? img : `${import.meta.env.VITE_STORAGE_URL}/${img}`} className="img-fluid rounded-3 shadow-sm" alt="" />
                                </div>
                            ))}
                        </div>
                    )}
                    {product.video && (
                        <div className="mt-4">
                            <h6 className="fw-black mb-3">Product Video</h6>
                            <video controls className="w-100 rounded-4 shadow-sm">
                                <source src={`${import.meta.env.VITE_STORAGE_URL}/${product.video}`} type="video/mp4" />
                            </video>
                        </div>
                    )}
                </div>
                <div className="col-lg-8">
                    <div className="card shadow-2xl border-0 rounded-5 p-5 bg-white">
                        <div className="d-flex justify-content-between align-items-start mb-4">
                            <div>
                                <h2 className="fw-black text-dark mb-1">{product.name}</h2>
                                <p className="text-muted fw-bold">SKU / SLUG: <span className="text-primary">{product.slug}</span></p>
                            </div>
                            <span className={`badge rounded-pill px-4 py-2 fw-black ${product.status ? 'bg-success bg-opacity-10 text-success border border-success' : 'bg-danger bg-opacity-10 text-danger border border-danger'}`}>
                                {product.status ? 'LIVE ON STORE' : 'HIDDEN / DRAFT'}
                            </span>
                        </div>

                        <div className="row g-4 mb-5 bg-light p-4 rounded-4 border border-white">
                            <div className="col-md-3">
                                <small className="text-muted fw-bold d-block">CATEGORY</small>
                                <span className="fw-black">{product.category?.name}</span>
                            </div>
                            <div className="col-md-3">
                                <small className="text-muted fw-bold d-block">SUBCATEGORY</small>
                                <span className="fw-black">{product.subcategory?.name || 'N/A'}</span>
                            </div>
                            <div className="col-md-3">
                                <small className="text-muted fw-bold d-block">BRAND</small>
                                <span className="fw-black text-uppercase">{product.brand?.name}</span>
                            </div>
                            <div className="col-md-3">
                                <small className="text-muted fw-bold d-block">STOCK</small>
                                <span className="fw-black fs-5 text-dark">{product.stock} Units</span>
                            </div>
                        </div>

                        <div className="mb-5">
                            <h5 className="fw-black mb-3">Price Analysis</h5>
                            <div className="d-flex align-items-center gap-4">
                                <div>
                                    <small className="text-muted d-block fw-bold">Original Price</small>
                                    <span className="fs-3 fw-black text-muted text-decoration-line-through">${product.price}</span>
                                </div>
                                <div>
                                    <small className="text-muted d-block fw-bold">Discount Price</small>
                                    <span className="fs-2 fw-black text-primary">${product.discount_price || product.price}</span>
                                </div>
                                {product.discount_percentage && (
                                    <div className="bg-danger bg-opacity-10 text-danger px-3 py-2 rounded-pill fw-black">
                                        {product.discount_percentage}% OFF
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mb-5">
                            <h5 className="fw-black mb-3">Description</h5>
                            <p className="text-muted fw-semibold lh-lg">{product.description}</p>
                        </div>

                        {product.variations?.length > 0 && (
                            <div className="mb-5">
                                <h5 className="fw-black mb-3">Variations Matrix</h5>
                                <div className="table-responsive">
                                    <table className="table table-sm align-middle border">
                                        <thead className="bg-light">
                                            <tr><th>Color</th><th>Size</th><th>Price</th><th>Stock</th></tr>
                                        </thead>
                                        <tbody>
                                            {product.variations.map(v => (
                                                <tr key={v.id}>
                                                    <td className="fw-bold">{v.color}</td>
                                                    <td className="fw-bold">{v.size}</td>
                                                    <td className="fw-black text-primary">${v.price}</td>
                                                    <td className="fw-bold">{v.stock}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <div className="d-flex gap-3">
                            <Link to={`/admin/products`} className="btn btn-light rounded-pill px-5 fw-bold">Back to Repository</Link>
                            <Link to={`/product/${product.slug}`} target="_blank" className="btn btn-dark rounded-pill px-5 fw-bold">View Public Store Page</Link>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ShowProduct;
