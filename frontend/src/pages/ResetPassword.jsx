import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            token: searchParams.get('token'),
            email: searchParams.get('email'),
        }
    });
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data) => {
        setLoading(true);
        const loadingToast = toast.loading('Resetting your password...');
        try {
            const response = await api.post('/reset-password', data);
            toast.success(response.data.message, { id: loadingToast });
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Token is invalid or expired', { id: loadingToast });
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
                                <i className="bi bi-shield-lock-fill fs-1 px-1"></i>
                            </div>
                            <h2 className="fw-black text-dark letter-spacing-tight">Reset Password</h2>
                            <p className="text-muted fw-bold">Enter your new security credentials</p>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <input type="hidden" {...register("token")} />
                            <input type="hidden" {...register("email")} />
                            
                            <div className="mb-4">
                                <label className="form-label fw-black small text-muted text-uppercase mb-2 letter-spacing-wide opacity-50">New Password</label>
                                <input 
                                    type="password" 
                                    className={`form-control border-0 bg-light p-3 rounded-pill shadow-sm fw-bold ${errors.password ? 'is-invalid border border-danger' : ''}`} 
                                    {...register("password", { required: "Password is required", minLength: { value: 8, message: "Min 8 characters" } })} 
                                    placeholder="••••••••"
                                />
                                {errors.password && <div className="invalid-feedback ps-3">{errors.password.message}</div>}
                            </div>

                            <div className="mb-5">
                                <label className="form-label fw-black small text-muted text-uppercase mb-2 letter-spacing-wide opacity-50">Confirm New Password</label>
                                <input 
                                    type="password" 
                                    className={`form-control border-0 bg-light p-3 rounded-pill shadow-sm fw-bold ${errors.password_confirmation ? 'is-invalid border border-danger' : ''}`} 
                                    {...register("password_confirmation", { 
                                        required: "Please confirm password",
                                        validate: (val) => watch('password') === val || "Passwords don't match"
                                    })} 
                                    placeholder="••••••••"
                                />
                                {errors.password_confirmation && <div className="invalid-feedback ps-3">{errors.password_confirmation.message}</div>}
                            </div>

                            <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-100 py-3 rounded-pill fw-black shadow-lg mb-4 text-uppercase">
                                {loading ? 'Processing...' : 'Reset Password'} <i className="bi bi-check-circle-fill ms-2"></i>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
