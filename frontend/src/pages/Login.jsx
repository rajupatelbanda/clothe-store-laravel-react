import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        const loadingToast = toast.loading('Logging in...');
        try {
            const response = await api.post('/login', data);
            login(response.data.access_token, response.data.user);
            toast.success('Logged in successfully!', { id: loadingToast });
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed', { id: loadingToast });
        }
    };

    return (
        <div className="container py-5 mt-5 animate-up">
            <div className="row justify-content-center">
                <div className="col-md-5">
                    <div className="card shadow-2xl border-0 rounded-5 p-5 bg-white border border-light">
                        <div className="text-center mb-5">
                            <div className="bg-primary text-white p-3 d-inline-block rounded-circle mb-3 shadow-lg animate-pulse-slow">
                                <i className="bi bi-person-lock fs-1 px-1"></i>
                            </div>
                            <h2 className="fw-black text-dark letter-spacing-tight">Welcome Back</h2>
                            <p className="text-muted fw-bold">Login to manage your orders & wishlist</p>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="mb-4">
                                <label className="form-label fw-black small text-muted text-uppercase mb-2 letter-spacing-wide opacity-50">Email Address</label>
                                <input 
                                    type="email" 
                                    className={`form-control border-0 bg-light p-3 rounded-pill shadow-sm fw-bold ${errors.email ? 'is-invalid border border-danger' : ''}`} 
                                    {...register("email", { required: "Email is required" })} 
                                    placeholder="yourname@email.com"
                                />
                                {errors.email && <div className="invalid-feedback ps-3">{errors.email.message}</div>}
                            </div>
                            <div className="mb-5">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <label className="form-label fw-black small text-muted text-uppercase mb-0 letter-spacing-wide opacity-50">Password</label>
                                    <Link to="/forgot-password" style={{fontSize: '0.8rem'}} className="text-primary fw-bold text-decoration-none">Forgot?</Link>
                                </div>
                                <input 
                                    type="password" 
                                    className={`form-control border-0 bg-light p-3 rounded-pill shadow-sm fw-bold ${errors.password ? 'is-invalid border border-danger' : ''}`} 
                                    {...register("password", { required: "Password is required" })} 
                                    placeholder="••••••••"
                                />
                                {errors.password && <div className="invalid-feedback ps-3">{errors.password.message}</div>}
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg w-100 py-3 rounded-pill fw-black shadow-lg mb-4 text-uppercase">Sign In Now <i className="bi bi-box-arrow-in-right ms-2"></i></button>
                            <p className="text-center mb-0 mt-4 fw-bold">Don't have an account? <Link to="/register" className="text-primary text-decoration-none ms-1">Create Account</Link></p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
