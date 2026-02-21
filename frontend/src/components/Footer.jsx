import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';

const Footer = () => {
    const [settings, setSettings] = useState(null);
    const [pages, setPages] = useState([]);

    useEffect(() => {
        const fetchFooterData = async () => {
            try {
                const [sRes, pRes] = await Promise.all([
                    api.get('/settings'),
                    api.get('/pages')
                ]);
                setSettings(sRes.data);
                setPages(pRes.data);
            } catch (error) {}
        };
        fetchFooterData();
    }, []);

    return (
        <footer className="bg-dark text-white pt-5 pb-4 mt-5">
            <div className="container">
                <div className="row g-4">
                    {/* Column 1: Brand Info */}
                    <div className="col-lg-3 col-md-6">
                        <div className="footer__logo mb-4">
                            <Link to="/">
                                {settings?.logo ? (
                                    <img src={`${import.meta.env.VITE_STORAGE_URL}/${settings.logo}`} alt="logo" height="40" className="me-2 rounded shadow-sm border border-white" />
                                ) : (
                                    <h4 className="fw-black text-primary mb-0">{settings?.site_name || 'Gemini Store'}</h4>
                                )}
                            </Link>
                        </div>
                        <p className="text-white-50 fw-bold">Your destination for premium fashion. Quality apparel delivered right to your doorstep with confidence.</p>
                        <div className="d-flex gap-3 mt-4">
                            {settings?.social_links?.facebook && <a href={settings.social_links.facebook} className="btn btn-outline-light btn-sm rounded-circle p-2"><i className="bi bi-facebook fs-5 px-1"></i></a>}
                            {settings?.social_links?.twitter && <a href={settings.social_links.twitter} className="btn btn-outline-light btn-sm rounded-circle p-2"><i className="bi bi-twitter fs-5 px-1"></i></a>}
                            {settings?.social_links?.instagram && <a href={settings.social_links.instagram} className="btn btn-outline-light btn-sm rounded-circle p-2"><i className="bi bi-instagram fs-5 px-1"></i></a>}
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div className="col-lg-3 col-md-6">
                        <h5 className="fw-black mb-4 border-bottom border-primary border-2 pb-2 d-inline-block">Shop Links</h5>
                        <ul className="list-unstyled fw-bold opacity-75">
                            <li className="mb-2"><Link to="/shop" className="text-white text-decoration-none hover-text-primary transition-all">• All Collections</Link></li>
                            <li className="mb-2"><Link to="/shop" className="text-white text-decoration-none hover-text-primary transition-all">• New Arrivals</Link></li>
                            <li className="mb-2"><Link to="/wishlist" className="text-white text-decoration-none hover-text-primary transition-all">• My Wishlist</Link></li>
                            <li className="mb-2"><Link to="/cart" className="text-white text-decoration-none hover-text-primary transition-all">• Shopping Cart</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Policy Pages */}
                    <div className="col-lg-3 col-md-6">
                        <h5 className="fw-black mb-4 border-bottom border-primary border-2 pb-2 d-inline-block">Information</h5>
                        <ul className="list-unstyled fw-bold opacity-75">
                            {pages.map(page => (
                                <li className="mb-2" key={page.id}>
                                    <Link to={`/page/${page.slug}`} className="text-white text-decoration-none hover-text-primary transition-all">• {page.title}</Link>
                                </li>
                            ))}
                            <li className="mb-2"><Link to="/login" className="text-white text-decoration-none hover-text-primary transition-all">• Customer Login</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Contact Info */}
                    <div className="col-lg-3 col-md-6">
                        <h5 className="fw-black mb-4 border-bottom border-primary border-2 pb-2 d-inline-block">Contact Us</h5>
                        <ul className="list-unstyled fw-bold opacity-75">
                            <li className="mb-3 d-flex gap-2">
                                <i className="bi bi-geo-alt-fill text-primary"></i>
                                <span>{settings?.address || '123 Fashion St, NY'}</span>
                            </li>
                            <li className="mb-3 d-flex gap-2">
                                <i className="bi bi-telephone-fill text-primary"></i>
                                <span>{settings?.phone || '+1 234 567 890'}</span>
                            </li>
                            <li className="mb-3 d-flex gap-2">
                                <i className="bi bi-envelope-fill text-primary"></i>
                                <span className="small">{settings?.email || 'support@store.com'}</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <hr className="my-5 opacity-10" />
                <div className="row align-items-center">
                    <div className="col-md-6 text-center text-md-start">
                        <p className="mb-0 text-white-50 small fw-bold">© 2026 {settings?.site_name}. All Rights Reserved. Built with Cloth Pro Engine.</p>
                    </div>
                    <div className="col-md-6 text-center text-md-end mt-3 mt-md-0">
                        <img src="https://help.razorpay.com/hc/article_attachments/900001431003/Accept_payments_using_Razorpay.png" height="30" alt="Payments" className="opacity-50 grayscale hover-grayscale-0 transition-all" />
                    </div>
                </div>
            </div>
            <style>{`
                .hover-text-primary:hover { color: var(--primary) !important; transform: translateX(5px); }
                .grayscale { filter: grayscale(100%); }
                .hover-grayscale-0:hover { filter: grayscale(0%); }
            `}</style>
        </footer>
    );
};

export default Footer;
