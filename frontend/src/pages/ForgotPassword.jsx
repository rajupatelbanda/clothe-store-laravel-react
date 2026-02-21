import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

const ForgotPassword = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data) => {
        setLoading(true);
        const loadingToast = toast.loading('Sending reset link...');
        try {
            const response = await api.post('/forgot-password', data);
            toast.success(response.data.message, { id: loadingToast });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong', { id: loadingToast });
        }
        setLoading(false);
    };

    return (
        <div className="container py-5 mt-5 animate-up">
            <div className="row justify-content-center">
                <div className="col-md-5">
                    <div className="card shadow-2xl border-0 rounded-5 p-5 bg-white border border-light">
                        <div className="text-center mb-5">
                            <div className="bg-primary text-white p-3 d-inline-block rounded-circle mb-3 shadow-lg">
                                <i className="bi bi-key-fill fs-1 px-1"></i>
                            </div>
                            <h2 className="fw-black text-dark letter-spacing-tight">Forgot Password?</h2>
                            <p className="text-muted fw-bold">Enter your email to receive a reset link</p>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="mb-5">
                                <label className="form-label fw-black small text-muted text-uppercase mb-2 letter-spacing-wide opacity-50">Email Address</label>
                                <input 
                                    type="email" 
                                    className={`form-control border-0 bg-light p-3 rounded-pill shadow-sm fw-bold ${errors.email ? 'is-invalid border border-danger' : ''}`} 
                                    {...register("email", { required: "Email is required" })} 
                                    placeholder="yourname@email.com"
                                />
                                {errors.email && <div className="invalid-feedback ps-3">{errors.email.message}</div>}
                            </div>
                            <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-100 py-3 rounded-pill fw-black shadow-lg mb-4 text-uppercase">
                                {loading ? 'Sending...' : 'Send Reset Link'} <i className="bi bi-send-fill ms-2"></i>
                            </button>
                            <div className="text-center mt-4 fw-bold">
                                <Link to="/login" className="text-primary text-decoration-none"><i className="bi bi-arrow-left me-2"></i>Back to Login</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
