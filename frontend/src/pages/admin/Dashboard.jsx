import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, revenue: '0.00' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/admin/stats');
                setStats(response.data);
            } catch (error) {
                console.error("Dashboard Fetch Error:", error);
                toast.error("Failed to load dashboard statistics");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <AdminLayout title="Admin Command Center">
            {loading ? (
                <div className="vh-50 d-flex flex-column align-items-center justify-content-center">
                    <div className="spinner-border text-primary mb-3" role="status" style={{width: '3rem', height: '3rem'}}></div>
                    <p className="text-muted fw-bold">Synchronizing Store Data...</p>
                </div>
            ) : (
                <div className="row g-5 mb-5 animate-up">
                    {[
                        { title: 'Total Registered Users', val: stats.users, icon: 'people-fill', bg: 'FF5E78' },
                        { title: 'Total Orders Placed', val: stats.orders, icon: 'bag-check-fill', bg: '2D2424' },
                        { title: 'Apparel in Stock', val: stats.products, icon: 'box-seam-fill', bg: 'FF5E78' },
                        { title: 'Low Stock Alerts', val: stats.low_stock, icon: 'exclamation-triangle-fill', bg: 'dc3545', link: '/admin/stock' },
                        { title: 'Net Store Revenue', val: `₹${stats.revenue}`, icon: 'currency-dollar', bg: '2D2424' }
                    ].map((s, idx) => (
                        <div className={idx === 4 ? "col-md-12 col-lg-4" : "col-md-6 col-lg-3"} key={idx}>
                            <div className={`card shadow-2xl border-0 h-100 p-4 hover-scale rounded-5 bg-white border border-light ${s.link ? 'cursor-pointer' : ''}`} onClick={() => s.link && (window.location.href = s.link)}>
                                <div className="card-body d-flex flex-column align-items-start">
                                    <div className={`text-white p-4 rounded-5 mb-4 shadow-lg`} style={{ backgroundColor: `#${s.bg}` }}>
                                        <i className={`bi bi-${s.icon} fs-1`}></i>
                                    </div>
                                    <h6 className="text-muted mb-2 fw-black text-uppercase letter-spacing-wide opacity-50 small">{s.title}</h6>
                                    <h2 className="mb-0 fw-black text-dark letter-spacing-tight fs-1">{s.val}</h2>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <div className="row g-5">
                <div className="col-md-8">
                    <div className="card shadow-2xl border-0 rounded-5 p-5 bg-white border border-light animate-fade">
                        <h4 className="fw-black text-dark mb-5 letter-spacing-tight">Management Shortcuts</h4>
                        <div className="row g-4">
                            {[
                                { to: '/admin/products', icon: 'plus-circle-fill', label: 'Add Apparel', color: 'primary' },
                                { to: '/admin/orders', icon: 'receipt-cutoff', label: 'Orders', color: 'dark' },
                                { to: '/admin/settings', icon: 'gear-fill', label: 'Config', color: 'primary' },
                                { to: '/admin/users', icon: 'person-badge-fill', label: 'Staff', color: 'dark' }
                            ].map((btn, idx) => (
                                <div className="col-6 col-md-3 text-center" key={idx}>
                                    <button onClick={() => window.location.href=btn.to} className="btn border-0 p-0 bg-transparent w-100">
                                        <div className={`bg-light text-dark p-4 rounded-5 mb-3 shadow-sm hover-scale transition-all d-flex align-items-center justify-content-center mx-auto`} style={{width: '80px', height: '80px'}}>
                                            <i className={`bi bi-${btn.icon} fs-2 text-${btn.color}`}></i>
                                        </div>
                                        <h6 className="fw-black text-dark small text-uppercase letter-spacing-wide">{btn.label}</h6>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card shadow-2xl border-0 rounded-5 p-5 h-100 bg-primary text-white shadow-primary animate-fade">
                        <div className="bg-white text-primary p-3 rounded-circle d-inline-block mb-4 shadow-lg scale-110">
                            <i className="bi bi-patch-question-fill fs-2 px-1"></i>
                        </div>
                        <h4 className="fw-black mb-3 letter-spacing-tight">Technical Support</h4>
                        <p className="mb-5 text-white-50 fw-bold small">System updates are automated. For API or Payment issues, contact the developer console.</p>
                        <button className="btn btn-white bg-white text-primary rounded-pill w-100 py-3 fw-black text-uppercase mt-auto shadow-lg transition-transform hover-scale">Contact Dev</button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
