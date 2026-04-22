import { useState, useEffect } from 'react';
import { Search, X, Menu } from 'lucide-react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';

import '../styles/Navbar.css';
import logo from '../assets/logo-wine-corner-min.jpg';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isHomePage = location.pathname === '/';

    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');

    useEffect(() => {
        setSearchTerm(searchParams.get('q') || '');
    }, [searchParams]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const currentQ = searchParams.get('q') || '';
            const trimmed = searchTerm.trim();
            if (trimmed && trimmed !== currentQ) {
                navigate(`/search?q=${encodeURIComponent(trimmed)}`);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, navigate, searchParams]);

    const handleClear = () => {
        setSearchTerm('');
        if (searchParams.get('q')) {
            navigate('/search'); // Or stay on current page but clear query
        }
    };

    return (
        <nav className="navbar">
            {/* Overlay to close menu when clicking outside */}
            <div
                className={`navbar-overlay ${isMenuOpen ? 'show' : ''}`}
                onClick={() => setIsMenuOpen(false)}
            ></div>

            <div className="container">
                <div className="navbar-brand">
                    <Link to="/" className="navbar-logo">
                        <img src={logo} alt="The Wine Corner" className="logo-img" />
                    </Link>

                    {/* Desktop Search Bar - Hide on Homepage */}
                    {!isHomePage ? (
                        <div className="navbar-search desktop-only">
                            <Search className="search-icon" size={18} />
                            <div className="search-input-wrapper">
                                <input
                                    type="text"
                                    placeholder="Search drinks..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button className="btn-clear-navbar" onClick={handleClear}>
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Quick Links for Homepage */
                        <div className="navbar-quick-links desktop-only">
                            <Link to="/red-wine" className="quick-link">Red Wine</Link>
                            <Link to="/white-wine" className="quick-link">White Wine</Link>
                            <Link to="/gin" className="quick-link">Gin</Link>
                            <Link to="/soju" className="quick-link">Soju</Link>
                            <Link to="/whiskey" className="quick-link">Whiskey</Link>
                        </div>
                    )}
                </div>

                <div className="navbar-controls">
                    <button className="navbar-hamburger" onClick={() => setIsMenuOpen(true)}>
                        <Menu size={28} />
                    </button>

                    <div className={`navbar-links ${isMenuOpen ? 'open' : ''}`}>
                        {/* Mobile Close Button */}
                        <button className="btn-close-drawer" onClick={() => setIsMenuOpen(false)}>
                            <X size={28} />
                        </button>

                        {/* Mobile Search Bar (Inside Drawer) */}
                        <div className="navbar-search mobile-only">
                            <Search className="search-icon" size={18} />
                            <div className="search-input-wrapper">
                                <input
                                    type="text"
                                    placeholder="Search drinks..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button className="btn-clear-navbar" onClick={handleClear}>
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <Link to="/" className="navbar-link home" onClick={() => setIsMenuOpen(false)}>Home</Link>
                        <Link to="/category" className="navbar-link explore" onClick={() => setIsMenuOpen(false)}>Explore</Link>
                        <a
                            href="https://linktr.ee/thewinecorner?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGnXxqHx076LNzkB0ujqMy5M3VtcgzAhGqkQJBShtbjHEB87oIKNqRDPEuYV04_aem_P6V4ODSZVhggPbb0liy8Jg"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="navbar-link contact"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Contact Us
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
