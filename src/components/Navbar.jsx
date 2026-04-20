import { Link } from 'react-router-dom';

import '../styles/Navbar.css';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="container">
                <Link to="/" className="navbar-logo">
                    TheWine<span>Corner</span>
                </Link>

                <div className="navbar-links">
                    <Link to="/" className="navbar-link">Home</Link>
                    <Link to="/category" className="navbar-link explore">Explore</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
