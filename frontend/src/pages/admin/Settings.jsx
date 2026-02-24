import React, { useContext, useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import AdminLayout from './AdminLayout';

const Settings = () => {
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ site_name: '', email: '', phone: '', address: '', facebook: '', twitter: '', instagram: '' });
    const [logo, setLogo] = useState(null);
    const [favicon, setFavicon] = useState(null);
    const [currentLogo, setCurrentLogo] = useState(null);
    const [currentFavicon, setCurrentFavicon] = useState(null);

    useEffect(() => { fetchSettings(); }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/settings');
            if (response.data) {
                setFormData({
                    site_name: response.data.site_name || '',
                    email: response.data.email || '',
                    phone: response.data.phone || '',
                    address: response.data.address || '',
                    facebook: response.data.social_links?.facebook || '',
                    twitter: response.data.social_links?.twitter || '',
                    instagram: response.data.social_links?.instagram || ''
                });
                setCurrentLogo(response.data.logo);
                setCurrentFavicon(response.data.favicon);
            }
        } catch (error) { toast.error("Error fetching settings"); }
        setLoading(false);
    };

    const handleInputChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('site_name', formData.site_name);
        data.append('email', formData.email);
        data.append('phone', formData.phone);
        data.append('address', formData.address);
        if (logo) data.append('logo', logo);
        if (favicon) data.append('favicon', favicon);
        data.append('social_links[facebook]', formData.facebook);
        data.append('social_links[twitter]', formData.twitter);
        data.append('social_links[instagram]', formData.instagram);

        const loadToast = toast.loading('Saving global settings...');
        try {
            const response = await api.post('/admin/settings', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            setCurrentLogo(response.data.logo);
            setCurrentFavicon(response.data.favicon);
            toast.success('Settings updated!', { id: loadToast });
        } catch (error) { toast.error('Update failed', { id: loadToast }); }
    };

    return (
        <AdminLayout title="Identity & Configuration">
            <div className="card shadow-2xl border-0 rounded-5 p-5 animate-up bg-white">
                <form onSubmit={handleSubmit}>
                    <div className="row g-5">
                        {/* Branding */}
                        <div className="col-md-6 border-end border-light">
                            <h5 className="fw-black text-dark mb-4 text-uppercase">Brand Visuals</h5>
                            <div className="row g-4">
                                <div className="col-12">
                                    <label className="form-label fw-bold small text-muted">PRIMARY LOGO</label>
                                    <div className="d-flex align-items-center gap-4 bg-light p-3 rounded-4">
                                        <img src={currentLogo ? `${import.meta.env.VITE_STORAGE_URL}/${currentLogo}` : 'https://via.placeholder.com/100x40'} style={{maxHeight:'40px'}} className="rounded" />
                                        <input type="file" className="form-control form-control-sm border-0 bg-transparent shadow-none" onChange={(e)=>setLogo(e.target.files[0])} accept="image/*" />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <label className="form-label fw-bold small text-muted">FAVICON (16x16 / 32x32)</label>
                                    <div className="d-flex align-items-center gap-4 bg-light p-3 rounded-4">
                                        <img src={currentFavicon ? `${import.meta.env.VITE_STORAGE_URL}/${currentFavicon}` : 'https://via.placeholder.com/32'} style={{width:'32px', height:'32px'}} className="rounded shadow-sm" />
                                        <input type="file" className="form-control form-control-sm border-0 bg-transparent shadow-none" onChange={(e)=>setFavicon(e.target.files[0])} accept="image/*" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="col-md-6">
                            <h5 className="fw-black text-dark mb-4 text-uppercase">Store Meta</h5>
                            <div className="mb-4">
                                <label className="form-label fw-bold small text-muted">SITE TITLE</label>
                                <input type="text" name="site_name" className="form-control rounded-pill p-3 border-0 bg-light fw-bold" value={formData.site_name} onChange={handleInputChange} required />
                            </div>
                            <div className="mb-4">
                                <label className="form-label fw-bold small text-muted">SUPPORT EMAIL</label>
                                <input type="email" name="email" className="form-control rounded-pill p-3 border-0 bg-light fw-bold" value={formData.email} onChange={handleInputChange} />
                            </div>
                        </div>

                        <div className="col-12">
                            <hr className="opacity-10" />
                        </div>

                        {/* Social & Contact */}
                        <div className="col-md-4">
                            <label className="form-label fw-bold small text-muted">PHONE NUMBER</label>
                            <input type="text" name="phone" className="form-control rounded-pill p-3 border-0 bg-light fw-bold" value={formData.phone} onChange={handleInputChange} />
                        </div>
                        <div className="col-md-8">
                            <label className="form-label fw-bold small text-muted">OFFICE ADDRESS</label>
                            <input type="text" name="address" className="form-control rounded-pill p-3 border-0 bg-light fw-bold" value={formData.address} onChange={handleInputChange} />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label fw-bold small text-muted">FACEBOOK</label>
                            <input type="text" name="facebook" className="form-control rounded-pill p-3 border-0 bg-light fw-bold" value={formData.facebook} onChange={handleInputChange} />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fw-bold small text-muted">TWITTER</label>
                            <input type="text" name="twitter" className="form-control rounded-pill p-3 border-0 bg-light fw-bold" value={formData.twitter} onChange={handleInputChange} />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fw-bold small text-muted">INSTAGRAM</label>
                            <input type="text" name="instagram" className="form-control rounded-pill p-3 border-0 bg-light fw-bold" value={formData.instagram} onChange={handleInputChange} />
                        </div>
                    </div>
                    <div className="text-end mt-5 border-top pt-5 border-light">
                        <button type="submit" className="btn btn-primary btn-lg rounded-pill px-5 fw-black shadow-lg text-uppercase">PERSIST CONFIGURATION</button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default Settings;
