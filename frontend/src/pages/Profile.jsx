import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import PageBanner from '../components/PageBanner';

const Profile = () => {
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
        const loadToast = toast.loading('Updating profile...');
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
        const loadToast = toast.loading('Changing password...');
        try {
            await api.post('/user/change-password', passwordData);
            toast.success('Password changed!', { id: loadToast });
            setPasswordData({ current_password: '', password: '', password_confirmation: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Change failed', { id: loadToast });
        }
    };

    return (
        <div className="animate-fade">
            <PageBanner page="profile" title="Member Account" />
            <div className="container py-4">
                <h1 className="fw-black text-dark mb-5 border-bottom pb-3 text-primary letter-spacing-tight">My Profile</h1>
                <div className="row g-5">
                    <div className="col-md-6">
                        <div className="card shadow-2xl border-0 rounded-5 p-5 bg-white">
                            <h4 className="fw-black mb-4">Account Information</h4>
                            <form onSubmit={handleProfileSubmit}>
                                <div className="mb-4">
                                    <label className="form-label fw-bold small text-muted">NAME</label>
                                    <input type="text" className="form-control rounded-pill p-3 border-0 bg-light" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label fw-bold small text-muted">EMAIL</label>
                                    <input type="email" className="form-control rounded-pill p-3 border-0 bg-light" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label fw-bold small text-muted">PHONE</label>
                                    <input type="text" className="form-control rounded-pill p-3 border-0 bg-light" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
                                </div>
                                <button type="submit" className="btn btn-primary rounded-pill px-5 fw-black shadow-lg mt-3">UPDATE PROFILE</button>
                            </form>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card shadow-2xl border-0 rounded-5 p-5 bg-white">
                            <h4 className="fw-black mb-4">Security</h4>
                            <form onSubmit={handlePasswordSubmit}>
                                <div className="mb-4">
                                    <label className="form-label fw-bold small text-muted">CURRENT PASSWORD</label>
                                    <input type="password" name="current_password" className="form-control rounded-pill p-3 border-0 bg-light" value={passwordData.current_password} onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})} required />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label fw-bold small text-muted">NEW PASSWORD</label>
                                    <input type="password" name="password" className="form-control rounded-pill p-3 border-0 bg-light" value={passwordData.password} onChange={(e) => setPasswordData({...passwordData, password: e.target.value})} required />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label fw-bold small text-muted">CONFIRM PASSWORD</label>
                                    <input type="password" name="password_confirmation" className="form-control rounded-pill p-3 border-0 bg-light" value={passwordData.password_confirmation} onChange={(e) => setPasswordData({...passwordData, password_confirmation: e.target.value})} required />
                                </div>
                                <button type="submit" className="btn btn-dark rounded-pill px-5 fw-black shadow-lg mt-3">CHANGE PASSWORD</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
