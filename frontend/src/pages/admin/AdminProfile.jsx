import React, { useContext, useState } from 'react';
import AdminLayout from './AdminLayout';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const AdminProfile = () => {
    const { user, login } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        const loadToast = toast.loading('Updating admin profile...');
        try {
            const response = await api.post('/user/profile', formData);
            login(localStorage.getItem('token'), response.data);
            toast.success('Profile updated!', { id: loadToast });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed', { id: loadToast });
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        const loadToast = toast.loading('Changing admin password...');
        try {
            await api.post('/user/change-password', passwordData);
            toast.success('Password changed!', { id: loadToast });
            setPasswordData({ current_password: '', password: '', password_confirmation: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Change failed', { id: loadToast });
        }
    };

    return (
        <AdminLayout title="My Administrator Profile">
            <div className="row g-5">
                <div className="col-md-6">
                    <div className="card shadow-2xl border-0 rounded-5 p-5 bg-white">
                        <h4 className="fw-black mb-4">Identity Details</h4>
                        <form onSubmit={handleProfileSubmit}>
                            <div className="mb-4">
                                <label className="form-label fw-bold small text-muted">FULL NAME</label>
                                <input type="text" className="form-control rounded-pill p-3 border-0 bg-light fw-bold" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                            </div>
                            <div className="mb-4">
                                <label className="form-label fw-bold small text-muted">WORK EMAIL</label>
                                <input type="email" className="form-control rounded-pill p-3 border-0 bg-light fw-bold" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                            </div>
                            <div className="mb-4">
                                <label className="form-label fw-bold small text-muted">PHONE</label>
                                <input type="text" className="form-control rounded-pill p-3 border-0 bg-light fw-bold" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
                            </div>
                            <button type="submit" className="btn btn-primary rounded-pill px-5 fw-black shadow-lg mt-3">SAVE CHANGES</button>
                        </form>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card shadow-2xl border-0 rounded-5 p-5 bg-white">
                        <h4 className="fw-black mb-4">Security Access</h4>
                        <form onSubmit={handlePasswordSubmit}>
                            <div className="mb-4">
                                <label className="form-label fw-bold small text-muted">CURRENT PASSWORD</label>
                                <input type="password" class="form-control rounded-pill p-3 border-0 bg-light" value={passwordData.current_password} onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})} required />
                            </div>
                            <div className="mb-4">
                                <label className="form-label fw-bold small text-muted">NEW ACCESS KEY</label>
                                <input type="password" class="form-control rounded-pill p-3 border-0 bg-light" value={passwordData.password} onChange={(e) => setPasswordData({...passwordData, password: e.target.value})} required />
                            </div>
                            <div className="mb-4">
                                <label className="form-label fw-bold small text-muted">CONFIRM NEW KEY</label>
                                <input type="password" class="form-control rounded-pill p-3 border-0 bg-light" value={passwordData.password_confirmation} onChange={(e) => setPasswordData({...passwordData, password_confirmation: e.target.value})} required />
                            </div>
                            <button type="submit" className="btn btn-dark rounded-pill px-5 fw-black shadow-lg mt-3">UPDATE SECURITY</button>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminProfile;
