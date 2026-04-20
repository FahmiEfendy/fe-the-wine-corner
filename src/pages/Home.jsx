import axios from 'axios';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

import LoadingSpinner from '../components/LoadingSpinner';

import '../styles/Home.css';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Generate a seed that changes every hour (YYYY-MM-DD-HH)
        const date = new Date();
        const hourSeed = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;

        axios.get(`/api/products?limit=6&sortBy=random&seed=${hourSeed}`)
            .then(res => setProducts(res.data.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

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
                    <Link to="/category" className="btn-primary">
                        Explore Collection
                    </Link>
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
                    {products.length > 0 ? (
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
