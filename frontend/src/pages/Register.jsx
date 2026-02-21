import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

const Register = () => {
    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        const loadingToast = toast.loading('Creating your account...');
        try {
            const response = await api.post('/register', data);
            login(response.data.access_token, response.data.user);
            toast.success('Account created successfully!', { id: loadingToast });
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed', { id: loadingToast });
        }
    };

    return (
        <div className="container py-5 mt-5 animate-up">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow-2xl border-0 rounded-5 p-5 bg-white border border-light">
                        <div className="text-center mb-5">
                            <div className="bg-primary text-white p-3 d-inline-block rounded-circle mb-3 shadow-lg animate-pulse-slow">
                                <i className="bi bi-person-plus fs-1 px-1"></i>
                            </div>
                            <h2 className="fw-black text-dark letter-spacing-tight">Join Cloth Store</h2>
                            <p className="text-muted fw-bold">Become part of our exclusive fashion community</p>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="row g-4 mb-4">
                                <div className="col-md-12">
                                    <label className="form-label fw-black small text-muted text-uppercase mb-2 letter-spacing-wide opacity-50">Full Name</label>
                                    <input 
                                        type="text" 
                                        className={`form-control border-0 bg-light p-3 rounded-pill shadow-sm fw-bold ${errors.name ? 'is-invalid border border-danger' : ''}`} 
                                        {...register("name", { required: "Name is required" })} 
                                        placeholder="Alex Mercer"
                                    />
                                    {errors.name && <div className="invalid-feedback ps-3">{errors.name.message}</div>}
                                </div>
                                <div className="col-md-12">
                                    <label className="form-label fw-black small text-muted text-uppercase mb-2 letter-spacing-wide opacity-50">Email Address</label>
                                    <input 
                                        type="email" 
                                        className={`form-control border-0 bg-light p-3 rounded-pill shadow-sm fw-bold ${errors.email ? 'is-invalid border border-danger' : ''}`} 
                                        {...register("email", { required: "Email is required" })} 
                                        placeholder="alex@example.com"
                                    />
                                    {errors.email && <div className="invalid-feedback ps-3">{errors.email.message}</div>}
                                </div>
                                <div className="col-md-12">
                                    <label className="form-label fw-black small text-muted text-uppercase mb-2 letter-spacing-wide opacity-50">Phone Number</label>
                                    <input 
                                        type="text" 
                                        className={`form-control border-0 bg-light p-3 rounded-pill shadow-sm fw-bold ${errors.phone ? 'is-invalid border border-danger' : ''}`} 
                                        {...register("phone", { required: "Phone number is required" })} 
                                        placeholder="+91 XXXXXXXXXX"
                                    />
                                    {errors.phone && <div className="invalid-feedback ps-3">{errors.phone.message}</div>}
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-black small text-muted text-uppercase mb-2 letter-spacing-wide opacity-50">Password</label>
                                    <input 
                                        type="password" 
                                        className={`form-control border-0 bg-light p-3 rounded-pill shadow-sm fw-bold ${errors.password ? 'is-invalid border border-danger' : ''}`} 
                                        {...register("password", { required: "Password is required", minLength: { value: 8, message: "Min 8 characters" } })} 
                                        placeholder="••••••••"
                                    />
                                    {errors.password && <div className="invalid-feedback ps-3">{errors.password.message}</div>}
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-black small text-muted text-uppercase mb-2 letter-spacing-wide opacity-50">Confirm</label>
                                    <input 
                                        type="password" 
                                        className={`form-control border-0 bg-light p-3 rounded-pill shadow-sm fw-bold ${errors.password_confirmation ? 'is-invalid border border-danger' : ''}`} 
                                        {...register("password_confirmation", { 
                                            required: "Repeat password",
                                            validate: (val) => watch('password') === val || "Passwords don't match"
                                        })} 
                                        placeholder="••••••••"
                                    />
                                    {errors.password_confirmation && <div className="invalid-feedback ps-3">{errors.password_confirmation.message}</div>}
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg w-100 py-3 rounded-pill fw-black shadow-lg mb-4 text-uppercase">Register Account <i className="bi bi-arrow-right ms-2"></i></button>
                            <p className="text-center mb-0 mt-4 fw-bold">Already a member? <Link to="/login" className="text-primary text-decoration-none ms-1">Sign In Instead</Link></p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
