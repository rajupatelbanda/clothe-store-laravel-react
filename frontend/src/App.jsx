import React, { useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import api from './utils/api';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Wishlist from './pages/Wishlist';
import Page from './pages/Page';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import OrderTracking from './pages/OrderTracking';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageCategories from './pages/admin/ManageCategories';
import ManageBrands from './pages/admin/ManageBrands';
import ManageProducts from './pages/admin/ManageProducts';
import ManageOrders from './pages/admin/ManageOrders';
import ManageUsers from './pages/admin/ManageUsers';
import Settings from './pages/admin/Settings';
import AdminLogin from './pages/admin/AdminLogin';
import ManageBanners from './pages/admin/ManageBanners';
import AdminProfile from './pages/admin/AdminProfile';
import ManagePages from './pages/admin/ManagePages';
import ShowProduct from './pages/admin/ShowProduct';
import ManageCoupons from './pages/admin/ManageCoupons';
import ManageLogs from './pages/admin/ManageLogs';
import StockManagement from './pages/admin/StockManagement';
import ManageSystem from './pages/admin/ManageSystem';
import ManageReviews from './pages/admin/ManageReviews';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useContext(AuthContext);
    
    if (loading) return (
        <div className="vh-100 d-flex justify-content-center align-items-center">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
    if (!user) return <Navigate to="/login" />;
    if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;
    
    return children;
};

// Custom component to handle navbar/footer visibility
const Layout = ({ children }) => {
    const location = useLocation();
    const isAdminPath = location.pathname.startsWith('/admin');

    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const response = await api.get('/settings');
                if (response.data.site_name) document.title = response.data.site_name;
                if (response.data.favicon) {
                    const link = document.getElementById("dynamic-favicon");
                    if (link) link.href = `${import.meta.env.VITE_STORAGE_URL}/${response.data.favicon}`;
                }
            } catch (e) {}
        };
        fetchMeta();
    }, []);

    return (
        <div className="d-flex flex-column min-vh-100">
            {!isAdminPath && <Navbar />}
            <main className="flex-grow-1">
                {children}
            </main>
            {!isAdminPath && <Footer />}
            <Toaster position="top-right" />
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <WishlistProvider>
                    <Router>
                        <Layout>
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/shop" element={<Shop />} />
                                <Route path="/shop/:categorySlug" element={<Shop />} />
                                <Route path="/product/:slug" element={<ProductDetail />} />
                                <Route path="/cart" element={<Cart />} />
                                <Route path="/checkout" element={<Checkout />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route path="/reset-password" element={<ResetPassword />} />
                                <Route path="/wishlist" element={<Wishlist />} />
                                <Route path="/page/:slug" element={<Page />} />
                                
                                {/* Protected User Routes */}
                                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                                <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                                <Route path="/orders/:id/track" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
                                
                                {/* Admin Routes */}
                                <Route path="/admin/login" element={<AdminLogin />} />
                                <Route path="/admin" element={
                                    <ProtectedRoute adminOnly={true}>
                                        <AdminDashboard />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/categories" element={
                                    <ProtectedRoute adminOnly={true}>
                                        <ManageCategories />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/brands" element={
                                    <ProtectedRoute adminOnly={true}>
                                        <ManageBrands />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/products" element={
                                    <ProtectedRoute adminOnly={true}>
                                        <ManageProducts />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/product/:slug" element={
                                    <ProtectedRoute adminOnly={true}>
                                        <ShowProduct />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/orders" element={
                                    <ProtectedRoute adminOnly={true}>
                                        <ManageOrders />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/users" element={
                                    <ProtectedRoute adminOnly={true}>
                                        <ManageUsers />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/settings" element={
                                    <ProtectedRoute adminOnly={true}>
                                        <Settings />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/coupons" element={
                                    <ProtectedRoute adminOnly={true}>
                                        <ManageCoupons />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/logs" element={
                                    <ProtectedRoute adminOnly={true}>
                                        <ManageLogs />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/stock" element={
                                    <ProtectedRoute adminOnly={true}>
                                        <StockManagement />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/system" element={
                                    <ProtectedRoute adminOnly={true}>
                                        <ManageSystem />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/reviews" element={
                                    <ProtectedRoute adminOnly={true}>
                                        <ManageReviews />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/banners" element={
                                    <ProtectedRoute adminOnly={true}>
                                        <ManageBanners />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/pages" element={
                                    <ProtectedRoute adminOnly={true}>
                                        <ManagePages />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/profile" element={
                                    <ProtectedRoute adminOnly={true}>
                                        <AdminProfile />
                                    </ProtectedRoute>
                                } />
                            </Routes>
                        </Layout>
                    </Router>
                </WishlistProvider>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
