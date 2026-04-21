import { Check, Info, Wine } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import api from '../utils/api';
import { WhatsAppIcon } from '../components/Icons';
import { CONTENT_MAP } from '../components/ProductContent';
import { SkeletonCard } from '../components/SkeletonLoader';

import '../styles/ProductDetail.css';

const ProductDetail = () => {
    const navigate = useNavigate();
    const { productId } = useParams();
    const hasTrackedView = useRef(false);
    const [product, setProduct] = useState(null);
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const productRes = await api.get(`/api/products/${productId}`);
                setProduct(productRes.data);

                // Fetch categories to get the type name
                const categoryRes = await api.get('/api/categories');
                const matchedCat = categoryRes.data.find(c => c.productCategoryId === productRes.data.productCategoryId);
                setCategory(matchedCat);

                // Increment view count (once per mount)
                if (!hasTrackedView.current) {
                    api.patch(`/api/products/${productId}/view`).catch(err => console.error('View tracking failed', err));
                    hasTrackedView.current = true;
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [productId]);

    if (loading) {
        return (
            <div className="container section">
                <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                    <SkeletonCard />
                </div>
            </div>
        );
    }
    if (!product) return <div className="container" style={{ padding: '100px', textAlign: 'center' }}>Product not found.</div>;

    const content = CONTENT_MAP[category?.productType] || CONTENT_MAP['Default'];

    const whatsAppHandler = () => {
        const phoneNumber = "628991890269";
        window.open(
            `https://wa.me/${phoneNumber}?text=Hello,%20apakah%20${encodeURIComponent(product.productName)}%20ready?`,
            '_blank'
        );
    };

    return (
        <div className="container section">
            <button
                onClick={() => navigate(-1)}
                className="btn-back"
            >
                ← Back to Collection
            </button>

            <div className="detail-grid">
                {/* Image Section */}
                <div className="detail-image-box fade-in">
                    <img
                        src={product.productImage
                            ? (product.productImage.startsWith('http') ? product.productImage : `${import.meta.env.VITE_API_BASE_URL}/${product.productImage}`)
                            : 'https://static.thenounproject.com/png/26593-200.png'}
                        alt={product.productName}
                        className="detail-image"
                        onError={(e) => { e.target.src = 'https://static.thenounproject.com/png/26593-200.png'; }}
                    />
                </div>

                {/* Info Section */}
                <div className="detail-info fade-in">
                    <h1 className="detail-title">{product.productName}</h1>
                    <p className="detail-price">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.productPrice)}
                    </p>

                    <p className="detail-desc">
                        {content.desc(product.productName)}
                    </p>

                    <div className="detail-features">
                        <div className="feature-item">
                            <Check size={18} color="var(--accent)" />
                            <span>Premium Quality</span>
                        </div>
                        <div className="feature-item">
                            <Check size={18} color="var(--accent)" />
                            <span>Store Pickup</span>
                        </div>
                        <div className="feature-item">
                            <Check size={18} color="var(--accent)" />
                            <span>100% Authentic</span>
                        </div>
                        <div className="feature-item">
                            <Check size={18} color="var(--accent)" />
                            <span>Professional Handling</span>
                        </div>
                    </div>

                    <div className="detail-actions">
                        <button className="btn-whatsapp" onClick={whatsAppHandler}>
                            <WhatsAppIcon size={20} /> Contact via WhatsApp
                        </button>

                        <div className="marketplace-links">
                            <a href="https://www.blibli.com/merchant/the-wine-corner/THW-70022" target="_blank" rel="noopener noreferrer" className="btn-official-store">
                                Official Store via Blibli
                            </a>
                            <a href="https://www.tokopedia.com/thewinecornerid" target="_blank" rel="noopener noreferrer" className="btn-official-store">
                                Official Store via Tokopedia
                            </a>
                        </div>
                    </div>

                    <div className="tasting-notes">
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                            <Info size={18} color="var(--primary)" /> Sommelier's Notes
                        </h4>
                        <p style={{ fontStyle: 'italic', color: 'var(--text-light)', fontSize: '15px' }}>
                            "{content.notes}"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
