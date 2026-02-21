import React, { useContext, useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const AdminLayout = ({ children, title = "Admin Panel" }) => {
    const { logout, user } = useContext(AuthContext);
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [settings, setSettings] = useState(null);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/settings');
                setSettings(response.data);
                if (response.data.site_name) document.title = `Admin | ${response.data.site_name}`;
                if (response.data.favicon) {
                    const link = document.getElementById("dynamic-favicon");
                    if (link) link.href = `http://localhost:8000/storage/${response.data.favicon}`;
                }
            } catch (error) {}
        };
        fetchSettings();
    }, []);

    // Simulated Preloader for route changes
    useEffect(() => {
        setIsPageLoading(true);
        const timer = setTimeout(() => setIsPageLoading(false), 300);
        return () => clearTimeout(timer);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/');
    };

    const menuItems = [
        { to: '/admin', end: true, icon: 'speedometer2', label: 'Dashboard' },
        { to: '/admin/stock', icon: 'graph-up-arrow', label: 'Stock' },
        { to: '/admin/banners', icon: 'image', label: 'Banners' },
        { to: '/admin/pages', icon: 'file-earmark-richtext', label: 'Pages' },
        { to: '/admin/categories', icon: 'grid-fill', label: 'Categories' },
        { to: '/admin/brands', icon: 'tag-fill', label: 'Brands' },
        { to: '/admin/products', icon: 'box-seam-fill', label: 'Products' },
        { to: '/admin/orders', icon: 'cart-check-fill', label: 'Orders' },
        { to: '/admin/coupons', icon: 'ticket-perforated-fill', label: 'Coupons' },
        { to: '/admin/reviews', icon: 'star-fill', label: 'Reviews' },
        { to: '/admin/users', icon: 'people-fill', label: 'Users' },
        { to: '/admin/system', icon: 'cpu-fill', label: 'System' },
        { to: '/admin/settings', icon: 'gear-fill', label: 'Settings' }
    ];

    return (
        <div className="container-fluid overflow-hidden bg-light min-vh-100 p-0">
            {/* Admin Preloader */}
            {isPageLoading && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-white" style={{ zIndex: 9999 }}>
                    <div className="bg-primary text-white p-4 rounded-5 shadow-lg mb-4">
                        <i className="bi bi-shield-fill fs-1"></i>
                    </div>
                    <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}></div>
                    <p className="mt-3 fw-black text-primary text-uppercase letter-spacing-widest">Securing System...</p>
                </div>
            )}

            <div className="d-flex">
                {/* Sidebar */}
                <div 
                    className={`vh-100 sticky-top overflow-auto shadow-lg ${isSidebarOpen ? 'col-12 col-sm-3 col-xl-2' : 'd-none'}`}
                    style={{ minWidth: isSidebarOpen ? '250px' : '0', backgroundColor: '#FF5E78' }}
                >
                    <div className="d-flex flex-column align-items-center align-items-sm-start px-4 pt-4 text-white h-100">
                        <Link to="/" className="d-flex align-items-center pb-4 mb-md-0 me-md-auto text-white text-decoration-none pt-4 w-100 border-bottom border-white border-opacity-10">
                            {settings?.logo ? (
                                <img src={`http://localhost:8000/storage/${settings.logo}`} alt="logo" height="35" className="me-2 rounded shadow-sm border border-white" />
                            ) : (
                                <div className="bg-primary text-white p-2 rounded-3 me-2 shadow-sm d-flex align-items-center justify-content-center" style={{width: '35px', height: '35px'}}>
                                    <i className="bi bi-shield-fill"></i>
                                </div>
                            )}
                            <span className="fs-5 d-none d-sm-inline fw-black">CLOTH ADMIN</span>
                        </Link>
                        
                        <ul className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start w-100 pt-4 list-unstyled">
                            {menuItems.map((item, idx) => (
                                <li className="nav-item w-100 mb-1" key={idx}>
                                    <NavLink 
                                        to={item.to} 
                                        end={item.end} 
                                        className={({ isActive }) => `nav-link d-flex align-items-center px-3 py-2 rounded-3 border-0 transition-all ${isActive ? 'bg-white text-primary shadow-sm' : 'text-white hover-bg-light-opacity'}`}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <i className={`fs-5 bi-${item.icon}`}></i> 
                                        <span className="ms-3 d-none d-sm-inline fw-bold">{item.label}</span>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                        
                        <div className="dropdown pb-5 w-100 mt-auto pt-4 border-top border-white border-opacity-20">
                            <a href="#" className="d-flex align-items-center text-white text-decoration-none dropdown-toggle p-2 rounded-pill hover-bg-light-opacity transition-all" id="adminDropdown" data-bs-toggle="dropdown">
                                <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=fff&color=FF5E78`} alt="admin" width="30" height="30" className="rounded-circle border border-white" />
                                <span className="d-none d-sm-inline mx-1 ms-2 fw-bold small text-white">Administrator</span>
                            </a>
                            <ul className="dropdown-menu dropdown-menu-light text-small shadow border-0 rounded-4 p-2 mb-2">
                                <li><Link className="dropdown-item rounded-3 py-2 fw-bold" to="/admin/profile"><i className="bi bi-person-circle me-2"></i>My Profile</Link></li>
                                <li><Link className="dropdown-item rounded-3 py-2 fw-bold" to="/"><i className="bi bi-shop me-2"></i>View Site</Link></li>
                                <li><hr className="dropdown-divider opacity-10" /></li>
                                <li><button className="dropdown-item rounded-3 py-2 text-danger fw-bold" onClick={handleLogout}><i className="bi bi-box-arrow-right me-2"></i>Sign Out</button></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-grow-1 overflow-auto vh-100">
                    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom py-3 px-4 shadow-sm sticky-top">
                        <button className="btn btn-light rounded-circle shadow-sm me-3 border" onClick={() => setSidebarOpen(!isSidebarOpen)}>
                            <i className={`bi bi-${isSidebarOpen ? 'text-indent-left' : 'list'} fs-4 text-primary`}></i>
                        </button>
                        <h5 className="mb-0 fw-black text-dark text-uppercase letter-spacing-tight">{title}</h5>
                        <div className="ms-auto d-flex align-items-center gap-3">
                            <span className="text-muted small d-none d-md-block">Signed in as <strong>{user?.name}</strong></span>
                            <Link to="/admin/profile" className="bg-light p-2 rounded-circle text-primary shadow-inner hover-scale transition-all"><i className="bi bi-person-badge"></i></Link>
                        </div>
                    </nav>
                    
                    <main className="p-4 p-lg-5 animate-up">
                        <div className="admin-content-wrapper">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
            
            <style>{`
                .hover-bg-light-opacity:hover {
                    background: rgba(255,255,255,0.1);
                    color: white !important;
                }
                .shadow-primary {
                    box-shadow: 0 4px 15px rgba(255, 94, 120, 0.4) !important;
                }
                .nav-link { text-decoration: none !important; border-bottom: none !important; }
            `}</style>
        </div>
    );
};

export default AdminLayout;
