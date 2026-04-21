import axios from 'axios';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import SkeletonList from '../components/SkeletonLoader';

import '../styles/Explore.css';

const Explore = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/categories')
            .then(res => setCategories(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="container section">
                <div className="category-header">
                    <h1 className="category-title">Explore Our Collections</h1>
                    <p className="footer-text">Select a category to view our curated selection</p>
                    <div className="category-divider"></div>
                </div>
                <SkeletonList type="category" count={3} />
            </div>
        );
    }

    return (
        <div className="container section">
            <div className="category-header">
                <h1 className="category-title">Explore Our Collections</h1>
                <p className="footer-text">Select a category to view our curated selection</p>
                <div className="category-divider"></div>
            </div>

            <div className="explore-grid">
                {categories.map(cat => (
                    <Link
                        key={cat.productCategoryId}
                        to={cat.productPath}
                        className="category-card"
                    >
                        <div className="category-image-container">
                            <img
                                src={cat.image_path
                                    ? (cat.image_path.startsWith('http') ? cat.image_path : `${import.meta.env.VITE_API_BASE_URL}/${cat.image_path}`)
                                    : "https://upload.wikimedia.org/wikipedia/commons/a/a8/Common_alcoholic_beverages.jpg"
                                }
                                alt={cat.productType}
                                className="category-image"
                            />
                            <div className="category-overlay"></div>
                        </div>
                        <div className="category-content">
                            <h3 className="category-name-text">{cat.productType}</h3>
                            <div className="category-cta">View Collection</div>
                        </div>
                    </Link>
                ))}
            </div>

            {categories.length === 0 && (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '80px 40px', 
                    background: '#fff', 
                    borderRadius: '20px', 
                    boxShadow: 'var(--card-shadow)' 
                }}>
                    <div style={{ fontSize: '50px', marginBottom: '20px', opacity: 0.2 }}>🔍</div>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '10px' }}>No Collections Found</h2>
                    <p style={{ color: 'var(--text-light)', maxWidth: '400px', margin: '0 auto' }}>
                        We are currently updating our cellar. Please check back soon or contact us via WhatsApp for inquiries.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Explore;
