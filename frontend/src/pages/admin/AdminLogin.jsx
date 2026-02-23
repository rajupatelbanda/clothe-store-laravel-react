import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const AdminLogin = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        const loadingToast = toast.loading('Authenticating admin...');
        try {
            console.log("Attempting Admin Login with:", data.email);
            const response = await api.post('/login', data);
            console.log("Admin Login Response:", response.data);
            
            if (response.data.user.role !== 'admin') {
                console.log("User is not an admin. Role:", response.data.user.role);
                toast.error('Unauthorized. This area is for administrators only.', { id: loadingToast });
                return;
            }
            
            login(response.data.access_token, response.data.user);
            toast.success('Admin login successful!', { id: loadingToast });
            console.log("Redirecting to /admin");
            navigate('/admin');
        } catch (error) {
            console.error("Admin Login Error:", error);
            toast.error(error.response?.data?.message || 'Login failed', { id: loadingToast });
        }
    };

    return (
        <div className="vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="card shadow-lg border-0 rounded-4 p-5 animate-up" style={{ width: '450px' }}>
                <div className="text-center mb-5">
                    <div className="bg-primary text-white p-3 d-inline-block rounded-circle mb-3 shadow">
                        <i className="bi bi-shield-lock fs-1 px-1"></i>
                    </div>
                    <h2 className="fw-black text-dark">Admin Access</h2>
                    <p className="text-muted">Enter administrative credentials to continue</p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <label className="form-label fw-bold small text-muted text-uppercase">Email</label>
                        <input 
                            type="email" 
                            className={`form-control border-0 bg-light p-3 rounded-pill ${errors.email ? 'is-invalid' : ''}`} 
                            {...register("email", { required: "Admin email is required" })} 
                            placeholder="admin@store.com"
                        />
                        {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                    </div>
                    <div className="mb-5">
                        <label className="form-label fw-bold small text-muted text-uppercase">Password</label>
                        <input 
                            type="password" 
                            className={`form-control border-0 bg-light p-3 rounded-pill ${errors.password ? 'is-invalid' : ''}`} 
                            {...register("password", { required: "Password is required" })} 
                            placeholder="••••••••"
                        />
                        {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                    </div>
                    <button type="submit" className="btn btn-primary w-100 py-3 fw-bold shadow-sm mb-4">Login to Admin Dashboard</button>
                    <div className="text-center">
                        <Link to="/" className="text-decoration-none text-muted small"><i className="bi bi-arrow-left me-2"></i>Back to Storefront</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
