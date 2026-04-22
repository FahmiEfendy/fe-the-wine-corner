import api from '../utils/api';
import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import LoadingSpinner from '../components/LoadingSpinner';

import '../styles/Home.css';

const Home = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [placeholder, setPlaceholder] = useState('What shall we pour for you today?');

    useEffect(() => {
        const elegantPhrases = [
            "Seek the extraordinary in every bottle...",
            "Discover a vintage that speaks to you...",
            "Find the perfect accompaniment for your evening...",
            "Explore our curated cellar of fine spirits...",
            "Unveil the essence of world-class vineyards...",
            "What shall we pour for you today?"
        ];
        const randomPhrase = elegantPhrases[Math.floor(Math.random() * elegantPhrases.length)];
        setPlaceholder(randomPhrase);

        // Generate a seed that changes every hour (YYYY-MM-DD-HH)
        const date = new Date();
        const hourSeed = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;

        api.get(`/api/products?limit=6&sortBy=random&seed=${hourSeed}`)
            .then(res => setProducts(res.data.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            {/* Hero Section */}
            <div className="wine-gradient hero">
                <div className="container fade-in">
                    <h1 className="hero-title">Exquisite Wines for Every Moment</h1>
                    <p className="hero-subtitle">
                        Discover our curated collection of premium wines from the world's most renowned vineyards.
                    </p>

                    <form className="hero-search-container" onSubmit={handleSearch}>
                        <Search className="hero-search-icon" size={24} />
                        <input 
                            type="text" 
                            className="hero-search-input"
                            placeholder={placeholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit" className="hero-search-btn">Search</button>
                    </form>

                    <div className="hero-cta-group">
                        <Link to="/category" className="btn-primary">
                            Explore Collection
                        </Link>
                    </div>
                </div>
            </div>

            {/* Product Section */}
            <div className="container section">
                <div className="section-header">
                    <div>
                        <h2 className="section-title">Featured Selection</h2>
                        <p className="footer-text">Our sommelier's top picks for this season</p>
                    </div>
                </div>

                <div className="product-grid">
                    {products?.length > 0 ? (
                        products.map(product => (
                            <Link key={product.productId} to={`/product/${product.productId}`}>
                                <div className="product-card">
                                    <div className="product-image-container">
                                        <img
                                            src={product.productImage
                                                ? (product.productImage.startsWith('http') ? product.productImage : `${import.meta.env.VITE_API_BASE_URL}/${product.productImage}`)
                                                : 'https://static.thenounproject.com/png/26593-200.png'}
                                            alt={product.productName}
                                            className="product-image"
                                            onError={(e) => { e.target.src = 'https://static.thenounproject.com/png/26593-200.png'; }}
                                        />
                                    </div>
                                    <div className="product-info">
                                        <h3 className="product-name">{product.productName}</h3>
                                        <p className="product-price">
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.productPrice)}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="no-products">
                            <p>We're currently updating our selection. Please check back later for our latest curated bottles.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Home;
