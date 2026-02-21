import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const ManageLogs = () => {
    const [logs, setLogs] = useState([]);
    const [selectedLog, setSelectedLog] = useState(null);
    const [logContent, setLogContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/system/logs');
            setLogs(response.data);
        } catch (error) {
            toast.error("Failed to fetch logs");
        } finally {
            setLoading(false);
        }
    };

    const viewLog = async (filename) => {
        const loadToast = toast.loading(`Reading ${filename}...`);
        try {
            const response = await api.get(`/admin/system/logs/${filename}`);
            setSelectedLog(filename);
            setLogContent(response.data.content);
            toast.dismiss(loadToast);
        } catch (error) {
            toast.error("Failed to read log file", { id: loadToast });
        }
    };

    const deleteLog = async (filename) => {
        if (!window.confirm(`Are you sure you want to delete ${filename}?`)) return;
        try {
            await api.delete(`/admin/system/logs/${filename}`);
            toast.success("Log file deleted");
            if (selectedLog === filename) {
                setSelectedLog(null);
                setLogContent('');
            }
            fetchLogs();
        } catch (error) {
            toast.error("Failed to delete log file");
        }
    };

    return (
        <AdminLayout title="System Logs">
            <div className="row g-4">
                <div className="col-md-4">
                    <div className="card shadow-soft border-0 rounded-5 p-4 bg-white h-100">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-black m-0">Log Files</h5>
                            <button className="btn btn-light btn-sm rounded-circle" onClick={fetchLogs}><i className="bi bi-arrow-clockwise"></i></button>
                        </div>
                        <div className="list-group list-group-flush">
                            {loading ? (
                                <div className="text-center py-4"><div className="spinner-border text-primary"></div></div>
                            ) : logs.length === 0 ? (
                                <p className="text-muted text-center py-4 small fw-bold">No logs found</p>
                            ) : (
                                logs.map((log, idx) => (
                                    <div key={idx} className={`list-group-item list-group-item-action border-0 rounded-4 mb-2 p-3 d-flex justify-content-between align-items-center cursor-pointer ${selectedLog === log.name ? 'bg-primary text-white shadow-primary' : 'bg-light text-dark'}`} onClick={() => viewLog(log.name)}>
                                        <div className="overflow-hidden">
                                            <h6 className="mb-1 fw-black text-truncate small">{log.name}</h6>
                                            <small className={`fw-bold opacity-75 ${selectedLog === log.name ? 'text-white' : 'text-muted'}`}>{log.size} • {log.last_modified}</small>
                                        </div>
                                        <button className={`btn btn-sm rounded-circle p-2 ${selectedLog === log.name ? 'btn-light text-danger' : 'btn-outline-danger'}`} onClick={(e) => { e.stopPropagation(); deleteLog(log.name); }}>
                                            <i className="bi bi-trash-fill"></i>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
                <div className="col-md-8">
                    <div className="card shadow-soft border-0 rounded-5 p-4 bg-dark text-light h-100" style={{ minHeight: '600px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary pb-3">
                            <h5 className="fw-black m-0 text-white">{selectedLog ? `Viewing: ${selectedLog}` : 'Log Viewer'}</h5>
                            {selectedLog && (
                                <button className="btn btn-outline-light btn-sm rounded-pill px-3 fw-bold" onClick={() => { setSelectedLog(null); setLogContent(''); }}>Close</button>
                            )}
                        </div>
                        <div className="flex-grow-1 overflow-auto bg-black rounded-4 p-4 font-monospace small" style={{ maxHeight: '600px', whiteSpace: 'pre-wrap' }}>
                            {logContent ? logContent : (
                                <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                                    <i className="bi bi-terminal fs-1 mb-3 opacity-25"></i>
                                    <p className="fw-bold uppercase letter-spacing-wide">Select a log file to view its content</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ManageLogs;
