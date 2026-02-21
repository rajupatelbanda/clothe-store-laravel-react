import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const PageBanner = ({ page, title = "" }) => {
    const [banner, setBanner] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const response = await api.get('/banners', { params: { page: page } });
                if (response.data && response.data.length > 0) {
                    setBanner(response.data[0]); // Take the latest active banner for this page
                }
            } catch (error) {}
            setLoading(false);
        };
        fetchBanner();
    }, [page]);

    if (loading) return <div className="bg-light w-100" style={{ height: '200px' }}></div>;
    if (!banner) return null;

    const imageUrl = banner.image.startsWith('http') ? banner.image : `${import.meta.env.VITE_STORAGE_URL}/${banner.image}`;

    return (
        <section className="p-0 position-relative mb-4 overflow-hidden border-bottom" style={{ height: '250px' }}>
            <img src={imageUrl} className="w-100 h-100 object-fit-cover position-absolute top-0 start-0" alt={banner.title} style={{ zIndex: 0 }} />
            <div className="container h-100 d-flex align-items-center position-relative" style={{ zIndex: 1 }}>
                <div className="bg-white bg-opacity-75 p-4 rounded-4 shadow-sm backdrop-blur" style={{ minWidth: '300px' }}>
                    <h6 className="text-primary fw-black text-uppercase small mb-1">{page} collection</h6>
                    <h2 className="fw-black text-dark mb-0 ls-tight">{banner.title || title}</h2>
                </div>
            </div>
            <style>{`
                .backdrop-blur { backdrop-filter: blur(10px); }
            `}</style>
        </section>
    );
};

export default PageBanner;
