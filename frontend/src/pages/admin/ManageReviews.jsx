import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const ManageReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/reviews?admin=1');
            setReviews(response.data);
        } catch (error) {
            toast.error("Failed to fetch reviews");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/admin/reviews/${id}/status`, { is_approved: status });
            toast.success("Review status updated");
            fetchReviews();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const deleteReview = async (id) => {
        if (!window.confirm("Delete this review?")) return;
        try {
            await api.delete(`/admin/reviews/${id}`);
            toast.success("Review deleted");
            fetchReviews();
        } catch (error) {
            toast.error("Failed to delete review");
        }
    };

    return (
        <AdminLayout title="Product Feedback Analysis">
            <div className="card shadow-soft border-0 rounded-5 p-5 mb-5 bg-white border-bottom border-primary border-4 border-opacity-10">
                <div className="table-responsive">
                    {loading ? (
                        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                    ) : (
                        <table className="table align-middle">
                            <thead className="text-muted border-bottom text-uppercase small fw-black">
                                <tr>
                                    <th>AUTHOR</th>
                                    <th>PRODUCT</th>
                                    <th>RATING</th>
                                    <th>COMMENT</th>
                                    <th>STATUS</th>
                                    <th className="text-end">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-5 text-muted fw-bold">No feedback detected in repository</td></tr>
                                ) : (
                                    reviews.map(r => (
                                        <tr key={r.id} className="border-bottom">
                                            <td className="py-4">
                                                <div className="fw-black text-dark">{r.user?.name}</div>
                                                <small className="text-muted fw-bold">{r.user?.email}</small>
                                            </td>
                                            <td><small className="fw-black text-uppercase text-primary">{r.product?.name}</small></td>
                                            <td>
                                                <div className="text-warning">
                                                    {[...Array(5)].map((_, i) => (
                                                        <i key={i} className={`bi bi-star${i < r.rating ? '-fill' : ''}`}></i>
                                                    ))}
                                                </div>
                                            </td>
                                            <td><p className="small mb-0 text-muted fw-bold" style={{maxWidth: '300px'}}>{r.comment}</p></td>
                                            <td>
                                                <span className={`badge rounded-pill px-3 py-2 fw-black ${r.is_approved ? 'bg-success bg-opacity-10 text-success border border-success' : 'bg-warning bg-opacity-10 text-warning border border-warning'}`}>
                                                    {r.is_approved ? 'APPROVED' : 'PENDING'}
                                                </span>
                                            </td>
                                            <td className="text-end">
                                                {!r.is_approved ? (
                                                    <button className="btn btn-light rounded-circle p-2 me-2 shadow-sm text-success" onClick={() => updateStatus(r.id, true)} title="Approve">
                                                        <i className="bi bi-check-circle-fill fs-5"></i>
                                                    </button>
                                                ) : (
                                                    <button className="btn btn-light rounded-circle p-2 me-2 shadow-sm text-warning" onClick={() => updateStatus(r.id, false)} title="Unapprove">
                                                        <i className="bi bi-dash-circle-fill fs-5"></i>
                                                    </button>
                                                )}
                                                <button className="btn btn-light rounded-circle p-2 shadow-sm text-danger" onClick={() => deleteReview(r.id)} title="Delete">
                                                    <i className="bi bi-trash3-fill fs-5"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default ManageReviews;
