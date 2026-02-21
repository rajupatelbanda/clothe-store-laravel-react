import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';

const Page = () => {
    const { slug } = useParams();
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPage = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/pages/${slug}`);
                setPage(response.data);
            } catch (error) {
                console.error("Error fetching page", error);
            }
            setLoading(false);
        };
        fetchPage();
    }, [slug]);

    if (loading) return <div className="container py-5 mt-5 text-center"><div className="spinner-border text-primary"></div></div>;
    if (!page) return <div className="container py-5 mt-5 text-center"><h1>Page Not Found</h1></div>;

    return (
        <div className="container py-5 mt-5 animate-up">
            <h1 className="fw-black text-dark mb-5 border-bottom pb-3 text-primary letter-spacing-tight">{page.title}</h1>
            <div className="card shadow-2xl border-0 rounded-5 p-5 bg-white">
                <div className="page-content" dangerouslySetInnerHTML={{ __html: page.content }}></div>
            </div>
        </div>
    );
};

export default Page;
