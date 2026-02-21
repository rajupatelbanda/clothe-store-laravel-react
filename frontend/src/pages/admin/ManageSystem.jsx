import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const ManageSystem = () => {
    const [loading, setLoading] = useState(false);

    const backupDatabase = async () => {
        setLoading(true);
        const loadToast = toast.loading('Exporting Secure Database Backup...');
        try {
            const response = await api.post('/admin/system/backup');
            toast.success('Backup Created Successfully!', { id: loadToast });
            window.open(`${import.meta.env.VITE_API_URL}/admin/system/backup/download/${response.data.filename}?token=${localStorage.getItem('token')}`, '_blank');
        } catch (error) {
            toast.error("Backup process failed", { id: loadToast });
        } finally {
            setLoading(false);
        }
    };

    const clearCache = async (type) => {
        setLoading(true);
        const loadToast = toast.loading(`Clearing ${type} cache...`);
        try {
            await api.post(`/admin/system/cache/clear/${type}`);
            toast.success(`${type.toUpperCase()} Cache Purged!`, { id: loadToast });
        } catch (error) {
            toast.error("Cache purge failed", { id: loadToast });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout title="System Architecture">
            <div className="row g-5">
                <div className="col-md-6">
                    <div className="card shadow-2xl border-0 rounded-5 p-5 bg-white h-100 border-bottom border-primary border-4 border-opacity-10">
                        <div className="bg-light text-primary p-4 rounded-5 mb-4 d-inline-block shadow-sm">
                            <i className="bi bi-database-fill-check fs-1"></i>
                        </div>
                        <h4 className="fw-black mb-3 text-dark letter-spacing-tight">Database Safeguard</h4>
                        <p className="text-muted fw-bold small opacity-75 mb-5 uppercase letter-spacing-wide">Generate a point-in-time snapshot of your entire store data including orders, users, and inventory.</p>
                        <button className="btn btn-primary rounded-pill w-100 py-3 fw-black text-uppercase shadow-lg transition-transform hover-scale" onClick={backupDatabase} disabled={loading}>
                            <i className="bi bi-cloud-download-fill me-2"></i>CREATE & DOWNLOAD BACKUP
                        </button>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card shadow-2xl border-0 rounded-5 p-5 bg-white h-100 border-bottom border-warning border-4 border-opacity-10">
                        <div className="bg-light text-warning p-4 rounded-5 mb-4 d-inline-block shadow-sm">
                            <i className="bi bi-lightning-charge-fill fs-1"></i>
                        </div>
                        <h4 className="fw-black mb-3 text-dark letter-spacing-tight">Cache Optimization</h4>
                        <p className="text-muted fw-bold small opacity-75 mb-5 uppercase letter-spacing-wide">Flush compiled views, configuration, and application data to reflect recent structural changes.</p>
                        <div className="row g-3">
                            <div className="col-6">
                                <button className="btn btn-outline-dark rounded-pill w-100 py-2 fw-black small text-uppercase" onClick={() => clearCache('cache')} disabled={loading}>App Cache</button>
                            </div>
                            <div className="col-6">
                                <button className="btn btn-outline-dark rounded-pill w-100 py-2 fw-black small text-uppercase" onClick={() => clearCache('config')} disabled={loading}>Config</button>
                            </div>
                            <div className="col-6">
                                <button className="btn btn-outline-dark rounded-pill w-100 py-2 fw-black small text-uppercase" onClick={() => clearCache('view')} disabled={loading}>Views</button>
                            </div>
                            <div className="col-12">
                                <button className="btn btn-warning rounded-pill w-100 py-3 fw-black text-uppercase shadow-sm mt-2" onClick={() => clearCache('all')} disabled={loading}>
                                    <i className="bi bi-trash3-fill me-2"></i>PURGE ALL SYSTEM CACHE
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="card shadow-2xl border-0 rounded-5 p-5 bg-dark text-white overflow-hidden position-relative">
                        <div className="position-absolute top-0 end-0 p-5 opacity-10">
                            <i className="bi bi-terminal fs-huge" style={{fontSize: '150px'}}></i>
                        </div>
                        <div className="position-relative">
                            <h4 className="fw-black mb-3 letter-spacing-tight">Diagnostic Logs</h4>
                            <p className="text-white-50 fw-bold small mb-5 uppercase letter-spacing-wide">Monitor real-time system events, errors, and debug information.</p>
                            <button onClick={() => window.location.href='/admin/logs'} className="btn btn-outline-light rounded-pill px-5 py-3 fw-black text-uppercase transition-all hover-bg-white hover-text-dark">ACCESS LOG REPOSITORY</button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ManageSystem;
